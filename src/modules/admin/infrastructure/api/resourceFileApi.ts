import type { BackendApiResponse, BackendStatus } from "@/shared/domain/types/api.types";
import { httpClient } from "@/shared/infrastructure/http/httpClient";

type UnknownRecord = Record<string, unknown>;

export type ResourceFileApiResult<T> = {
  status: BackendStatus | string;
  message?: string;
  errorMessage?: string;
  data: T | null;
};

export type ResourceFileListItem = {
  id: string;
  stationId: string;
  stationName: string;
  stationType: number;
  courseId: string;
  courseTitle: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  accessPolicy: string;
  resourceFileType: string;
  createdAt: string;
};

export type ResourceFileDetails = ResourceFileListItem & {
  updatedAt: string;
};

export type ResourceFileListParams = {
  stationId?: string;
  courseId?: string;
  resourceFileType?: number;
  keyword?: string;
  pageNumber?: number;
  pageSize?: number;
};

export type ResourceFileListPage = {
  items: ResourceFileListItem[];
  totalItems: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
};

export type ResourceFileCourseOption = {
  id: string;
  courseName: string;
  teacherName: string;
};

export type ResourceFileStationOption = {
  id: string;
  name: string;
  learningPathTitle: string;
};

export type CreateResourceFilePayload = {
  stationId: string;
  courseId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  accessPolicy: number;
  resourceFileType: number;
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

function extractListRows(data: unknown): unknown[] {
  const unwrapped = extractEnvelopeData(data);
  if (Array.isArray(unwrapped)) return unwrapped;
  const record = asRecord(unwrapped);
  if (!record) return [];
  for (const key of ["items", "results", "records", "list", "rows", "data"]) {
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

function buildErrorResult<T>(error: unknown, fallbackMessage: string): ResourceFileApiResult<T> {
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

function mapResourceFileListItem(item: unknown): ResourceFileListItem | null {
  const record = asRecord(item);
  if (!record) return null;
  const id = readString(record, ["id"], "").trim();
  if (!id) return null;

  return {
    id,
    stationId: readString(record, ["stationId"], ""),
    stationName: readString(record, ["stationName"], ""),
    stationType: readNumber(record, ["stationType"], 0) ?? 0,
    courseId: readString(record, ["courseId"], ""),
    courseTitle: readString(record, ["courseTitle"], ""),
    fileName: readString(record, ["fileName"], ""),
    fileUrl: readString(record, ["fileUrl"], ""),
    fileType: readString(record, ["fileType"], ""),
    accessPolicy: readString(record, ["accessPolicy"], ""),
    resourceFileType: readString(record, ["resourceFileType"], ""),
    createdAt: readString(record, ["createdAt"], ""),
  };
}

function mapResourceFileDetails(data: unknown): ResourceFileDetails | null {
  const record = asRecord(extractEnvelopeData(data));
  if (!record) return null;
  const base = mapResourceFileListItem(record);
  if (!base) return null;
  return {
    ...base,
    updatedAt: readString(record, ["updatedAt"], ""),
  };
}

function mapResourceFileListPage(
  data: unknown,
  params: ResourceFileListParams,
): ResourceFileListPage | null {
  const root = asRecord(data);
  const payload = asRecord(root?.data) ?? root;
  const itemsRaw = payload ? extractListRows(payload) : extractListRows(data);
  const items = itemsRaw
    .map(mapResourceFileListItem)
    .filter((row): row is ResourceFileListItem => row !== null);

  const pageNumber = params.pageNumber ?? 1;
  const pageSize = params.pageSize ?? 10;
  const totalItems =
    readNumber(payload, ["totalCount", "total", "totalItems", "count"]) ?? items.length;
  const resolvedPageNumber =
    readNumber(payload, ["pageNumber", "page", "currentPage"]) ?? pageNumber;
  const resolvedPageSize = readNumber(payload, ["pageSize", "limit", "size"]) ?? pageSize;
  const totalPages =
    readNumber(payload, ["totalPages", "pagesCount"]) ??
    Math.max(1, Math.ceil(totalItems / Math.max(resolvedPageSize, 1)));

  return {
    items,
    totalItems,
    pageNumber: resolvedPageNumber,
    pageSize: resolvedPageSize,
    totalPages,
  };
}

function mapCourseOption(item: unknown): ResourceFileCourseOption | null {
  const record = asRecord(item);
  if (!record) return null;
  const id = readString(record, ["id", "courseId"], "").trim();
  if (!id) return null;
  return {
    id,
    courseName: readString(record, ["courseName", "title"], ""),
    teacherName: readString(record, ["teacherName"], ""),
  };
}

function mapStationOption(item: unknown): ResourceFileStationOption | null {
  const record = asRecord(item);
  if (!record) return null;
  const id = readString(record, ["id", "stationId"], "").trim();
  if (!id) return null;
  return {
    id,
    name: readString(record, ["name", "stationName"], ""),
    learningPathTitle: readString(record, ["learningPathTitle"], ""),
  };
}

function mapCreatedResourceFile(data: unknown): { id: string } | null {
  const record = asRecord(extractEnvelopeData(data));
  if (!record) return null;
  const id = readString(record, ["id"], "").trim();
  return id ? { id } : null;
}

export async function getResourceFiles(
  params: ResourceFileListParams,
): Promise<ResourceFileApiResult<ResourceFileListPage>> {
  try {
    const response = await httpClient.get<unknown>({
      url: "/api/v1/ResourceFile",
      params: {
        ...(params.stationId ? { stationId: params.stationId } : {}),
        ...(params.courseId ? { courseId: params.courseId } : {}),
        ...(params.resourceFileType !== undefined
          ? { resourceFileType: params.resourceFileType }
          : {}),
        ...(params.keyword?.trim() ? { keyword: params.keyword.trim() } : {}),
        pageNumber: params.pageNumber ?? 1,
        pageSize: params.pageSize ?? 10,
      },
    });

    const page = mapResourceFileListPage(response.data, params);
    if (!page) {
      return {
        status: response.status,
        message: response.message,
        errorMessage: "Invalid resource files response",
        data: null,
      };
    }

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: page,
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to load resource files");
  }
}

export async function getResourceFileById(
  resourceFileId: string,
): Promise<ResourceFileApiResult<ResourceFileDetails>> {
  try {
    const response = await httpClient.get<unknown>({
      url: `/api/v1/ResourceFile/${encodeURIComponent(resourceFileId)}`,
    });
    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: mapResourceFileDetails(response.data),
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to load resource file");
  }
}

export async function createResourceFile(
  payload: CreateResourceFilePayload,
): Promise<ResourceFileApiResult<{ id: string }>> {
  try {
    const response = await httpClient.post<unknown>({
      url: "/api/v1/ResourceFile",
      data: payload,
    });
    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: mapCreatedResourceFile(response.data),
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to create resource file");
  }
}

export async function deleteResourceFile(resourceFileId: string): Promise<ResourceFileApiResult<boolean>> {
  try {
    const response = await httpClient.delete<unknown>({
      url: `/api/v1/ResourceFile/${encodeURIComponent(resourceFileId)}`,
    });
    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: !response.error?.message,
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to delete resource file");
  }
}

export async function getResourceFileCoursesDropdown(): Promise<
  ResourceFileApiResult<ResourceFileCourseOption[]>
> {
  try {
    const response = await httpClient.get<unknown>({
      url: "/api/v1/ResourceFile/courses-dropdown",
    });
    const items = extractListRows(response.data)
      .map(mapCourseOption)
      .filter((row): row is ResourceFileCourseOption => row !== null);
    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: items,
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to load courses");
  }
}

export async function getStationsList(): Promise<ResourceFileApiResult<ResourceFileStationOption[]>> {
  try {
    const response = await httpClient.get<unknown>({
      url: "/api/v1/Station",
    });
    const items = extractListRows(response.data)
      .map(mapStationOption)
      .filter((row): row is ResourceFileStationOption => row !== null);
    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: items,
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to load stations");
  }
}
