import type {
  AuthSessionPayload,
  AuthSessionUser,
  AuthTokenPayload,
  AuthTokenClaims,
  LoginApiData,
  LoginApiResponse,
  LoginCredentials,
  RefreshTokenApiResponse,
} from "@/modules/auth/domain/types/login.types";
import type { ConfirmEmailOtpData } from "@/modules/auth/domain/types/student-registration.types";
import type { BackendApiResponse } from "@/shared/domain/types/api.types";
import { ROUTES } from "@/shared/infrastructure/config/routes";

const NAME_CLAIM = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name";
const ID_CLAIM = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier";
const ROLE_CLAIM = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4;
  const padded = padding === 0 ? normalized : normalized.padEnd(normalized.length + (4 - padding), "=");
  return Buffer.from(padded, "base64").toString("utf-8");
}

export function decodeAuthTokenClaims(accessToken: string): AuthTokenClaims {
  try {
    const [, payload = ""] = accessToken.split(".");
    return JSON.parse(decodeBase64Url(payload)) as AuthTokenClaims;
  } catch {
    return {};
  }
}

export function normalizePhoneNumber(phoneNumber: string, countryCode = "+966") {
  const trimmed = phoneNumber.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("+")) return trimmed;

  const digits = trimmed.replace(/\D/g, "");
  if (!digits) return "";

  const normalizedCountryCode = countryCode.replace(/\D/g, "");
  const localNumber = digits.replace(/^0+/, "");
  return `+${normalizedCountryCode}${localNumber}`;
}

export function buildLoginPayload(credentials: LoginCredentials) {
  return {
    email: credentials.email.trim(),
    password: credentials.password,
  };
}

const DASHBOARD_ROLE_RANK: Record<string, number> = {
  Admin: 0,
  School: 1,
  Teacher: 2,
  Parent: 3,
  Student: 4,
};

const KNOWN_ROLES = ["Admin", "Student", "Teacher", "Parent", "School"] as const;

function normalizeApiRole(raw: string): string {
  const r = raw?.trim();
  if (!r) return "Student";
  const hit = KNOWN_ROLES.find((k) => k.toLowerCase() === r.toLowerCase());
  return hit ?? r;
}

/** When the API returns multiple roles, pick the highest-privilege dashboard role. */
function pickPrimaryRole(roles: string[] | undefined | null): string {
  if (roles == null || roles.length === 0) return "Student";
  let best = "Student";
  let bestRank = 99;
  for (const raw of roles) {
    const r = normalizeApiRole(raw);
    const rank = DASHBOARD_ROLE_RANK[r] ?? 50;
    if (rank < bestRank) {
      bestRank = rank;
      best = r;
    }
  }
  return best;
}

function mapNestedUserLogin(data: LoginApiData): AuthSessionPayload | null {
  const token = data.token;
  const apiUser = data.user;
  if (!token || !apiUser?.id) return null;

  const claims = decodeAuthTokenClaims(token);
  const claimRole = claims[ROLE_CLAIM] ?? claims.role;
  const roleCandidates =
    apiUser.roles && apiUser.roles.length > 0
      ? apiUser.roles
      : claimRole
        ? [claimRole]
        : ["Student"];
  const role = pickPrimaryRole(roleCandidates);

  const user: AuthSessionUser = {
    id: apiUser.id,
    domainUid: claims.domain_uid ?? null,
    name: apiUser.fullName ?? claims.name ?? claims[NAME_CLAIM] ?? "User",
    email: apiUser.email ?? claims.email ?? claims.sub ?? "",
    role,
    avatar: apiUser.photo ?? data.imageUrl ?? null,
  };

  return {
    user,
    accessToken: token,
    refreshToken: data.refreshToken ?? undefined,
    accessTokenExpiresAt: data.expiresAt ?? data.accessTokenExpiresAt ?? "",
  };
}

