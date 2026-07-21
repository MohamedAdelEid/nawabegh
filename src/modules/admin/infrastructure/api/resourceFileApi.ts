import type { BackendApiResponse, BackendStatus } from "@/shared/domain/types/api.types";
import { AccessPolicy, ResourceFileType } from "@/shared/domain/enums/cms.enums";
import { httpClient } from "@/shared/infrastructure/http/httpClient";
import { parseXPaginationHeader, type XPaginationMeta } from "@/shared/infrastructure/http/xPagination";

type UnknownRecord = Record<string, unknown>;

export type ResourceFileApiResult<T> = {
  status: BackendStatus | string;
  message?: string;
  errorMessage?: string;
  data: T | null;
};

export type ResourceFileMediaKind =
  | "Pdf"
  | "Presentation"
  | "Word"
  | "Image"
  | "Video"
  | "Other";

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
  uploadBatchId?: string | null;
  thumbnailUrl?: string | null;
  mediaKind?: string | null;
  category?: string | null;
  fileSizeBytes?: number | null;
};

export type ResourceFileDetails = ResourceFileListItem & {
  updatedAt: string;
};

export type ResourceFileBatchFile = {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  thumbnailUrl?: string | null;
  mediaKind?: string | null;
  fileSizeBytes?: number | null;
  createdAt: string;
};

export type ResourceFileBatchItem = {
  uploadBatchId: string;
  courseId: string;
  courseTitle: string;
  stationId: string | null;
  stationName: string | null;
  stationType: number | null;
  resourceFileType: string;
  accessPolicy: string;
  category: string | null;
  fileCount: number;
  createdAt: string;
  files: ResourceFileBatchFile[];
};

