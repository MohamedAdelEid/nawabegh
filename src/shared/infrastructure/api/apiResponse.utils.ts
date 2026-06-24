import type { BackendApiResponse } from "@/shared/domain/types/api.types";

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
  response: BackendApiResponse<unknown>,
  fallback = "Request failed",
): string {
  const validationMessages = flattenValidationErrors(
    response.error?.validationErrors as ValidationErrorsInput,
  );
  if (validationMessages.length > 0) return validationMessages.join("\n");
  return response.error?.message?.trim() || response.message?.trim() || fallback;
}

export function rejectApiResponse(response: BackendApiResponse<unknown>, fallback: string): never {
  const validationErrors = response.error?.validationErrors as ValidationErrorsInput;
  throw new ApiRequestError(getApiErrorMessage(response, fallback), validationErrors);
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
