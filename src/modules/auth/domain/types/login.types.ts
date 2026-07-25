import type { BackendApiResponse } from "@/shared/domain/types/api.types";

export type LoginCredentials = {
  email: string;
  password: string;
};

/** Roles allowed for Google sign-in (`POST /api/v1/Auth/google`). */
export type GoogleAuthRole = "Student" | "Parent";

export type GoogleLoginCredentials = {
  idToken: string;
  role: GoogleAuthRole;
};

/** User object returned inside `data` from `POST /api/v1/Auth/login`. */
export type LoginApiUser = {
  id: string;
  fullName?: string | null;
  email?: string | null;
  photo?: string | null;
  phoneNumber?: string | null;
  roles?: string[];
  requiresProfileCompletion?: boolean;
  countryId?: number | null;
};

/**
 * Login success body — supports current backend (`user` + `token` + `expiresAt`)
 * and an optional legacy flat token shape.
 */
export type LoginApiData = {
  user?: LoginApiUser;
  token?: string;
  expiresAt?: string;
  refreshToken?: string | null;
  accessToken?: string;
  accessTokenExpiresAt?: string;
  imageUrl?: string | null;
  fullName?: string | null;
};

export type LoginApiResponse = BackendApiResponse<LoginApiData> & {
  isSuccess?: boolean;
  status?: string | number;
};

export type RefreshTokenApiData = {
  token?: string;
  accessToken?: string;
  expiresAt?: string;
  accessTokenExpiresAt?: string;
  refreshToken?: string | null;
};

export type RefreshTokenApiResponse = BackendApiResponse<RefreshTokenApiData> & {
  isSuccess?: boolean;
  status?: string | number;
};

export type AuthTokenPayload = {
  accessToken: string;
  refreshToken?: string;
  accessTokenExpiresAt: string;
};

export type AuthSessionUser = {
  id: string;
  domainUid?: string | null;
  name: string;
  email: string;
  role: string;
  avatar?: string | null;
};

export type AuthTokenClaims = {
  sub?: string;
  email?: string;
  uid?: string;
  exp?: number;
  domain_uid?: string;
  name?: string;
  role?: string;
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"?: string;
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"?: string;
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"?: string;
};

export type AuthSessionPayload = {
  user: AuthSessionUser;
  accessToken: string;
  refreshToken?: string;
  accessTokenExpiresAt: string;
};
