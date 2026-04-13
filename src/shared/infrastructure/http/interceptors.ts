import type { AxiosInstance } from "axios";

export function applyRequestInterceptor(
  client: AxiosInstance,
  getToken: () => Promise<string | null> | string | null,
  getLanguage?: () => string,
) {
  client.interceptors.request.use(async (config) => {
    const token = await getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    if (!config.headers["Accept-Language"] && getLanguage) {
      config.headers["Accept-Language"] = getLanguage();
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
      return Promise.reject(error);
    },
  );
}
