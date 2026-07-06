import type {
  CourseReviewDetail,
} from "@/modules/admin/domain/data/courseManagementData";
import {
  countStationsInLearningPaths,
  mapLearningPathsToCurriculum,
} from "@/modules/admin/domain/utils/courseContentMappers";
import type { CourseLearningPath } from "@/modules/admin/infrastructure/api/learningPathsApi";
import { getCourseLearningPathsTree } from "@/modules/admin/infrastructure/api/learningPathsApi";
import type { BackendApiResponse, BackendStatus } from "@/shared/domain/types/api.types";
import {
  CourseAccessType,
  CourseStatus,
  CourseTerm,
} from "@/shared/domain/enums/cms.enums";
import {
  courseAccessTypeFromApi,
  courseAccessTypeToApiNumber,
  courseStatusFromApi,
  courseStatusIdToApi,
  courseTermFromApi,
  rejectionBitmaskToReasonIds,
  type CourseStatusId,
} from "@/shared/domain/enums/cms.mappers";
import type { AccessDurationDays } from "@/shared/domain/types/accessDuration.types";
import { httpClient } from "@/shared/infrastructure/http/httpClient";

type UnknownRecord = Record<string, unknown>;

export type CourseApiResult<T> = {
  status: BackendStatus | string;
  message?: string;
  errorMessage?: string;
  data: T | null;
};

export type CourseListItemDto = {
  id: string;
  title: string;
  coverImageUrl: string | null;
  subjectNameAr: string;
  gradeId: number;
  gradeNameAr: string;
  gradeNameEn: string;
  term: number;
  teacherFullName: string;
  teacherAvatarUrl: string | null;
  accessType: number;
  originalPrice: number;
  discountedPrice: number;
  status: number;
  statusId: CourseStatusId;
  isPublished: boolean;
};

export type CourseListParams = {
  status?: number;
  subjectId?: number;
  gradeId?: number;
  term?: number;
  teacherId?: string;
  accessType?: number;
  isPublished?: boolean;
  keyword?: string;
  pageNumber: number;
  pageSize: number;
};

export type CourseListPage = {
  rows: CourseListItemDto[];
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

export type CreateCoursePayload = {
  title: string;
  description: string;
  subjectId: number;
  gradeId: number;
  term: CourseTerm;
  teacherId: string;
  coverImageUrl: string;
  accessType: CourseAccessType;
  originalPrice?: number;
  discountedPrice?: number;
  accessDurationDays?: AccessDurationDays;
  submitForReview: boolean;
};

export type RejectCoursePayload = {
  rejectionNotes: string;
  rejectionReasons: number;
};

export type CourseSummary = {
  id: string;
  title: string;
  description: string;
};

export type CourseEditData = {
  id: string;
  title: string;
  description: string;
  subjectId: number;
  gradeId: number;
  term: number;
  teacherId: string;
  coverImageUrl: string;
  accessType: CourseAccessType;
  originalPrice: number;
  discountedPrice: number;
  accessDurationDays: AccessDurationDays;
};

export type UpdateCoursePayload = {
  id: string;
  title: string;
  description: string;
  subjectId: number;
  gradeId: number;
  term: CourseTerm;
  coverImageUrl: string;
  accessType: CourseAccessType;
  originalPrice?: number;
  discountedPrice?: number;
  accessDurationDays?: AccessDurationDays;
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
    if (typeof value === "string") {
      if (value.toLowerCase() === "true") return true;
      if (value.toLowerCase() === "false") return false;
    }
  }
  return fallback;
}

