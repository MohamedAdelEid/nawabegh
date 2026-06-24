import type {
  ChatGroupDetailDto,
  ChatGroupListItemDto,
  ChatGroupListPage,
  ChatGroupListParams,
  ChatGroupsApiResult,
  ChatGroupStatistics,
  UpdateChatGroupPayload,
} from "@/modules/admin/infrastructure/api/chatGroupsApi";
import type { BackendApiResponse, BackendStatus } from "@/shared/domain/types/api.types";
import { httpClient } from "@/shared/infrastructure/http/httpClient";
import { parseXPaginationHeader, type XPaginationMeta } from "@/shared/infrastructure/http/xPagination";

const TEACHER_CHAT_GROUPS_BASE = "/api/v1/Teacher/chat-groups";

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

function extractPayload(data: unknown): UnknownRecord | null {
  const record = asRecord(data);
  if (!record) return null;
  const nested = asRecord(record.data);
  return nested ?? record;
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

function extractPageMeta(
  data: unknown,
  params: ChatGroupListParams,
  rowCount: number,
  headerMeta?: XPaginationMeta | null,
) {
  if (headerMeta) {
    return {
      currentPage: headerMeta.currentPage,
      pageSize: headerMeta.pageSize,
      totalItems: headerMeta.totalCount,
      totalPages: headerMeta.totalPages,
    };
  }

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
    allowParentView: readBoolean(record, ["allowParentView"]),
    status: readString(record, ["status"], ""),
    isLocked: readBoolean(record, ["isLocked"]),
    lastActivityAt: readNullableString(record, ["lastActivityAt"]),
  };
}

export async function getTeacherChatGroupsStatistics(): Promise<
  ChatGroupsApiResult<ChatGroupStatistics>
> {
  try {
    const response = await httpClient.get<unknown>({
      url: `${TEACHER_CHAT_GROUPS_BASE}/statistics`,
    });

    const payload = extractPayload(response.data);
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

export async function getTeacherChatGroupsPage(
  params: ChatGroupListParams,
): Promise<ChatGroupsApiResult<ChatGroupListPage>> {
  try {
    const response = await httpClient.get<unknown>({
      url: TEACHER_CHAT_GROUPS_BASE,
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
    const headerMeta = parseXPaginationHeader(response.headers ?? {});
    const meta = extractPageMeta(response.data, params, rows.length, headerMeta);

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

export async function getTeacherChatGroupByCourseId(
  courseId: string,
): Promise<ChatGroupsApiResult<ChatGroupDetailDto>> {
  try {
    const response = await httpClient.get<unknown>({
      url: `${TEACHER_CHAT_GROUPS_BASE}/${encodeURIComponent(courseId)}`,
    });

    const payload = extractPayload(response.data);
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

export async function updateTeacherChatGroupByCourseId(
  courseId: string,
  payload: UpdateChatGroupPayload,
): Promise<ChatGroupsApiResult<boolean>> {
  try {
    const response = await httpClient.put<unknown>({
      url: `${TEACHER_CHAT_GROUPS_BASE}/${encodeURIComponent(courseId)}`,
      data: payload,
    });

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
