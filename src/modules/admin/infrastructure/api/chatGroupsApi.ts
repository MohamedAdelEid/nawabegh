import type { BackendApiResponse, BackendStatus } from "@/shared/domain/types/api.types";
import { httpClient } from "@/shared/infrastructure/http/httpClient";

type UnknownRecord = Record<string, unknown>;

export type ChatGroupsApiResult<T> = {
  status: BackendStatus | string;
  message?: string;
  errorMessage?: string;
  data: T | null;
};

export type ChatGroupStatistics = {
  totalGroupsCount: number;
  dailyMessagesCount: number;
  interactionPercentage: number;
  currentlyActiveGroupsCount: number;
};

export type ChatGroupListItemDto = {
  chatGroupId: string;
  courseId: string;
  groupName: string;
  subjectId: number;
  subjectNameAr: string;
  gradeId: number;
  gradeNameAr: string;
  studentsCount: number;
  chatMode: string;
  allowImages: boolean;
  allowDocuments: boolean;
  allowWebLinks: boolean;
  status: string;
  isLocked: boolean;
  lastActivityAt: string | null;
};

export type ChatGroupListParams = {
  pageNumber: number;
  pageSize: number;
  keyword?: string;
  subjectId?: number;
  gradeId?: number;
  status?: string;
};

