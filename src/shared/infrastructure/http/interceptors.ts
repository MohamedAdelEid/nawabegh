import type { AxiosInstance } from "axios";
import { getApiErrorMessage } from "@/shared/infrastructure/api/apiResponse.utils";
import type { BackendApiResponse } from "@/shared/domain/types/api.types";

export function applyRequestInterceptor(
  client: AxiosInstance,
  getToken: () => Promise<string | null> | string | null,
  getLanguage?: () => string | Promise<string>,
) {
  client.interceptors.request.use(async (config) => {
    const token = await getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    if (!config.headers["Accept-Language"] && getLanguage) {
      config.headers["Accept-Language"] = await getLanguage();
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
