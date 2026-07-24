import type { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { getApiErrorMessage } from "@/shared/infrastructure/api/apiResponse.utils";
import type { BackendApiResponse } from "@/shared/domain/types/api.types";
import { env } from "@/shared/infrastructure/config/env";
import { isApiHostedUrl } from "@/shared/infrastructure/files/fileUrl";

function resolveRequestUrl(config: InternalAxiosRequestConfig): string {
  const base = (config.baseURL || env.NEXT_PUBLIC_API_URL).replace(/\/+$/, "");
  const path = config.url ?? "";
  try {
    return new URL(path, `${base}/`).toString();
  } catch {
    return path;
  }
}

export function applyRequestInterceptor(
  client: AxiosInstance,
  getToken: () => Promise<string | null> | string | null,
  getLanguage?: () => string | Promise<string>,
) {
  client.interceptors.request.use(async (config) => {
    const requestUrl = resolveRequestUrl(config);
    const isApiRequest = isApiHostedUrl(requestUrl);

    // Never send the login token (or Accept-Language) to S3/CDN file hosts —
    // those headers break CORS / signed URL access for previews.
    if (isApiRequest) {
      const token = await getToken();
      if (token) config.headers.Authorization = `Bearer ${token}`;
      if (!config.headers["Accept-Language"] && getLanguage) {
        config.headers["Accept-Language"] = await getLanguage();
      }
    } else {
      delete config.headers.Authorization;
      delete config.headers["Accept-Language"];
      // Instance default Content-Type: application/json also trips S3 CORS.
      delete config.headers["Content-Type"];
    }

    return config;
  });
}

export function applyResponseInterceptor(
  client: AxiosInstance,
  onUnauthorized: () => void,
) {
  client.interceptors.response.use(
    (res) => res,
    (error) => {
      if (error.response?.status === 401) onUnauthorized();

      const body = error.response?.data;
      if (body && typeof body === "object") {
        const apiMessage = getApiErrorMessage(body as BackendApiResponse<unknown>, "");
        if (apiMessage) return Promise.reject(new Error(apiMessage));
      }

      return Promise.reject(error);
    },
  );
}
