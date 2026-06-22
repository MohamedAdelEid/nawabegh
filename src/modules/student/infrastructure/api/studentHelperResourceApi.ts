import type { BackendApiResponse, BackendStatus } from "@/shared/domain/types/api.types";
import { httpClient } from "@/shared/infrastructure/http/httpClient";
import type {
  HelperResourceReadingProgressDto,
  ResourceFileMediaKind,
  StudentAccessPolicy,
  StudentHelperResourceFileDto,
  StudentHelperResourceStationDto,
} from "../../domain/types/helperResource.types";

type UnknownRecord = Record<string, unknown>;

export type StudentHelperResourceApiResult<T> = {
  status: BackendStatus | string;
  message?: string;
  errorMessage?: string;
  data: T | null;
};

function asRecord(value: unknown): UnknownRecord | null {
  return value !== null && typeof value === "object" ? (value as UnknownRecord) : null;
}

function readString(record: UnknownRecord | null, keys: string[], fallback = ""): string {
  if (!record) return fallback;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string") return value;
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
  }
  return fallback;
}

function readNumber(record: UnknownRecord | null, keys: string[], fallback?: number): number | null {
  if (!record) return fallback ?? null;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() !== "" && !Number.isNaN(Number(value))) {
      return Number(value);
    }
  }
  return fallback ?? null;
}

function extractEnvelopeData(data: unknown): unknown {
  const record = asRecord(data);
  return record?.data ?? data;
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

function buildErrorResult<T>(error: unknown, fallbackMessage: string): StudentHelperResourceApiResult<T> {
  const axiosError = asRecord(error);
  const response = asRecord(axiosError?.response);
  const responseData = asRecord(response?.data);
  const dataEnvelope = responseData as BackendApiResponse<unknown> | null;
  const httpStatusCode = response ? readNumber(response, ["status"], 0) : null;

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
    data: null,
  };
}

function mapReadingProgress(item: unknown): HelperResourceReadingProgressDto | null {
  const record = asRecord(item);
  if (!record) return null;
  const resourceFileId = readString(record, ["resourceFileId"], "");
  if (!resourceFileId) return null;
  return {
    resourceFileId,
    readPercentage: readNumber(record, ["readPercentage"]) ?? 0,
    lastPageOrSlide: readNumber(record, ["lastPageOrSlide"]) ?? 0,
    lastSyncedAt: readString(record, ["lastSyncedAt"], ""),
  };
}

function mapStudentHelperResourceFile(item: unknown): StudentHelperResourceFileDto | null {
  const record = asRecord(item);
  if (!record) return null;
  const id = readString(record, ["id"], "");
  if (!id) return null;
  return {
    id,
    fileName: readString(record, ["fileName"], ""),
    fileUrl: readString(record, ["fileUrl"], ""),
    thumbnailUrl: readString(record, ["thumbnailUrl"], "") || null,
    fileType: readString(record, ["fileType"], ""),
    mediaKind: readString(record, ["mediaKind"], "") as ResourceFileMediaKind,
    category: readString(record, ["category"], "") || null,
    fileSizeBytes: readNumber(record, ["fileSizeBytes"]),
    accessPolicy: readString(record, ["accessPolicy"], "") as StudentAccessPolicy,
    createdAt: readString(record, ["createdAt"], "") || null,
    readingProgress: record.readingProgress ? mapReadingProgress(record.readingProgress) : null,
  };
}

function mapStudentHelperResourceStation(data: unknown): StudentHelperResourceStationDto | null {
  const record = asRecord(extractEnvelopeData(data));
  if (!record) return null;
  const stationId = readString(record, ["stationId"], "");
  if (!stationId) return null;

  const filesRaw = record.files;
  const files = Array.isArray(filesRaw)
    ? filesRaw
        .map(mapStudentHelperResourceFile)
        .filter((f): f is StudentHelperResourceFileDto => f !== null)
    : [];

  return {
    stationId,
    stationName: readString(record, ["stationName"], ""),
    learningPathTitle: readString(record, ["learningPathTitle"], ""),
    files,
  };
}

export async function getStudentHelperResourceStation(
  stationId: string,
  params?: { mediaKind?: ResourceFileMediaKind; category?: string },
): Promise<StudentHelperResourceApiResult<StudentHelperResourceStationDto>> {
  try {
    const response = await httpClient.get<unknown>({
      url: `/api/v1/student/helper-resources/stations/${encodeURIComponent(stationId)}`,
      params: {
        ...(params?.mediaKind ? { mediaKind: params.mediaKind } : {}),
        ...(params?.category ? { category: params.category } : {}),
      },
    });
    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: mapStudentHelperResourceStation(response.data),
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to load helper resource station files");
  }
}

export async function getStudentHelperResourceFile(
  resourceFileId: string,
): Promise<StudentHelperResourceApiResult<StudentHelperResourceFileDto>> {
  try {
    const response = await httpClient.get<unknown>({
      url: `/api/v1/student/helper-resources/${encodeURIComponent(resourceFileId)}`,
    });
    const mapped = mapStudentHelperResourceFile(extractEnvelopeData(response.data));
    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: mapped,
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to load helper resource file details");
  }
}

export async function getHelperResourceReadingProgress(
  resourceFileId: string,
): Promise<StudentHelperResourceApiResult<HelperResourceReadingProgressDto>> {
  try {
    const response = await httpClient.get<unknown>({
      url: `/api/v1/student/helper-resources/${encodeURIComponent(resourceFileId)}/reading-progress`,
    });
    const mapped = mapReadingProgress(extractEnvelopeData(response.data));
    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: mapped,
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to load helper resource reading progress");
  }
}

export async function updateHelperResourceReadingProgress(
  resourceFileId: string,
  progress: { readPercentage: number; lastPageOrSlide: number },
): Promise<StudentHelperResourceApiResult<HelperResourceReadingProgressDto>> {
  try {
    const response = await httpClient.put<unknown>({
      url: `/api/v1/student/helper-resources/${encodeURIComponent(resourceFileId)}/reading-progress`,
      data: progress,
    });
    const mapped = mapReadingProgress(extractEnvelopeData(response.data));
    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: mapped,
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to update reading progress");
  }
}