export type ChatGroupListPage = {
  rows: ChatGroupListItemDto[];
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

export type ChatGroupDetailDto = {
  chatGroupId: string;
  courseId: string;
  groupName: string;
  subjectId: number;
  subjectNameAr: string;
  gradeId: number;
  gradeNameAr: string;
  isLocked: boolean;
  isTeachersOnly: boolean;
  allowImages: boolean;
  allowDocuments: boolean;
  allowWebLinks: boolean;
  allowParentView: boolean;
  studentsCount: number;
  lastActivityAt: string | null;
};

export type UpdateChatGroupPayload = {
  displayName: string;
  isTeachersOnly: boolean;
  allowImages: boolean;
  allowDocuments: boolean;
  allowWebLinks: boolean;
  allowParentView: boolean;
  isLocked: boolean;
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

function readNullableString(record: UnknownRecord | null, keys: string[]): string | null {
  const value = readString(record, keys, "").trim();
  return value || null;
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

function buildErrorResult<T>(error: unknown, fallbackMessage: string): ChatGroupsApiResult<T> {
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
    data: null,
  };
}

function extractStatisticsPayload(data: unknown): UnknownRecord | null {
  const record = asRecord(data);
  if (!record) return null;
  const nested = asRecord(record.data);
  return nested ?? record;
}

function extractDetailPayload(data: unknown): UnknownRecord | null {
  return extractStatisticsPayload(data);
}

function extractListRows(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  const record = asRecord(data);
  if (!record) return [];
  if (Array.isArray(record.data)) return record.data as unknown[];
  for (const key of ["items", "results", "records", "list", "rows"]) {
    const value = record[key];
    if (Array.isArray(value)) return value;
  }
  return [];
}

function extractPageMeta(data: unknown, params: ChatGroupListParams, rowCount: number) {
  const record = asRecord(data);
  const totalItems =
    readNumber(record, ["totalCount", "total", "count", "totalItems"]) ?? rowCount;
  const currentPage =
    readNumber(record, ["pageNumber", "page", "currentPage"]) ?? params.pageNumber;
  const pageSize = readNumber(record, ["pageSize", "limit", "size"]) ?? params.pageSize;
  const totalPages =
    readNumber(record, ["totalPages", "pagesCount"]) ??
    Math.max(1, Math.ceil(totalItems / Math.max(pageSize, 1)));

  return {
    currentPage,
    pageSize,
    totalItems,
    totalPages,
  };
}

function mapStatistics(record: UnknownRecord): ChatGroupStatistics {
  return {
    totalGroupsCount: readNumber(record, ["totalGroupsCount"]) ?? 0,
    dailyMessagesCount: readNumber(record, ["dailyMessagesCount"]) ?? 0,
    interactionPercentage: readNumber(record, ["interactionPercentage"]) ?? 0,
    currentlyActiveGroupsCount: readNumber(record, ["currentlyActiveGroupsCount"]) ?? 0,
  };
}

function mapDetail(record: UnknownRecord): ChatGroupDetailDto | null {
  const chatGroupId = readString(record, ["chatGroupId", "id"], "").trim();
  const courseId = readString(record, ["courseId"], "").trim();
  const groupName = readString(record, ["groupName", "displayName"], "").trim();
  if (!chatGroupId || !courseId || !groupName) return null;

  return {
    chatGroupId,
    courseId,
    groupName,
    subjectId: readNumber(record, ["subjectId"]) ?? 0,
    subjectNameAr: readString(record, ["subjectNameAr", "subjectName"], "—"),
    gradeId: readNumber(record, ["gradeId"]) ?? 0,
    gradeNameAr: readString(record, ["gradeNameAr", "gradeName"], "—"),
    isLocked: readBoolean(record, ["isLocked"]),
    isTeachersOnly: readBoolean(record, ["isTeachersOnly"]),
    allowImages: readBoolean(record, ["allowImages"]),
    allowDocuments: readBoolean(record, ["allowDocuments"]),
    allowWebLinks: readBoolean(record, ["allowWebLinks"]),
    allowParentView: readBoolean(record, ["allowParentView"]),
    studentsCount: readNumber(record, ["studentsCount", "studentCount"]) ?? 0,
    lastActivityAt: readNullableString(record, ["lastActivityAt"]),
  };
}

function mapListItem(record: UnknownRecord): ChatGroupListItemDto | null {
  const chatGroupId = readString(record, ["chatGroupId", "id"], "").trim();
  const groupName = readString(record, ["groupName"], "").trim();
  if (!chatGroupId || !groupName) return null;

  return {
    chatGroupId,
    courseId: readString(record, ["courseId"], ""),
    groupName,
    subjectId: readNumber(record, ["subjectId"]) ?? 0,
    subjectNameAr: readString(record, ["subjectNameAr", "subjectName"], "—"),
    gradeId: readNumber(record, ["gradeId"]) ?? 0,
    gradeNameAr: readString(record, ["gradeNameAr", "gradeName"], "—"),
    studentsCount: readNumber(record, ["studentsCount", "studentCount"]) ?? 0,
    chatMode: readString(record, ["chatMode"], ""),
    allowImages: readBoolean(record, ["allowImages"]),
    allowDocuments: readBoolean(record, ["allowDocuments"]),
    allowWebLinks: readBoolean(record, ["allowWebLinks"]),
    status: readString(record, ["status"], ""),
    isLocked: readBoolean(record, ["isLocked"]),
    lastActivityAt: readNullableString(record, ["lastActivityAt"]),
  };
}

export async function getChatGroupsStatistics(): Promise<ChatGroupsApiResult<ChatGroupStatistics>> {
  try {
    const response = await httpClient.get<unknown>({
      url: "/api/v1/admin/chat-groups/statistics",
    });

    const payload = extractStatisticsPayload(response.data);
    if (!payload) {
      return {
        status: response.status,
        message: response.message,
        errorMessage: response.error?.message ?? "Invalid statistics response",
        data: null,
      };
    }

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: mapStatistics(payload),
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to load chat group statistics");
  }
}

export async function getChatGroupsPage(
  params: ChatGroupListParams,
): Promise<ChatGroupsApiResult<ChatGroupListPage>> {
  try {
    const response = await httpClient.get<unknown>({
      url: "/api/v1/admin/chat-groups",
      params: {
        pageNumber: params.pageNumber,
        pageSize: params.pageSize,
        ...(params.keyword?.trim() ? { keyword: params.keyword.trim() } : {}),
        ...(params.subjectId !== undefined ? { subjectId: params.subjectId } : {}),
        ...(params.gradeId !== undefined ? { gradeId: params.gradeId } : {}),
        ...(params.status ? { status: params.status } : {}),
      },
    });

    const rows = extractListRows(response.data)
      .map((item) => mapListItem(asRecord(item) ?? {}))
      .filter((row): row is ChatGroupListItemDto => row !== null);
    const meta = extractPageMeta(response.data, params, rows.length);

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: {
        rows,
        ...meta,
      },
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to load chat groups");
  }
}

export async function getChatGroupByCourseId(
  courseId: string,
): Promise<ChatGroupsApiResult<ChatGroupDetailDto>> {
  try {
    const response = await httpClient.get<unknown>({
      url: `/api/v1/admin/chat-groups/${encodeURIComponent(courseId)}`,
    });

    const payload = extractDetailPayload(response.data);
    const detail = payload ? mapDetail(payload) : null;
    if (!detail) {
      return {
        status: response.status,
        message: response.message,
        errorMessage: response.error?.message ?? "Chat group was not found",
        data: null,
      };
    }

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: detail,
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to load chat group");
  }
}

export async function updateChatGroupByCourseId(
  courseId: string,
  payload: UpdateChatGroupPayload,
): Promise<ChatGroupsApiResult<boolean>> {
  try {
    const response = await httpClient.put<unknown>({
      url: `/api/v1/admin/chat-groups/${encodeURIComponent(courseId)}`,
      data: payload,
    });

    const responsePayload = extractDetailPayload(response.data);
    const detail = responsePayload ? mapDetail(responsePayload) : null;

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: response.data as boolean,
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to update chat group");
  }
}
