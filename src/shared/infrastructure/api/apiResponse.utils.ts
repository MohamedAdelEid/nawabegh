import axios from "axios";
import type { BackendApiResponse } from "@/shared/domain/types/api.types";

const AXIOS_STATUS_MESSAGE = /^Request failed with status code \d+$/;

type ValidationErrorItem = { propertyName?: string; errorMessage?: string };
type ValidationErrorsInput =
  | Record<string, string[]>
  | ValidationErrorItem[]
  | null
  | undefined;

export class ApiRequestError extends Error {
  validationErrors?: ValidationErrorsInput;

  constructor(message: string, validationErrors?: ValidationErrorsInput) {
    super(message);
    this.name = "ApiRequestError";
    this.validationErrors = validationErrors;
  }
}

export function flattenValidationErrors(validationErrors: ValidationErrorsInput): string[] {
  if (!validationErrors) return [];

  if (Array.isArray(validationErrors)) {
    return validationErrors
      .map((item) => (typeof item?.errorMessage === "string" ? item.errorMessage : ""))
      .filter((item) => item.trim().length > 0);
  }

  if (typeof validationErrors !== "object") return [];

  return Object.values(validationErrors)
    .flatMap((items) => items)
    .filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

export function getApiErrorMessage(
  response: Pick<BackendApiResponse<unknown>, "error" | "message"> | null | undefined,
  fallback = "Request failed",
): string {
  const validationMessages = flattenValidationErrors(
    response?.error?.validationErrors as ValidationErrorsInput,
  );
  if (validationMessages.length > 0) return validationMessages.join("\n");

  const message = response?.error?.message ?? response?.message;
  if (typeof message === "string" && message.trim()) return message.trim();
  return fallback;
}

export function rejectApiResponse(response: BackendApiResponse<unknown>, fallback: string): never {
  const validationErrors = response.error?.validationErrors as ValidationErrorsInput;
  throw new ApiRequestError(getApiErrorMessage(response, fallback), validationErrors);
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
    throw new Error(getApiErrorMessage(response, "Request failed"));
  }
  return extractApiList<T>(response.data);
}

export function resolveApiData<T>(response: BackendApiResponse<unknown>): T {
  if (!isApiSuccess(response)) {
    throw new Error(getApiErrorMessage(response, "Request failed"));
  }
  if (response.data == null) {
    throw new Error("No data returned");
  }
  return response.data as T;
}