export type ResourceFileListParams = {
  stationId?: string;
  courseId?: string;
  uploadBatchId?: string;
  resourceFileType?: number | string;
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

export type ResourceFileBatchListPage = {
  items: ResourceFileBatchItem[];
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

export type CreateResourceFileItem = {
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSizeBytes?: number | null;
  thumbnailUrl?: string | null;
  mediaKind?: ResourceFileMediaKind | string | null;
};

export type CreateResourceFilePayload = {
  stationId?: string | null;
  courseId?: string | null;
  category?: string | null;
  accessPolicy: number | string;
  resourceFileType: number | string;
  files: CreateResourceFileItem[];
};

export type CreateResourceFileResult = {
  uploadBatchId: string;
  count: number;
  items: ResourceFileListItem[];
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

export function accessPolicyToApi(value: number | string): string {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (value === AccessPolicy.Subscribers) return "Subscribers";
  return "All";
}

export function resourceFileTypeToApi(value: number | string): string {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (value === ResourceFileType.ForCourse) return "ForCourse";
  return "ForStation";
}

export function inferResourceMediaKind(
  fileName: string,
  contentType?: string | null,
): ResourceFileMediaKind {
  const mime = (contentType ?? "").toLowerCase();
  const ext = fileName.split(".").pop()?.trim().toLowerCase() ?? "";

  if (mime.includes("pdf") || ext === "pdf") return "Pdf";
  if (
    mime.includes("presentation") ||
    mime.includes("powerpoint") ||
    ext === "pptx" ||
    ext === "ppt"
  ) {
    return "Presentation";
  }
  if (
    mime.includes("word") ||
    mime.includes("officedocument.wordprocessingml") ||
    ext === "docx" ||
    ext === "doc"
  ) {
    return "Word";
  }
  if (mime.startsWith("image/") || ["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp"].includes(ext)) {
    return "Image";
  }
  if (mime.startsWith("video/") || ["mp4", "webm", "mov", "m4v"].includes(ext)) {
    return "Video";
  }
  return "Other";
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
    uploadBatchId: readString(record, ["uploadBatchId"], "") || null,
    thumbnailUrl: readString(record, ["thumbnailUrl"], "") || null,
    mediaKind: readString(record, ["mediaKind"], "") || null,
    category: readString(record, ["category"], "") || null,
    fileSizeBytes: readNumber(record, ["fileSizeBytes"]),
  };
}

function mapResourceFileBatchFile(item: unknown): ResourceFileBatchFile | null {
  const record = asRecord(item);
  if (!record) return null;
  const id = readString(record, ["id"], "").trim();
  if (!id) return null;

  return {
    id,
    fileName: readString(record, ["fileName"], ""),
    fileUrl: readString(record, ["fileUrl"], ""),
    fileType: readString(record, ["fileType"], ""),
    thumbnailUrl: readString(record, ["thumbnailUrl"], "") || null,
    mediaKind: readString(record, ["mediaKind"], "") || null,
    fileSizeBytes: readNumber(record, ["fileSizeBytes"]),
    createdAt: readString(record, ["createdAt"], ""),
  };
}

function mapResourceFileBatchItem(item: unknown): ResourceFileBatchItem | null {
  const record = asRecord(item);
  if (!record) return null;

  const files = (Array.isArray(record.files) ? record.files : [])
    .map(mapResourceFileBatchFile)
    .filter((file): file is ResourceFileBatchFile => file !== null);

  const uploadBatchId =
    readString(record, ["uploadBatchId"], "").trim() || files[0]?.id || "";
  if (!uploadBatchId) return null;

  return {
    uploadBatchId,
    courseId: readString(record, ["courseId"], ""),
    courseTitle: readString(record, ["courseTitle"], ""),
    stationId: readString(record, ["stationId"], "") || null,
    stationName: readString(record, ["stationName"], "") || null,
    stationType: readNumber(record, ["stationType"]),
    resourceFileType: readString(record, ["resourceFileType"], ""),
    accessPolicy: readString(record, ["accessPolicy"], ""),
    category: readString(record, ["category"], "") || null,
    fileCount: readNumber(record, ["fileCount"]) ?? files.length,
    createdAt: readString(record, ["createdAt"], "") || files[0]?.createdAt || "",
    files,
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

function mapPaginatedPage<T>(
  data: unknown,
  params: ResourceFileListParams,
  mapItem: (item: unknown) => T | null,
  headerMeta?: XPaginationMeta | null,
): { items: T[]; totalItems: number; pageNumber: number; pageSize: number; totalPages: number } | null {
  const root = asRecord(data);
  const payload = asRecord(root?.data) ?? root;
  const itemsRaw = payload ? extractListRows(payload) : extractListRows(data);
  const items = itemsRaw.map(mapItem).filter((row): row is T => row !== null);

  if (headerMeta) {
    return {
      items,
      totalItems: headerMeta.totalCount,
      pageNumber: headerMeta.currentPage,
      pageSize: headerMeta.pageSize,
      totalPages: headerMeta.totalPages,
    };
  }

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

function mapCreatedResourceFile(data: unknown): CreateResourceFileResult | null {
  const unwrapped = extractEnvelopeData(data);
  const record = asRecord(unwrapped);
  if (!record) return null;

  const nestedItems = Array.isArray(record.items)
    ? record.items
    : Array.isArray(record.files)
      ? record.files
      : [];

  const items = nestedItems
    .map(mapResourceFileListItem)
    .filter((item): item is ResourceFileListItem => item !== null);

  const uploadBatchId =
    readString(record, ["uploadBatchId"], "").trim() ||
    items[0]?.uploadBatchId ||
    items[0]?.id ||
    "";
  const count = readNumber(record, ["count"]) ?? items.length;

  if (!uploadBatchId && items.length === 0) return null;

  return {
    uploadBatchId,
    count,
    items,
  };
}

function buildListQueryParams(params: ResourceFileListParams): Record<string, unknown> {
  return {
    ...(params.stationId ? { stationId: params.stationId } : {}),
    ...(params.courseId ? { courseId: params.courseId } : {}),
    ...(params.uploadBatchId ? { uploadBatchId: params.uploadBatchId } : {}),
    ...(params.resourceFileType !== undefined
      ? { resourceFileType: resourceFileTypeToApi(params.resourceFileType) }
      : {}),
    ...(params.keyword?.trim() ? { keyword: params.keyword.trim() } : {}),
    pageNumber: params.pageNumber ?? 1,
    pageSize: params.pageSize ?? 10,
  };
}

/** Flat list (optional). Prefer `getResourceFileBatches` for the management list. */
export async function getResourceFiles(
  params: ResourceFileListParams,
): Promise<ResourceFileApiResult<ResourceFileListPage>> {
  try {
    const response = await httpClient.get<unknown>({
      url: "/api/v1/ResourceFile",
      params: buildListQueryParams(params),
    });

    const headerMeta = parseXPaginationHeader(response.headers ?? {});
    const page = mapPaginatedPage(response.data, params, mapResourceFileListItem, headerMeta);
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

/** Grouped list — one row per upload batch. Use this on the files management list. */
export async function getResourceFileBatches(
  params: ResourceFileListParams,
): Promise<ResourceFileApiResult<ResourceFileBatchListPage>> {
  try {
    const response = await httpClient.get<unknown>({
      url: "/api/v1/ResourceFile/batches",
      params: buildListQueryParams(params),
    });

    const headerMeta = parseXPaginationHeader(response.headers ?? {});
    const page = mapPaginatedPage(response.data, params, mapResourceFileBatchItem, headerMeta);
    if (!page) {
      return {
        status: response.status,
        message: response.message,
        errorMessage: "Invalid resource file batches response",
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
    return buildErrorResult(error, "Failed to load resource file batches");
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
): Promise<ResourceFileApiResult<CreateResourceFileResult>> {
  try {
    const files = payload.files
      .map((file) => {
        const fileName = file.fileName.trim();
        const fileUrl = file.fileUrl.trim();
        const fileType = file.fileType.trim();
        if (!fileName || !fileUrl) return null;

        return {
          fileName,
          fileUrl,
          fileType,
          ...(file.fileSizeBytes != null ? { fileSizeBytes: file.fileSizeBytes } : {}),
          ...(file.thumbnailUrl != null ? { thumbnailUrl: file.thumbnailUrl } : {}),
          mediaKind:
            file.mediaKind?.toString().trim() ||
            inferResourceMediaKind(fileName, fileType),
        };
      })
      .filter((file): file is NonNullable<typeof file> => file !== null);

    if (files.length === 0) {
      return {
        status: "BadRequest",
        errorMessage: "At least one file is required",
        data: null,
      };
    }

    if (files.length > 50) {
      return {
        status: "BadRequest",
        errorMessage: "Maximum 50 files per create request",
        data: null,
      };
    }

    const resourceFileType = resourceFileTypeToApi(payload.resourceFileType);
    const stationId = payload.stationId?.trim() || null;
    const courseId = payload.courseId?.trim() || null;
    const category = payload.category?.trim() || null;

    const response = await httpClient.post<unknown>({
      url: "/api/v1/ResourceFile",
      data: {
        accessPolicy: accessPolicyToApi(payload.accessPolicy),
        resourceFileType,
        files,
        stationId: resourceFileType === "ForStation" ? stationId : null,
        courseId: resourceFileType === "ForCourse" ? courseId : null,
        ...(category ? { category } : {}),
      },
    });

    const mapped = mapCreatedResourceFile(response.data);
    const hasError = Boolean(response.error?.message);
    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: hasError
        ? null
        : mapped ?? {
            uploadBatchId: "",
            count: files.length,
            items: [],
          },
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

/** Deletes every file in a batch (one DELETE per nested file). */
export async function deleteResourceFileBatch(
  batch: Pick<ResourceFileBatchItem, "files">,
): Promise<ResourceFileApiResult<{ deleted: number; failed: number }>> {
  const ids = batch.files.map((file) => file.id).filter(Boolean);
  if (ids.length === 0) {
    return {
      status: "BadRequest",
      errorMessage: "Batch has no files to delete",
      data: null,
    };
  }

  const results = await Promise.all(ids.map((id) => deleteResourceFile(id)));
  const failed = results.filter((result) => result.errorMessage || !result.data).length;
  const deleted = ids.length - failed;

  if (deleted === 0) {
    return {
      status: "Error",
      errorMessage: results[0]?.errorMessage ?? "Failed to delete resource file batch",
      data: null,
    };
  }

  return {
    status: failed > 0 ? "Error" : "Success",
    errorMessage:
      failed > 0 ? `${deleted} deleted, ${failed} failed` : undefined,
    data: { deleted, failed },
  };
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
