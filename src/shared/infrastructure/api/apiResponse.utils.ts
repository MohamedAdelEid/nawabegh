import type { BackendApiResponse } from "@/shared/domain/types/api.types";

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
