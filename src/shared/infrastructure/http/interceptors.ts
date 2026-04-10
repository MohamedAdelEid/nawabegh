import type { AxiosInstance } from "axios";

export function applyRequestInterceptor(
  client: AxiosInstance,
  getToken: () => string | null,
) {
  client.interceptors.request.use((config) => {
    const token = getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
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
