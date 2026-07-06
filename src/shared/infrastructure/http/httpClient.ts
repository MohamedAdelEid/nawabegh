import type { AxiosRequestConfig, AxiosResponseHeaders, RawAxiosResponseHeaders } from "axios";
import axiosClient from "./axiosClient";
import { applyRequestInterceptor, applyResponseInterceptor } from "./interceptors";
import { resolveApiUrl } from "./resolveApiUrl";
import { getRequestLanguage, getToken } from "./tokenStore";
import type { BackendApiResponse } from "@/shared/domain/types/api.types";

export type HttpClientResponse<T> = BackendApiResponse<T> & {
  headers: Record<string, string | undefined>;
};

function toHeaderRecord(
  headers: AxiosResponseHeaders | RawAxiosResponseHeaders,
): Record<string, string | undefined> {
  const record: Record<string, string | undefined> = {};

  if (typeof headers !== "object" || headers === null) {
    return record;
  }

  for (const [key, value] of Object.entries(headers)) {
    if (value === undefined || value === null) continue;
    record[key.toLowerCase()] = Array.isArray(value) ? value.join(",") : String(value);
  }

  return record;
}

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
  return getToken();
}, getRequestLanguage);

applyResponseInterceptor(axiosClient, () => _onUnauthorized?.());

async function unwrap<T>(
  request: Promise<{ data: BackendApiResponse<T> }>,
): Promise<BackendApiResponse<T>> {
  const { data } = await request;
  return data;
}

function withResolvedUrl<T extends RequestOptions>(options: T): T {
  return { ...options, url: resolveApiUrl(options.url) };
}

async function get<T>(
  options: Omit<RequestOptions, "data" | "isFormData">,
): Promise<HttpClientResponse<T>> {
  const response = await axiosClient.get<BackendApiResponse<T>>(
    withResolvedUrl(options).url,
    buildConfig(options),
  );

  return {
    ...response.data,
    headers: toHeaderRecord(response.headers),
  };
}

async function post<T>(options: RequestOptions): Promise<BackendApiResponse<T>> {
  const resolved = withResolvedUrl(options);
  return unwrap(axiosClient.post(resolved.url, resolved.data, buildConfig(resolved)));
}

async function put<T>(options: RequestOptions): Promise<BackendApiResponse<T>> {
  const resolved = withResolvedUrl(options);
  return unwrap(axiosClient.put(resolved.url, resolved.data, buildConfig(resolved)));
}

async function patch<T>(options: RequestOptions): Promise<BackendApiResponse<T>> {
  const resolved = withResolvedUrl(options);
  return unwrap(axiosClient.patch(resolved.url, resolved.data, buildConfig(resolved)));
}

async function del<T>(options: RequestOptions): Promise<BackendApiResponse<T>> {
  const resolved = withResolvedUrl(options);
  const { url, data, ...rest } = resolved;
  return unwrap(
    axiosClient.delete(url, {
      ...buildConfig(rest),
      ...(data !== undefined ? { data } : {}),
    }),
  );
}

export const httpClient = { get, post, put, patch, delete: del };
export { resolveApiUrl };
