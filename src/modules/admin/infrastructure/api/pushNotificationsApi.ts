import type { BackendApiResponse, BackendStatus } from "@/shared/domain/types/api.types";
import { httpClient } from "@/shared/infrastructure/http/httpClient";
import type {
  PushNotificationSendPayload,
  PushNotificationSendRoute,
} from "@/modules/admin/domain/types/sendNotification.types";

type UnknownRecord = Record<string, unknown>;

export type PushNotificationApiResult<T> = {
  status: BackendStatus | string;
  message?: string;
  errorMessage?: string;
  validationErrors?: Record<string, string[]> | null;
  data: T | null;
};

const ROUTE_PATH: Record<PushNotificationSendRoute, string> = {
  all: "/api/v1/admin/PushNotifications/send/all",
  "by-country": "/api/v1/admin/PushNotifications/send/by-country",
  "by-school": "/api/v1/admin/PushNotifications/send/by-school",
  "specific-users": "/api/v1/admin/PushNotifications/send/specific-users",
};

function asRecord(value: unknown): UnknownRecord | null {
  return value !== null && typeof value === "object" ? (value as UnknownRecord) : null;
}

function readString(record: UnknownRecord | null, keys: string[], fallback = ""): string {
  if (!record) return fallback;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string") return value;
  }
  return fallback;
}

function readNumber(record: UnknownRecord | null, keys: string[]): number | null {
  if (!record) return null;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
  }
  return null;
}

function mapHttpStatus(statusCode: number | null): BackendStatus | "Error" {
  switch (statusCode) {
    case 400:
      return "BadRequest";
    case 401:
      return "Unauthorized";
    case 403:
      return "Forbidden";
    case 404:
      return "NotFound";
    case 409:
      return "Conflict";
    default:
      return "Error";
  }
}

function buildErrorResult<T>(error: unknown, fallbackMessage: string): PushNotificationApiResult<T> {
  const axiosError = asRecord(error);
  const response = asRecord(axiosError?.response);
  const responseData = asRecord(response?.data);
  const dataEnvelope = responseData as BackendApiResponse<unknown> | null;
  const httpStatusCode = readNumber(response, ["status"]);

  const detailMessage =
    readString(responseData, ["detail", "title"], "") ||
    dataEnvelope?.error?.message ||
    (typeof axiosError?.message === "string" ? axiosError.message : fallbackMessage);

  return {
    status:
      (typeof dataEnvelope?.status === "string" ? dataEnvelope.status : undefined) ??
      mapHttpStatus(httpStatusCode),
    message: typeof dataEnvelope?.message === "string" ? dataEnvelope.message : undefined,
    errorMessage: detailMessage,
    validationErrors: dataEnvelope?.error?.validationErrors ?? null,
    data: null,
  };
}

function buildRequestBody(
  payload: PushNotificationSendPayload,
  route: PushNotificationSendRoute,
): Record<string, unknown> {
  const body: Record<string, unknown> = {
    title: payload.title,
    body: payload.body,
    targetAudience: payload.targetAudience,
    actionButtonText: payload.actionButtonText,
    actionUrl: payload.actionUrl,
    sendMobilePush: payload.sendMobilePush,
    sendInApp: payload.sendInApp,
    scheduledAtUtc: payload.scheduledAtUtc,
  };

  if (payload.countryIds) {
    body.countryIds = payload.countryIds;
  }
  if (payload.schoolIds) {
    body.schoolIds = payload.schoolIds;
  }
  if (route === "specific-users" && payload.specificUserIdentifiers) {
    body.specificUserIdentifiers = payload.specificUserIdentifiers;
  }

  return body;
}

export async function sendPushNotification(
  route: PushNotificationSendRoute,
  payload: PushNotificationSendPayload,
): Promise<PushNotificationApiResult<unknown>> {
  try {
    console.log(JSON.stringify(buildRequestBody(payload, route), null, 2));
    const response = await httpClient.post<unknown>({
      url: ROUTE_PATH[route],
      data: buildRequestBody(payload, route),
    });

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      validationErrors: response.error?.validationErrors ?? null,
      data: response.data ?? true,
    };
  } catch (error) {
    return buildErrorResult<unknown>(error, "Failed to send notification");
  }
}