function readNullableString(record: UnknownRecord | null, keys: string[]): string | null {
  const value = readString(record, keys, "");
  return value.trim() ? value : null;
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

function readValidationErrorMessage(dataEnvelope: BackendApiResponse<unknown> | null): string {
  const validationErrors = dataEnvelope?.error?.validationErrors;
  if (Array.isArray(validationErrors)) {
    for (const item of validationErrors) {
      const record = asRecord(item);
      const message = readString(record, ["errorMessage"], "").trim();
      if (message) return message;
    }
  }
  if (validationErrors && typeof validationErrors === "object" && !Array.isArray(validationErrors)) {
    for (const messages of Object.values(validationErrors)) {
      if (Array.isArray(messages)) {
        const message = messages.find((value) => typeof value === "string" && value.trim());
        if (typeof message === "string" && message.trim()) return message.trim();
      }
    }
  }
  return "";
}

function buildErrorResult<T>(error: unknown, fallbackMessage: string): CourseApiResult<T> {
  const axiosError = asRecord(error);
  const response = asRecord(axiosError?.response);
  const responseData = asRecord(response?.data);
  const dataEnvelope = responseData as BackendApiResponse<unknown> | null;
  const httpStatusCode = readNumber(response, ["status"]);

  const detailMessage =
    readValidationErrorMessage(dataEnvelope) ||
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

function extractPageMeta(
  data: unknown,
  params: CourseListParams,
  rowCount: number,
): Omit<CourseListPage, "rows"> {
  const record = asRecord(extractEnvelopeData(data));
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

function readRecordValue(record: UnknownRecord | null, key: string): unknown {
  if (!record) return undefined;
  return record[key];
}

function formatCurrency(value: number): string {
  if (!value) return "—";
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "OMR",
    maximumFractionDigits: 0,
  }).format(value);
}

function mapCourseListItem(item: unknown): CourseListItemDto | null {
  const record = asRecord(item);
  if (!record) return null;
  const id = readString(record, ["id", "courseId"], "").trim();
  if (!id) return null;

  const statusId = courseStatusFromApi(readRecordValue(record, "status"));

  return {
    id,
    title: readString(record, ["title"], "—"),
    coverImageUrl: readNullableString(record, ["coverImageUrl", "coverImage"]),
    subjectNameAr: readString(record, ["subjectNameAr", "subjectName"], "—"),
    gradeId: readNumber(record, ["gradeId"]) ?? 0,
    gradeNameAr: readString(record, ["gradeNameAr", "gradeName"], "—"),
    gradeNameEn: readString(record, ["gradeNameEn", "gradeNameAr", "gradeName"], "—"),
    term: courseTermFromApi(readRecordValue(record, "term")),
    teacherFullName: readString(record, ["teacherFullName", "teacherName"], "—"),
    teacherAvatarUrl: readNullableString(record, ["teacherAvatarUrl", "teacherProfileImageUrl"]),
    accessType: courseAccessTypeToApiNumber(readRecordValue(record, "accessType")),
    originalPrice: readNumber(record, ["originalPrice"]) ?? 0,
    discountedPrice: readNumber(record, ["discountedPrice"]) ?? 0,
    status: courseStatusIdToApi(statusId) ?? CourseStatus.Draft,
    statusId,
    isPublished: readBoolean(record, ["isPublished"]),
  };
}

function termLabel(term: number): string {
  if (term === CourseTerm.SecondTerm) return "2";
  if (term === CourseTerm.ThirdTerm) return "3";
  return "1";
}

function defaultStationLabel(type: number): string {
  return String(type);
}

function mapCourseSummary(data: unknown): CourseSummary | null {
  const record = asRecord(extractEnvelopeData(data));
  if (!record) return null;
  const id = readString(record, ["id", "courseId"], "").trim();
  if (!id) return null;

  return {
    id,
    title: readString(record, ["title"], "—"),
    description: readString(record, ["description"], ""),
  };
}

function mapCourseDetail(
  data: unknown,
  learningPaths: CourseLearningPath[] = [],
  options?: {
    getStationLabel?: (type: number) => string;
    curriculumLoadError?: string | null;
  },
): CourseReviewDetail | null {
  const record = asRecord(extractEnvelopeData(data));
  if (!record) return null;
  const id = readString(record, ["id", "courseId"], "").trim();
  if (!id) return null;

  const accessType = courseAccessTypeFromApi(readRecordValue(record, "accessType"));
  const originalPrice = readNumber(record, ["originalPrice"]) ?? 0;
  const discountedPrice = readNumber(record, ["discountedPrice"]) ?? 0;
  const getStationLabel = options?.getStationLabel ?? defaultStationLabel;
  const curriculum = mapLearningPathsToCurriculum(learningPaths, getStationLabel);

  const learningPathsCount = readNumber(record, ["learningPathsCount"]) ?? learningPaths.length;
  const stationsCount =
    readNumber(record, ["stationsCount"]) ?? countStationsInLearningPaths(learningPaths);

  const statusId = courseStatusFromApi(readRecordValue(record, "status"));
  const rejectionReasonsBitmask = readNumber(record, ["rejectionReasons"]) ?? 0;
  const rejectionReasons = rejectionBitmaskToReasonIds(rejectionReasonsBitmask);
  const rejectionNotes = readString(record, ["rejectionNotes"], "");

  return {
    id,
    title: readString(record, ["title"], "—"),
    subject: readString(record, ["subjectNameAr", "subjectNameEn", "subjectName"], "—"),
    grade: readString(record, ["gradeNameAr", "gradeNameEn", "gradeName"], "—"),
    teacherName: readString(record, ["teacherFullName", "teacherName"], "—"),
    teacherAvatarUrl: readNullableString(record, ["teacherAvatarUrl"]) ?? undefined,
    accessType,
    statusId,
    isPublished: readBoolean(record, ["isPublished"]),
    coverTone: "blue",
    coverLabel: "CRS",
    coverImageUrl: readNullableString(record, ["coverImageUrl"]),
    revenue: formatCurrency(discountedPrice || originalPrice),
    lessonCount: stationsCount,
    studentCount: readNumber(record, ["enrolledStudentsCount"]) ?? 0,
    createdAt: readString(record, ["createdAt"], ""),
    description: readString(record, ["description"], "—"),
    stageLabel: readString(record, ["gradeNameAr", "gradeNameEn", "gradeName"], "—"),
    gradeNameAr: readString(record, ["gradeNameAr", "gradeName"], "—"),
    gradeNameEn: readString(record, ["gradeNameEn", "gradeNameAr", "gradeName"], "—"),
    termLabel: termLabel(courseTermFromApi(readRecordValue(record, "term"))),
    priceLabel: accessType === "free" ? "—" : formatCurrency(discountedPrice || originalPrice),
    completionRate: 0,
    totalRevenueLabel: "—",
    reviewNotes: rejectionNotes || "—",
    reviewReasons: rejectionReasons,
    reviewerName: "—",
    reviewedAt: readString(record, ["updatedAt", "createdAt"], ""),
    submittedAt: readString(record, ["createdAt"], ""),
    durationLabel: `${learningPathsCount} / ${stationsCount}`,
    categoryLabel: readString(record, ["subjectNameAr", "subjectNameEn", "subjectName"], "—"),
    learningPathCount: learningPathsCount,
    curriculumLoadError: options?.curriculumLoadError ?? null,
    curriculum,
  };
}

function mapCourseEditData(data: unknown): CourseEditData | null {
  const record = asRecord(extractEnvelopeData(data));
  if (!record) return null;
  const id = readString(record, ["id", "courseId"], "").trim();
  if (!id) return null;

  return {
    id,
    title: readString(record, ["title"], ""),
    description: readString(record, ["description"], ""),
    subjectId: readNumber(record, ["subjectId"]) ?? 0,
    gradeId: readNumber(record, ["gradeId"]) ?? 0,
    term: readNumber(record, ["term"]) ?? CourseTerm.FirstTerm,
    teacherId: readString(record, ["teacherId"], ""),
    coverImageUrl: readString(record, ["coverImageUrl"], ""),
    accessType: readNumber(record, ["accessType"]) ?? CourseAccessType.Free,
    originalPrice: readNumber(record, ["originalPrice"]) ?? 0,
    discountedPrice: readNumber(record, ["discountedPrice"]) ?? 0,
    accessDurationDays: readNullableNumber(record, ["accessDurationDays"]),
  };
}

export async function getCoursesPage(
  params: CourseListParams,
): Promise<CourseApiResult<CourseListPage>> {
  try {
    const response = await httpClient.get<unknown>({
      url: "/api/v1/Course",
      params: {
        ...(params.status !== undefined ? { status: params.status } : {}),
        ...(params.subjectId !== undefined ? { subjectId: params.subjectId } : {}),
        ...(params.gradeId !== undefined ? { gradeId: params.gradeId } : {}),
        ...(params.term !== undefined ? { term: params.term } : {}),
        ...(params.teacherId?.trim() ? { teacherId: params.teacherId.trim() } : {}),
        ...(params.accessType !== undefined ? { accessType: params.accessType } : {}),
        ...(params.isPublished !== undefined ? { isPublished: params.isPublished } : {}),
        ...(params.keyword?.trim() ? { keyword: params.keyword.trim() } : {}),
        pageNumber: params.pageNumber,
        pageSize: params.pageSize,
      },
    });

    const rows = extractListRows(response.data)
      .map(mapCourseListItem)
      .filter((row): row is CourseListItemDto => row !== null);
    const meta = extractPageMeta(response.data, params, rows.length);

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: { rows, ...meta },
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to load courses");
  }
}

export async function getCourseForEdit(
  courseId: string,
): Promise<CourseApiResult<CourseEditData>> {
  try {
    const response = await httpClient.get<unknown>({
      url: `/api/v1/Course/${encodeURIComponent(courseId)}`,
    });
    const course = mapCourseEditData(response.data);
    if (!course) {
      return {
        status: response.status,
        message: response.message,
        errorMessage: response.error?.message ?? "Course was not found",
        data: null,
      };
    }

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: course,
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to load course");
  }
}

export async function getCourse(courseId: string): Promise<CourseApiResult<CourseSummary>> {
  try {
    const response = await httpClient.get<unknown>({
      url: `/api/v1/Course/${encodeURIComponent(courseId)}`,
    });
    const summary = mapCourseSummary(response.data);
    if (!summary) {
      return {
        status: response.status,
        message: response.message,
        errorMessage: response.error?.message ?? "Course was not found",
        data: null,
      };
    }

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: summary,
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to load course");
  }
}

export type GetCourseDetailsOptions = {
  getStationLabel?: (type: number) => string;
};

export async function getCourseDetails(
  courseId: string,
  options?: GetCourseDetailsOptions,
): Promise<CourseApiResult<CourseReviewDetail>> {
  try {
    const [courseResponse, learningPathsResult] = await Promise.all([
      httpClient.get<unknown>({
        url: `/api/v1/Course/${encodeURIComponent(courseId)}`,
      }),
      getCourseLearningPathsTree(courseId),
    ]);

    const learningPaths = learningPathsResult.data?.learningPaths ?? [];
    const curriculumLoadError =
      learningPathsResult.data || !learningPathsResult.errorMessage
        ? null
        : learningPathsResult.errorMessage;

    const detail = mapCourseDetail(courseResponse.data, learningPaths, {
      getStationLabel: options?.getStationLabel,
      curriculumLoadError,
    });
    if (!detail) {
      return {
        status: courseResponse.status,
        message: courseResponse.message,
        errorMessage: courseResponse.error?.message ?? "Course was not found",
        data: null,
      };
    }

    return {
      status: courseResponse.status,
      message: courseResponse.message,
      errorMessage: courseResponse.error?.message,
      data: detail,
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to load course details");
  }
}

export async function createCourse(
  payload: CreateCoursePayload,
): Promise<CourseApiResult<CourseListItemDto>> {
  try {
    const response = await httpClient.post<unknown>({
      url: "/api/v1/Course",
      data: payload,
    });
    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: mapCourseListItem(extractEnvelopeData(response.data)),
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to create course");
  }
}

export async function updateCourse(
  courseId: string,
  payload: UpdateCoursePayload,
): Promise<CourseApiResult<CourseListItemDto>> {
  try {
    const { originalPrice, discountedPrice, accessType, accessDurationDays, ...rest } = payload;
    const data =
      accessType === CourseAccessType.Free
        ? { ...rest, accessType, accessDurationDays: accessDurationDays ?? null }
        : { ...rest, accessType, originalPrice, discountedPrice, accessDurationDays: accessDurationDays ?? null };

    const response = await httpClient.put<unknown>({
      url: `/api/v1/Course/${encodeURIComponent(courseId)}`,
      data,
    });
    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: mapCourseListItem(extractEnvelopeData(response.data)),
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to update course");
  }
}

export async function approveCourse(courseId: string): Promise<CourseApiResult<unknown>> {
  try {
    const response = await httpClient.post<unknown>({
      url: `/api/v1/Course/${encodeURIComponent(courseId)}/approve`,
      data: {},
    });
    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: response.data ?? true,
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to approve course");
  }
}

export async function rejectCourse(
  courseId: string,
  body: RejectCoursePayload,
): Promise<CourseApiResult<unknown>> {
  try {
    const response = await httpClient.post<unknown>({
      url: `/api/v1/Course/${encodeURIComponent(courseId)}/reject`,
      data: {
        rejectionNotes: body.rejectionNotes,
        rejectionReasons: body.rejectionReasons,
      },
    });

    if (response.error?.message) {
      return {
        status: response.status,
        message: response.message,
        errorMessage:
          readValidationErrorMessage(response) || response.error.message || "Failed to reject course",
        data: null,
      };
    }

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: response.data ?? true,
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to reject course");
  }
}

export async function archiveCourse(courseId: string): Promise<CourseApiResult<unknown>> {
  try {
    const response = await httpClient.post<unknown>({
      url: `/api/v1/Course/${encodeURIComponent(courseId)}/archive`,
      data: {},
    });
    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: response.data ?? true,
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to archive course");
  }
}

export async function unpublishCourse(courseId: string): Promise<CourseApiResult<unknown>> {
  try {
    const response = await httpClient.post<unknown>({
      url: `/api/v1/Course/${encodeURIComponent(courseId)}/unpublish`,
      data: {},
    });
    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: response.data ?? true,
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to unpublish course");
  }
}

export async function publishCourse(courseId: string): Promise<CourseApiResult<unknown>> {
  try {
    const response = await httpClient.post<unknown>({
      url: `/api/v1/Course/${encodeURIComponent(courseId)}/publish`,
      data: {},
    });
    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: response.data ?? true,
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to publish course");
  }
}
