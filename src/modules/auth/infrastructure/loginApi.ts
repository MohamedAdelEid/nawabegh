import { env } from "@/shared/infrastructure/config/env";
import type {
  GoogleLoginCredentials,
  LoginApiResponse,
  LoginCredentials,
  RefreshTokenApiResponse,
} from "@/modules/auth/domain/types/login.types";
import { buildLoginPayload } from "./authSession";

/** Must match backend route (same version prefix as other clients, e.g. `userManagementApi`). */
const AUTH_LOGIN_PATH = "/api/v1/Auth/login";
const AUTH_GOOGLE_PATH = "/api/v1/Auth/google";
const AUTH_REFRESH_PATH = "/api/v1/Auth/refresh-token";
const AUTH_LOGOUT_PATH = "/api/v1/Auth/logout";

export async function loginWithCredentials(
  credentials: LoginCredentials,
  locale: "ar" | "en" = "ar",
): Promise<LoginApiResponse> {
  const baseUrl = env.NEXT_PUBLIC_API_URL.replace(/\/+$/, "");
  const response = await fetch(`${baseUrl}${AUTH_LOGIN_PATH}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Accept-Language": locale,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(buildLoginPayload(credentials)),
    cache: "no-store",
  });

  return response.json() as Promise<LoginApiResponse>;
}

export async function loginWithGoogle(
  credentials: GoogleLoginCredentials,
  locale: "ar" | "en" = "ar",
): Promise<LoginApiResponse> {
  const baseUrl = env.NEXT_PUBLIC_API_URL.replace(/\/+$/, "");
  const response = await fetch(`${baseUrl}${AUTH_GOOGLE_PATH}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Accept-Language": locale,
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      idToken: credentials.idToken,
      role: credentials.role,
    }),
    cache: "no-store",
  });

  let json: LoginApiResponse;
  try {
    json = (await response.json()) as LoginApiResponse;
  } catch {
    return {
      isSuccess: false,
      message:
        locale === "ar"
          ? "تعذر قراءة رد الخادم لتسجيل الدخول عبر Google."
          : "Unable to parse Google login response.",
      data: null,
      error: {
        message:
          locale === "ar"
            ? "رمز Google غير صالح أو منتهي الصلاحية"
            : "Google token is invalid or expired",
        validationErrors: null,
      },
    } as LoginApiResponse;
  }

  // Ensure failed HTTP statuses are treated as failure even if envelope is odd.
  if (!response.ok && json.isSuccess !== true) {
    return {
      ...json,
      isSuccess: false,
      message:
        json.message ??
        json.error?.message ??
        (locale === "ar"
          ? "رمز Google غير صالح أو منتهي الصلاحية"
          : "Google token is invalid or expired"),
    };
  }

  return json;
}

export async function refreshAuthToken(
  accessToken: string,
  refreshToken: string,
  locale: "ar" | "en" = "ar",
): Promise<RefreshTokenApiResponse> {
  const baseUrl = env.NEXT_PUBLIC_API_URL.replace(/\/+$/, "");
  const url = `${baseUrl}${AUTH_REFRESH_PATH}`;
  const headers = {
    Accept: "application/json",
    "Accept-Language": locale,
    "Content-Type": "application/json",
  };
  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      token: accessToken,
      refreshToken,
    }),
    cache: "no-store",
  });

  if (response.status === 400) {
    const fallbackResponse = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        accessToken,
        refreshToken,
      }),
      cache: "no-store",
    });
    return fallbackResponse.json() as Promise<RefreshTokenApiResponse>;
  }

  return response.json() as Promise<RefreshTokenApiResponse>;
}

export async function logoutFromBackend(
  accessToken?: string | null,
  refreshToken?: string | null,
  locale: "ar" | "en" = "ar",
): Promise<void> {
  const baseUrl = env.NEXT_PUBLIC_API_URL.replace(/\/+$/, "");
  await fetch(`${baseUrl}${AUTH_LOGOUT_PATH}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Accept-Language": locale,
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify({
      ...(refreshToken ? { refreshToken } : {}),
    }),
    cache: "no-store",
  });
}
