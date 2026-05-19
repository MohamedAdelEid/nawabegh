import type { BackendApiResponse, BackendStatus } from "@/shared/domain/types/api.types";
import { httpClient } from "@/shared/infrastructure/http/httpClient";

type UnknownRecord = Record<string, unknown>;

export type LearningPathApiResult<T> = {
  status: BackendStatus | string;
  message?: string;
  errorMessage?: string;
  data: T | null;
};

export type LearningPathDropdownItem = {
  id: string;
  name: string;
};

export type CourseLearningPathStation = {
  id: string;
  name: string;
  order: number;
  type: number;
};

export type CourseLearningPath = {
  id: string;
  title: string;
  order: number;
  status: number;
  stations: CourseLearningPathStation[];
};

export type CreateLearningPathPayload = {
  courseId: string;
  title: string;
  order: number;
};

export type CreatedLearningPath = {
  id: string;
  courseId: string;
  title: string;
  order: number;
  status: number;
  createdAt: string;
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

function readNumber(record: UnknownRecord | null, keys: string[], fallback = 0): number {
  if (!record) return fallback;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() !== "" && !Number.isNaN(Number(value))) {
      return Number(value);
    }
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

function buildErrorResult<T>(error: unknown, fallbackMessage: string): LearningPathApiResult<T> {
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

function extractEnvelopeData(data: unknown): unknown {
  const record = asRecord(data);
  return record?.data ?? data;
}

function extractListRows(data: unknown): unknown[] {
  const unwrapped = extractEnvelopeData(data);
  if (Array.isArray(unwrapped)) return unwrapped;
  const record = asRecord(unwrapped);
  if (!record) return [];
  for (const key of ["items", "results", "records", "list", "rows"]) {
    const value = record[key];
    if (Array.isArray(value)) return value;
  }
  return [];
}

function mapDropdownItem(item: unknown): LearningPathDropdownItem | null {
  const record = asRecord(item);
  if (!record) return null;
  const id = readString(record, ["id", "learningPathId"], "").trim();
  if (!id) return null;
  return {
    id,
    name: readString(record, ["name", "title"], ""),
  };
}

function mapCourseLearningPathStation(item: unknown): CourseLearningPathStation | null {
  const record = asRecord(item);
  if (!record) return null;
  const id = readString(record, ["id", "stationId"], "").trim();
  if (!id) return null;
  return {
    id,
    name: readString(record, ["name", "stationName"], ""),
    order: readNumber(record, ["order"]),
    type: readNumber(record, ["type", "stationType"]),
  };
}

function mapCourseLearningPath(item: unknown): CourseLearningPath | null {
  const record = asRecord(item);
  if (!record) return null;
  const id = readString(record, ["id", "learningPathId"], "").trim();
  if (!id) return null;
  const stations = Array.isArray(record.stations) ? record.stations : [];

  return {
    id,
    title: readString(record, ["title", "name"], ""),
    order: readNumber(record, ["order"]),
    status: readNumber(record, ["status"]),
    stations: stations
      .map(mapCourseLearningPathStation)
      .filter((station): station is CourseLearningPathStation => Boolean(station)),
  };
}

function mapCreatedLearningPath(data: unknown): CreatedLearningPath | null {
  const record = asRecord(extractEnvelopeData(data));
  if (!record) return null;
  const id = readString(record, ["id", "learningPathId"], "").trim();
  if (!id) return null;

  return {
    id,
    courseId: readString(record, ["courseId"], ""),
    title: readString(record, ["title", "name"], ""),
    order: readNumber(record, ["order"]),
    status: readNumber(record, ["status"]),
    createdAt: readString(record, ["createdAt"], ""),
  };
}

export async function getCourseLearningPaths(
  courseId: string,
): Promise<LearningPathApiResult<LearningPathDropdownItem[]>> {
  try {
    const response = await httpClient.get<unknown>({
      url: `/api/v1/learning-paths/courses/${encodeURIComponent(courseId)}/dropdown`,
    });
    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: extractListRows(response.data)
        .map(mapDropdownItem)
        .filter((item): item is LearningPathDropdownItem => Boolean(item)),
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to load learning paths");
  }
}

export async function getCourseLearningPathsForEditor(
  courseId: string,
): Promise<LearningPathApiResult<CourseLearningPath[]>> {
  try {
    const response = await httpClient.get<unknown>({
      url: `/api/v1/Course/${encodeURIComponent(courseId)}/learning-paths`,
    });
    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: extractListRows(response.data)
        .map(mapCourseLearningPath)
        .filter((path): path is CourseLearningPath => Boolean(path)),
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to load course learning paths");
  }
}

export async function createLearningPath(
  payload: CreateLearningPathPayload,
): Promise<LearningPathApiResult<CreatedLearningPath>> {
  try {
    const response = await httpClient.post<unknown>({
      url: "/api/v1/learning-paths",
      data: payload,
    });
    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: mapCreatedLearningPath(response.data),
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to create learning path");
  }
}

export async function deleteLearningPath(
  learningPathId: string,
): Promise<LearningPathApiResult<boolean>> {
  try {
    const response = await httpClient.delete<unknown>({
      url: `/api/v1/learning-paths/${encodeURIComponent(learningPathId)}`,
    });
    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: !response.error?.message,
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to delete learning path");
  }
}