function mapLegacyFlatLogin(data: LoginApiData): AuthSessionPayload | null {
  const accessToken = data.accessToken;
  if (!accessToken) return null;

  const claims = decodeAuthTokenClaims(accessToken);
  const user: AuthSessionUser = {
    id: claims.uid ?? claims[ID_CLAIM] ?? claims.sub ?? "",
    domainUid: claims.domain_uid ?? null,
    name: data.fullName ?? claims.name ?? claims[NAME_CLAIM] ?? "User",
    email: claims.email ?? claims.sub ?? "",
    role: pickPrimaryRole([claims.role ?? claims[ROLE_CLAIM] ?? "Student"]),
    avatar: data.imageUrl ?? null,
  };

  return {
    user,
    accessToken,
    refreshToken: data.refreshToken ?? undefined,
    accessTokenExpiresAt: data.accessTokenExpiresAt ?? "",
  };
}

function isLoginEnvelopeFailed(response: LoginApiResponse): boolean {
  if (response.isSuccess === false) return true;
  if (response.hasValue === false) return true;
  return false;
}

export function mapConfirmOtpResponseToSession(
  data: ConfirmEmailOtpData,
): AuthSessionPayload | null {
  const token = data.token;
  const apiUser = data.user;
  if (!token || !apiUser?.id) return null;

  const claims = decodeAuthTokenClaims(token);
  const claimRole = claims[ROLE_CLAIM] ?? claims.role;
  const roleCandidates =
    apiUser.roles && apiUser.roles.length > 0
      ? apiUser.roles
      : claimRole
        ? [claimRole]
        : ["Student"];
  const role = pickPrimaryRole(roleCandidates);

  const user: AuthSessionUser = {
    id: apiUser.id,
    domainUid: claims.domain_uid ?? null,
    name: apiUser.fullName ?? claims.name ?? claims[NAME_CLAIM] ?? "User",
    email: apiUser.email ?? claims.email ?? claims.sub ?? "",
    role,
    avatar: apiUser.photo ?? null,
  };

  return {
    user,
    accessToken: token,
    refreshToken: data.refreshToken ?? undefined,
    accessTokenExpiresAt: data.expiresAt ?? "",
  };
}

export function mapLoginResponseToSession(response: LoginApiResponse): AuthSessionPayload | null {
  if (isLoginEnvelopeFailed(response) || response.data == null) return null;

  const data = response.data;
  if (data.token && data.user) {
    return mapNestedUserLogin(data);
  }
  if (data.accessToken) {
    return mapLegacyFlatLogin(data);
  }
  return null;
}

export function mapRefreshResponseToTokens(
  response: RefreshTokenApiResponse,
  fallbackRefreshToken?: string,
): AuthTokenPayload | null {
  if (isLoginEnvelopeFailed(response) || response.data == null) return null;

  const data = response.data;
  const accessToken = data.token ?? data.accessToken;
  if (!accessToken) return null;

  return {
    accessToken,
    refreshToken: data.refreshToken ?? fallbackRefreshToken,
    accessTokenExpiresAt: data.expiresAt ?? data.accessTokenExpiresAt ?? "",
  };
}

export function getAuthErrorMessage(response: BackendApiResponse<unknown> & { status?: string | number }) {
  if (response.error?.message) return response.error.message;
  if (response.message) return response.message;
  if (response.statusCode === "Unauthorized" || response.status === "Unauthorized") {
    return "Invalid email or password.";
  }
  return "Unable to sign in right now.";
}

export function getRedirectPathForRole(role?: string | null) {
  const r = role ? normalizeApiRole(role) : "Student";
  if (r === "Admin") return ROUTES.ADMIN.HOME;
  if (r === "School") return ROUTES.USER.SCHOOL.HOME;
  if (r === "Teacher") return ROUTES.USER.TEACHER.HOME;
  if (r === "Parent") return ROUTES.USER.PARENT.HOME;
  return ROUTES.USER.STUDENT.HOME;
}

export function getSettingsPathForRole(role?: string | null) {
  const r = role ? normalizeApiRole(role) : "Student";
  if (r === "Admin") return ROUTES.ADMIN.SETTINGS;
  if (r === "School") return ROUTES.USER.SCHOOL.SETTINGS;
  if (r === "Teacher") return ROUTES.USER.TEACHER.SETTINGS;
  if (r === "Parent") return ROUTES.USER.PARENT.SETTINGS;
  return ROUTES.USER.STUDENT.SETTINGS;
}
