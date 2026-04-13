export type BackendStatus =
  | "Success"
  | "Error"
  | "BadRequest"
  | "NotFound"
  | "Unauthorized"
  | "Forbidden"
  | "Conflict";

export interface BackendValidationError {
  [field: string]: string[];
}

export interface BackendError {
  message: string;
  validationErrors: BackendValidationError | null;
  type: string;
}

export interface BackendApiResponse<TData> {
  data: TData | null;
  error: BackendError | null;
  status: BackendStatus | string;
  statusCode: BackendStatus | string | number;
  hasValue: boolean;
  message?: string;
}
