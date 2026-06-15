import type { BackendApiResponse, BackendStatus } from "@/shared/domain/types/api.types";
import { httpClient } from "@/shared/infrastructure/http/httpClient";
import type {
  CommunityPrivacyMode,
  CommunitySettings,
  CommunitySettingsUpdatePayload,
} from "@/modules/admin/domain/types/communitySettings.types";

const BASE = "/api/v1/admin/communitySettings";

export type CommunitySettingsApiResult<T> = {
  status: BackendStatus | string;
  message?: string;
  errorMessage?: string;
  validationErrors?: Record<string, string[]> | null;
  data: T | null;
};

type UnknownRecord = Record<string, unknown>;

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
    if (typeof value === "string" && value.trim() !== "" && !Number.isNaN(Number(value))) {
      return Number(value);
    }
  }
  return null;
}

function readBoolean(record: UnknownRecord | null, keys: string[], fallback = false): boolean {
  if (!record) return fallback;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "boolean") return value;
  }
  return fallback;
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

function buildErrorResult<T>(error: unknown, fallbackMessage: string): CommunitySettingsApiResult<T> {
  const axiosError = asRecord(error);
  const response = asRecord(axiosError?.response);
  const responseData = asRecord(response?.data) as BackendApiResponse<unknown> | null;
  const httpStatusCode = readNumber(response, ["status"]);

  return {
    status:
      (typeof responseData?.status === "string" ? responseData.status : undefined) ??
      mapHttpStatus(httpStatusCode),
    message: typeof responseData?.message === "string" ? responseData.message : undefined,
    errorMessage:
      responseData?.error?.message ??
      (typeof axiosError?.message === "string" ? axiosError.message : fallbackMessage),
    validationErrors: responseData?.error?.validationErrors ?? null,
    data: null,
  };
}

function mapCommunitySettings(item: unknown): CommunitySettings | null {
  const record = asRecord(item);
  if (!record) return null;

  const id = readString(record, ["id"]);
  if (!id) return null;

  const schoolIdRaw = record.schoolId;
  const schoolId =
    schoolIdRaw === null || schoolIdRaw === undefined
      ? null
      : readString(record, ["schoolId"], "");

  return {
    id,
    schoolId: schoolId === "" ? null : schoolId,
    privacyMode: (readNumber(record, ["privacyMode"]) ?? 0) as CommunityPrivacyMode,
    moderationMode: readNumber(record, ["moderationMode"]) ?? 0,
    enablePublishing: readBoolean(record, ["enablePublishing"], true),
    enableComments: readBoolean(record, ["enableComments"], true),
    enableLikes: readBoolean(record, ["enableLikes"], true),
    enableRatings: readBoolean(record, ["enableRatings"], true),
    enableFollowing: readBoolean(record, ["enableFollowing"], true),
    feedSortDefault: readNumber(record, ["feedSortDefault"]) ?? 0,
    updatedAt: readString(record, ["updatedAt"]),
    updatedByAdminId: readString(record, ["updatedByAdminId"]),
  };
}

function extractSettingsData(data: unknown): unknown {
  const record = asRecord(data);
  if (!record) return data;
  return record.data ?? data;
}

export async function getCommunitySettings(): Promise<CommunitySettingsApiResult<CommunitySettings>> {
  try {
    const response = await httpClient.get<unknown>({ url: BASE });
    const settings = mapCommunitySettings(extractSettingsData(response.data));

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      validationErrors: response.error?.validationErrors ?? null,
      data: settings,
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to load community settings");
  }
}

export async function updateCommunitySettings(
  payload: CommunitySettingsUpdatePayload,
): Promise<CommunitySettingsApiResult<CommunitySettings>> {
  try {
    const response = await httpClient.patch<unknown>({
      url: `${BASE}/update`,
      data: payload,
    });

    const settings = mapCommunitySettings(extractSettingsData(response.data));

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      validationErrors: response.error?.validationErrors ?? null,
      data: settings,
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to update community settings");
  }
}
