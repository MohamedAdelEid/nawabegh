import type { BackendApiResponse, BackendStatus } from "@/shared/domain/types/api.types";
import { httpClient } from "@/shared/infrastructure/http/httpClient";

type UnknownRecord = Record<string, unknown>;

export type StationApiResult<T> = {
  status: BackendStatus | string;
  message?: string;
  errorMessage?: string;
  data: T | null;
};

export type ReorderStationsPayload = {
  learningPathId: string;
  orderedIds: string[];
};

export type CreateStationPayload = {
  learningPathId: string;
  name: string;
  iconKey: string;
  type: number;
  autoUnlockOnPreviousComplete: boolean;
  completionRule: number;
  completionThreshold: number | null;
  accessPolicy: number;
  pointReward: number;
};

export type StationDetails = {
  id: string;
  name: string;
};

export type StationResourceFileRef = {
  id: string;
};

export type StationContentSnapshot = {
  id: string;
  name: string;
  learningPathId: string;
  learningPathTitle: string;
  resourceFiles: StationResourceFileRef[];
};

export type CreatedStation = {
  id: string;
  learningPathId: string;
  name: string;
  iconKey: string;
  order: number;
  type: number;
  autoUnlockOnPreviousComplete: boolean;
  completionRule: number;
  completionThreshold: number | null;
  accessPolicy: number;
  pointReward: number;
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

function readNullableNumber(record: UnknownRecord | null, keys: string[]): number | null {
  if (!record) return null;
  for (const key of keys) {
    if (!(key in record)) continue;
    const value = record[key];
    if (value === null) return null;
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
    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase();
      if (normalized === "true") return true;
      if (normalized === "false") return false;
    }
  }
  return fallback;
}

function readArray(record: UnknownRecord | null, keys: string[]): unknown[] {
  if (!record) return [];
  for (const key of keys) {
    const value = record[key];
    if (Array.isArray(value)) return value;
  }
  return [];
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

function buildErrorResult<T>(error: unknown, fallbackMessage: string): StationApiResult<T> {
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

function mapStationResourceFileRef(data: unknown): StationResourceFileRef | null {
  if (typeof data === "string") {
    const id = data.trim();
    return id ? { id } : null;
  }

  const record = asRecord(data);
  if (!record) return null;

  const directId = readString(record, ["id", "resourceFileId", "fileId"], "").trim();
  if (directId) return { id: directId };

  const nestedResourceFile = asRecord(record.resourceFile);
  const nestedId = readString(nestedResourceFile, ["id", "resourceFileId", "fileId"], "").trim();
  if (nestedId) return { id: nestedId };

  return null;
}

function mapStationContentSnapshot(data: unknown): StationContentSnapshot | null {
  const record = asRecord(extractEnvelopeData(data));
  if (!record) return null;
  const id = readString(record, ["id", "stationId"], "").trim();
  if (!id) return null;

  return {
    id,
    name: readString(record, ["name"], ""),
    learningPathId: readString(record, ["learningPathId"], ""),
    learningPathTitle: readString(record, ["learningPathTitle"], ""),
    resourceFiles: readArray(record, ["resourceFiles"])
      .map(mapStationResourceFileRef)
      .filter((file): file is StationResourceFileRef => Boolean(file)),
  };
}

function mapStationDetails(data: unknown): StationDetails | null {
  const record = asRecord(extractEnvelopeData(data));
  if (!record) return null;
  const id = readString(record, ["id", "stationId"], "").trim();
  if (!id) return null;

  return {
    id,
    name: readString(record, ["name"], ""),
  };
}

function mapCreatedStation(data: unknown): CreatedStation | null {
  const record = asRecord(extractEnvelopeData(data));
  if (!record) return null;
  const id = readString(record, ["id", "stationId"], "").trim();
  if (!id) return null;

  return {
    id,
    learningPathId: readString(record, ["learningPathId"], ""),
    name: readString(record, ["name"], ""),
    iconKey: readString(record, ["iconKey"], ""),
    order: readNumber(record, ["order"]),
    type: readNumber(record, ["type"]),
    autoUnlockOnPreviousComplete: readBoolean(record, ["autoUnlockOnPreviousComplete"]),
    completionRule: readNumber(record, ["completionRule"]),
    completionThreshold: readNullableNumber(record, ["completionThreshold"]),
    accessPolicy: readNumber(record, ["accessPolicy"]),
    pointReward: readNumber(record, ["pointReward", "pointsReward", "rewardPoints"]),
    createdAt: readString(record, ["createdAt"], ""),
  };
}

export async function getStation(stationId: string): Promise<StationApiResult<StationDetails>> {
  try {
    const response = await httpClient.get<unknown>({
      url: `/api/v1/Station/${stationId}`,
    });
    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: mapStationDetails(response.data),
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to load station");
  }
}

export async function getStationContentSnapshot(
  stationId: string,
): Promise<StationApiResult<StationContentSnapshot>> {
  try {
    const response = await httpClient.get<unknown>({
      url: `/api/v1/Station/${encodeURIComponent(stationId)}`,
    });
    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: mapStationContentSnapshot(response.data),
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to load station content");
  }
}

export async function getStationResourceFileId(
  stationId: string,
): Promise<StationApiResult<string>> {
  const result = await getStationContentSnapshot(stationId);
  return {
    status: result.status,
    message: result.message,
    errorMessage: result.errorMessage,
    data: result.data?.resourceFiles[0]?.id ?? null,
  };
}

export async function createStation(
  payload: CreateStationPayload,
): Promise<StationApiResult<CreatedStation>> {
  try {
    const response = await httpClient.post<unknown>({
      url: "/api/v1/Station",
      data: payload,
    });
    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: mapCreatedStation(response.data),
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to create station");
  }
}

export async function deleteStation(stationId: string): Promise<StationApiResult<boolean>> {
  try {
    const response = await httpClient.delete<unknown>({
      url: `/api/v1/Station/${encodeURIComponent(stationId)}`,
    });
    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: !response.error?.message,
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to delete station");
  }
}

export async function reorderStations(
  payload: ReorderStationsPayload,
): Promise<StationApiResult<boolean>> {
  try {
    const response = await httpClient.post<unknown>({
      url: "/api/v1/Station/reorder",
      data: payload,
    });
    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: !response.error?.message,
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to reorder stations");
  }
}
