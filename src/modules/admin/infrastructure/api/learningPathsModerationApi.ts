import type { BackendApiResponse, BackendStatus } from "@/shared/domain/types/api.types";
import type { CourseReviewDetail } from "@/modules/admin/domain/data/courseManagementData";
import {
  mapLearningPathCourseAccessType,
  moderationStatusCodeToCourseStatus,
  rejectionBitmaskToReasonIds,
  type LearningPathReviewListSnapshot,
} from "@/modules/admin/domain/utils/learningPathModeration";
import { httpClient } from "@/shared/infrastructure/http/httpClient";

type UnknownRecord = Record<string, unknown>;

export type LearningPathsModerationApiResult<T> = {
  status: BackendStatus | string;
  message?: string;
  errorMessage?: string;
  data: T | null;
};

export type LearningPathModerationListItemDto = {
  learningPathId: string;
  title: string;
  courseId: string;
  courseTitle: string;
  courseCoverImageUrl: string | null;
  teacherId: string;
  teacherName: string;
  teacherProfileImageUrl: string | null;
  subjectNameAr: string;
  gradeNameAr: string;
  courseAccessType: number;
  courseStatus: number;
  status: number;
  stationCount: number;
  createdAt: string;
};

export type LearningPathModerationListPage = {
  rows: LearningPathModerationListItemDto[];
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

export type LearningPathModerationStats = {
  totalLearningPaths: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  draftCount: number;
};

export type LearningPathDetailDto = {
  id: string;
  courseId: string;
  title: string;
  order: number;
  status: number;
  rejectionNotes: string | null;
  rejectionReasons: number;
  createdAt: string;
  updatedAt: string | null;
};

export type LearningPathModerationListParams = {
  status?: number;
  subjectId?: number;
  gradeId?: number;
  keyword?: string;
  pageNumber: number;
  pageSize: number;
};

export type LearningPathRejectBody = {
  rejectionNotes: string;
  rejectionReasons: number;
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

function readNullableString(record: UnknownRecord | null, keys: string[]): string | null {
  const value = readString(record, keys, "");
  return value.trim() ? value : null;
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

function buildErrorResult<T>(error: unknown, fallbackMessage: string): LearningPathsModerationApiResult<T> {
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

function extractPageMeta(data: unknown, params: LearningPathModerationListParams, rowCount: number) {
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

function mapListItem(record: UnknownRecord): LearningPathModerationListItemDto | null {
  const learningPathId =
    readString(record, ["learningPathId", "learning_path_id"], "").trim() ||
    readString(record, ["id"], "").trim();
  const title = readString(record, ["title"], "").trim();
  if (!learningPathId || !title) return null;

  return {
    learningPathId,
    title,
    courseId: readString(record, ["courseId"], ""),
    courseTitle: readString(record, ["courseTitle"], ""),
    courseCoverImageUrl: readNullableString(record, ["courseCoverImageUrl", "coverImage"]),
    teacherId: readString(record, ["teacherId"], ""),
    teacherName: readString(record, ["teacherName"], "—"),
    teacherProfileImageUrl: readNullableString(record, ["teacherProfileImageUrl"]),
    subjectNameAr: readString(record, ["subjectNameAr", "subjectName"], "—"),
    gradeNameAr: readString(record, ["gradeNameAr", "gradeName"], "—"),
    courseAccessType: readNumber(record, ["courseAccessType"]) ?? 0,
    courseStatus: readNumber(record, ["courseStatus"]) ?? 0,
    status: readNumber(record, ["status"]) ?? 0,
    stationCount: readNumber(record, ["stationCount"]) ?? 0,
    createdAt: readString(record, ["createdAt"], ""),
  };
}

export function extractStatsFromModerationEnvelope(data: unknown): LearningPathModerationStats | null {
  let record = asRecord(data);
  const inner = record ? asRecord(record.data) : null;
  if (inner && typeof inner === "object") {
    record = inner;
  }
  if (!record) return null;
  const totalLearningPaths =
    readNumber(record, ["totalLearningPaths"]) ?? readNumber(record, ["total"]) ?? null;
  if (totalLearningPaths === null) return null;

  return {
    totalLearningPaths,
    pendingCount: readNumber(record, ["pendingCount"]) ?? 0,
    approvedCount: readNumber(record, ["approvedCount"]) ?? 0,
    rejectedCount: readNumber(record, ["rejectedCount"]) ?? 0,
    draftCount: readNumber(record, ["draftCount"]) ?? 0,
  };
}

function extractDetailEnvelope(data: unknown): UnknownRecord | null {
  let record = asRecord(data);
  const inner = record?.data !== undefined ? asRecord(record.data) : null;
  record = inner ?? record;
  return record;
}

function mapLearningPathDetail(data: unknown): LearningPathDetailDto | null {
  const record = extractDetailEnvelope(data);
  if (!record) return null;
  const id = readString(record, ["id", "learningPathId"], "").trim();
  if (!id) return null;

  return {
    id,
    courseId: readString(record, ["courseId"], ""),
    title: readString(record, ["title"], ""),
    order: readNumber(record, ["order"]) ?? 0,
    status: readNumber(record, ["status"]) ?? 0,
    rejectionNotes: readNullableString(record, ["rejectionNotes"]),
    rejectionReasons: readNumber(record, ["rejectionReasons"]) ?? 0,
    createdAt: readString(record, ["createdAt"], ""),
    updatedAt: readNullableString(record, ["updatedAt"]),
  };
}

export function learningPathDetailToCourseReviewDetail(
  detail: LearningPathDetailDto,
  listSnapshot?: LearningPathReviewListSnapshot | null,
): CourseReviewDetail {
  const statusId = moderationStatusCodeToCourseStatus(detail.status);
  const accessType =
    listSnapshot != null
      ? mapLearningPathCourseAccessType(listSnapshot.courseAccessType)
      : "subscription";

  return {
    id: detail.id,
    title: detail.title,
    subject: listSnapshot?.subjectNameAr ?? "—",
    grade: listSnapshot?.gradeNameAr ?? "—",
    teacherName: listSnapshot?.teacherName ?? "—",
    teacherAvatarUrl: listSnapshot?.teacherProfileImageUrl ?? undefined,
    accessType,
    statusId,
    coverTone: "blue",
    coverLabel: "LP",
    revenue: "0 ر.ع.",
    lessonCount: 0,
    studentCount: 0,
    createdAt: detail.createdAt,
    description:
      detail.rejectionNotes?.trim() ||
      listSnapshot?.courseTitle ||
      "—",
    stageLabel: listSnapshot?.gradeNameAr ?? "—",
    termLabel: listSnapshot?.courseTitle ?? "—",
    priceLabel: "—",
    completionRate: 0,
    totalRevenueLabel: "0 ر.ع.",
    reviewNotes: detail.rejectionNotes ?? "—",
    reviewReasons: rejectionBitmaskToReasonIds(detail.rejectionReasons),
    reviewerName: "—",
    reviewedAt: detail.updatedAt ?? detail.createdAt,
    submittedAt: detail.createdAt,
    durationLabel: "—",
    categoryLabel: listSnapshot?.subjectNameAr ?? "—",
    curriculum: [],
  };
}

export async function getLearningPathsModerationStats(): Promise<
  LearningPathsModerationApiResult<LearningPathModerationStats>
> {
  try {
    const response = await httpClient.get<unknown>({
      url: "/api/v1/learning-paths/moderation/stats",
    });
    const stats = extractStatsFromModerationEnvelope(response.data);
    if (!stats) {
      return {
        status: response.status,
        message: response.message,
        errorMessage: response.error?.message ?? "Invalid stats response",
        data: null,
      };
    }
    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: stats,
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to load learning path moderation stats");
  }
}

export async function getLearningPathsModerationPage(
  params: LearningPathModerationListParams,
): Promise<LearningPathsModerationApiResult<LearningPathModerationListPage>> {
  try {
    const response = await httpClient.get<unknown>({
      url: "/api/v1/learning-paths/moderation",
      params: {
        ...(params.status !== undefined ? { status: params.status } : {}),
        ...(params.subjectId !== undefined ? { subjectId: params.subjectId } : {}),
        ...(params.gradeId !== undefined ? { gradeId: params.gradeId } : {}),
        ...(params.keyword?.trim() ? { keyword: params.keyword.trim() } : {}),
        pageNumber: params.pageNumber,
        pageSize: params.pageSize,
      },
    });

    const rows = extractListRows(response.data)
      .map((item) => mapListItem(asRecord(item) ?? {}))
      .filter((row): row is LearningPathModerationListItemDto => row !== null);
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
    return buildErrorResult(error, "Failed to load learning paths");
  }
}

export async function getLearningPathById(
  learningPathId: string,
): Promise<LearningPathsModerationApiResult<LearningPathDetailDto>> {
  try {
    const response = await httpClient.get<unknown>({
      url: `/api/v1/learning-paths/${encodeURIComponent(learningPathId)}`,
    });
    const detail = mapLearningPathDetail(response.data);
    if (!detail) {
      return {
        status: response.status,
        message: response.message,
        errorMessage: response.error?.message ?? "Learning path was not found",
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
    return buildErrorResult(error, "Failed to load learning path");
  }
}

export async function approveLearningPath(
  learningPathId: string,
): Promise<LearningPathsModerationApiResult<unknown>> {
  try {
    const response = await httpClient.post<unknown>({
      url: `/api/v1/learning-paths/${encodeURIComponent(learningPathId)}/approve`,
      data: {},
    });
    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: response.data ?? true,
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to approve learning path");
  }
}

export async function rejectLearningPath(
  learningPathId: string,
  body: LearningPathRejectBody,
): Promise<LearningPathsModerationApiResult<unknown>> {
  try {
    const response = await httpClient.post<unknown>({
      url: `/api/v1/learning-paths/${encodeURIComponent(learningPathId)}/reject`,
      data: body,
    });
    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: response.data ?? true,
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to reject learning path");
  }
}

export async function deleteLearningPath(
  learningPathId: string,
): Promise<LearningPathsModerationApiResult<unknown>> {
  try {
    const response = await httpClient.delete<unknown>({
      url: `/api/v1/learning-paths/${encodeURIComponent(learningPathId)}`,
    });
    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: response.data ?? true,
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to delete learning path");
  }
}
