import type { AxiosRequestConfig } from "axios";
import axiosClient from "./axiosClient";
import { applyRequestInterceptor, applyResponseInterceptor } from "./interceptors";
import { getToken } from "./tokenStore";

export type RequestOptions<TData = unknown> = {
  url: string;
  data?: TData;
  params?: Record<string, unknown>;
  paramsSerializer?: AxiosRequestConfig["paramsSerializer"];
  headers?: Record<string, string>;
  isFormData?: boolean;
  withCredentials?: boolean;
  timeout?: number;
};

type ApiResult<T> = {
  data?: T;
  message?: string;
  error?: { message: string };
};

function buildHeaders(
  custom?: Record<string, string>,
  isFormData?: boolean,
): Record<string, string> {
  const base: Record<string, string> = { ...custom };
  if (isFormData) base["Content-Type"] = "multipart/form-data";
  return base;
}

function buildConfig(options: Omit<RequestOptions, "url" | "data">) {
  return {
    params: options.params,
    ...(options.paramsSerializer != null && { paramsSerializer: options.paramsSerializer }),
    headers: buildHeaders(options.headers, options.isFormData),
    ...(options.withCredentials === true && { withCredentials: true }),
    ...(options.timeout != null && { timeout: options.timeout }),
  };
}

export function serializeRepeatParams(params: Record<string, unknown>): string {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      value.forEach((v) => sp.append(key, String(v)));
    } else {
      sp.append(key, String(value));
    }
  }
  return sp.toString();
}

let _onUnauthorized: (() => void) | undefined;

export function setOnUnauthorized(fn: () => void) {
  _onUnauthorized = fn;
}

applyRequestInterceptor(axiosClient, () => {
  if (typeof window !== "undefined") return sessionStorage.getItem("token");
  return null;
});

applyResponseInterceptor(axiosClient, () => _onUnauthorized?.());

async function get<T>(options: Omit<RequestOptions, "data" | "isFormData">): Promise<ApiResult<T>> {
  return axiosClient.get(options.url, buildConfig(options)) as Promise<ApiResult<T>>;
}

async function post<T>(options: RequestOptions): Promise<ApiResult<T>> {
  return axiosClient.post(options.url, options.data, buildConfig(options)) as Promise<ApiResult<T>>;
}

async function put<T>(options: RequestOptions): Promise<ApiResult<T>> {
  return axiosClient.put(options.url, options.data, buildConfig(options)) as Promise<ApiResult<T>>;
}

async function patch<T>(options: RequestOptions): Promise<ApiResult<T>> {
  return axiosClient.patch(options.url, options.data, buildConfig(options)) as Promise<ApiResult<T>>;
}

async function del<T>(options: RequestOptions): Promise<ApiResult<T>> {
  const { url, data, ...rest } = options;
  return axiosClient.delete(url, {
    ...buildConfig(rest),
    ...(data !== undefined ? { data } : {}),
  }) as Promise<ApiResult<T>>;
}

export const httpClient = { get, post, put, patch, delete: del };
