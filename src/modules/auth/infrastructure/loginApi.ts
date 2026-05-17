import { env } from "@/shared/infrastructure/config/env";
import type { LoginApiResponse, LoginCredentials } from "@/modules/auth/domain/types/login.types";
import { buildLoginPayload } from "./authSession";

/** Must match backend route (same version prefix as other clients, e.g. `userManagementApi`). */
const AUTH_LOGIN_PATH = "/api/v1/Auth/login";

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
