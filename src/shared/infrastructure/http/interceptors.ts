import type { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import {
  ApiRequestError,
  getApiErrorMessage,
} from "@/shared/infrastructure/api/apiResponse.utils";
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
    const method = (config.method ?? "get").toLowerCase();
    const isBinaryDownload =
      method === "get" && /\/api\/FileUpload\/download(?:\?|$)/i.test(requestUrl);

    // Never send the login token (or Accept-Language) to S3/CDN file hosts —
    // those headers break CORS / signed URL access for previews.
    if (isApiRequest) {
      const token = await getToken();
      if (token) config.headers.Authorization = `Bearer ${token}`;
      if (!config.headers["Accept-Language"] && getLanguage) {
        config.headers["Accept-Language"] = await getLanguage();
      }
      // Binary file GETs must not send Content-Type: application/json —
      // that triggers CORS preflight and breaks in-browser preview.
      if (isBinaryDownload) {
        delete config.headers["Content-Type"];
        delete config.headers["content-type"];
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
      const status = error.response?.status as number | undefined;
      if (status === 401) onUnauthorized();

      const body = error.response?.data;
      if (body && typeof body === "object") {
        const apiMessage = getApiErrorMessage(body, "");
        if (apiMessage) {
          const record = body as {
            errors?: unknown;
            error?: { validationErrors?: unknown };
          };
          const validationErrors =
            (record.error?.validationErrors as never) ??
            (record.errors as never) ??
            undefined;

          return Promise.reject(new ApiRequestError(apiMessage, validationErrors, status));
        }
      }

      return Promise.reject(error);
    },
  );
}
