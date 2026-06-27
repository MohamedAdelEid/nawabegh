import axios from "axios";
import type { BackendApiResponse } from "@/shared/domain/types/api.types";

const AXIOS_STATUS_MESSAGE = /^Request failed with status code \d+$/;

export function getApiErrorMessage(
  response: Pick<BackendApiResponse<unknown>, "error" | "message"> | null | undefined,
  fallback: string,
): string {
  const message = response?.error?.message ?? response?.message;
  if (typeof message === "string" && message.trim()) return message.trim();
  return fallback;
}

export function extractApiErrorMessage(error: unknown, fallback = "Request failed"): string {
  if (axios.isAxiosError(error)) {
    const body = error.response?.data;
    if (body && typeof body === "object") {
      const apiMessage = getApiErrorMessage(body as BackendApiResponse<unknown>, "");
      if (apiMessage) return apiMessage;
    }

    const status = error.response?.status;
    if (status === 404) return fallback;
  }

  if (error instanceof Error) {
    const msg = error.message.trim();
    if (msg && !AXIOS_STATUS_MESSAGE.test(msg)) return msg;
  }

  return fallback;
}

export function isApiSuccess(response: BackendApiResponse<unknown>): boolean {
  if (response.isSuccess === false) return false;
  if (response.error?.message) return false;
  if (response.status === "Error") return false;
  if (response.isSuccess === true) return true;
  if (response.status === "Success") return true;
  if (response.hasValue === true) return true;
  if (Array.isArray(response.data)) return true;
  return response.data != null;
}

export function extractApiList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    for (const key of ["items", "records", "results", "data", "list"]) {
      const value = record[key];
      if (Array.isArray(value)) return value as T[];
    }
  }
  return [];
}

export function resolveApiList<T>(response: BackendApiResponse<unknown>): T[] {
  if (!isApiSuccess(response)) {
    throw new Error(
      response.error?.message ?? response.message ?? "Request failed",
    );
  }
  return extractApiList<T>(response.data);
}

export function resolveApiData<T>(response: BackendApiResponse<unknown>): T {
  if (!isApiSuccess(response)) {
    throw new Error(
      response.error?.message ?? response.message ?? "Request failed",
    );
  }
  if (response.data == null) {
    throw new Error("No data returned");
  }
  return response.data as T;
}
