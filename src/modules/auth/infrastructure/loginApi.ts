import { env } from "@/shared/infrastructure/config/env";
import type {
  LoginApiResponse,
  LoginCredentials,
  RefreshTokenApiResponse,
} from "@/modules/auth/domain/types/login.types";
import { buildLoginPayload } from "./authSession";

/** Must match backend route (same version prefix as other clients, e.g. `userManagementApi`). */
const AUTH_LOGIN_PATH = "/api/v1/Auth/login";
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
