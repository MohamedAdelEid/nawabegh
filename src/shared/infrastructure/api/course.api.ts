import type {
  CourseDetailsDto,
  CourseDetailsModel,
  ExploreCoursesPage,
  ExploreCoursesQueryParams,
  ExploreGradeFilterOption,
} from "@/shared/domain/types/course.types";
import { paginatedParams } from "@/shared/domain/types/paginated-query.types";
import {
  mapCourseDetailsDto,
  mapCourseDetailsToModel,
} from "@/shared/domain/utils/course-details.utils";
import { mapExploreCourseDto } from "@/shared/domain/utils/course.utils";
import {
  isApiSuccess,
  getApiErrorMessage,
  resolveApiData,
} from "@/shared/infrastructure/api/apiResponse.utils";
import { mapApiItems } from "@/shared/infrastructure/api/mapApiItems";
import { httpClient } from "@/shared/infrastructure/http/httpClient";
import { parseXPaginationHeader } from "@/shared/infrastructure/http/xPagination";

function buildExploreParams(params: ExploreCoursesQueryParams): Record<string, string | number> {
  const base = paginatedParams(params);
  return {
    ...base,
    ...(params.subjectId != null ? { subjectId: params.subjectId } : {}),
    ...(params.teacherId ? { teacherId: params.teacherId } : {}),
    ...(params.accessType != null ? { accessType: params.accessType } : {}),
    ...(params.gradeId != null ? { gradeId: params.gradeId } : {}),
    ...(params.term != null ? { term: params.term } : {}),
  };
}

function mapGradeFilterOption(item: unknown): ExploreGradeFilterOption | null {
  if (!item || typeof item !== "object") return null;
  const row = item as Partial<ExploreGradeFilterOption>;
  const id = Number(row.id);
  if (!Number.isFinite(id)) return null;
  return {
    id,
    nameAr: String(row.nameAr ?? ""),
    nameEn: String(row.nameEn ?? ""),
    educationLevelId: Number(row.educationLevelId ?? 0),
    educationLevelNameAr: String(row.educationLevelNameAr ?? ""),
    educationLevelNameEn: String(row.educationLevelNameEn ?? ""),
    order: Number(row.order ?? 0),
    coursesCount: Number(row.coursesCount ?? 0),
  };
}

function extractExplorePayload(data: unknown): {
  courses: unknown[];
  gradeFilters: unknown[];
  totalCoursesCount: number | null;
} {
  // Legacy: plain course array
  if (Array.isArray(data)) {
    return { courses: data, gradeFilters: [], totalCoursesCount: data.length };
  }

  if (!data || typeof data !== "object") {
    return { courses: [], gradeFilters: [], totalCoursesCount: null };
  }

  const record = data as Record<string, unknown>;
  const courses = Array.isArray(record.courses)
    ? record.courses
    : Array.isArray(record.items)
      ? record.items
      : [];
  const gradeFilters = Array.isArray(record.gradeFilters) ? record.gradeFilters : [];
  const totalRaw = record.totalCoursesCount;
  const totalCoursesCount =
    typeof totalRaw === "number" && Number.isFinite(totalRaw)
      ? totalRaw
      : typeof totalRaw === "string" && totalRaw.trim() !== "" && !Number.isNaN(Number(totalRaw))
        ? Number(totalRaw)
        : null;

  return { courses, gradeFilters, totalCoursesCount };
}

export async function getExploreCoursesPage(
  params: ExploreCoursesQueryParams,
): Promise<ExploreCoursesPage> {
  const pageNumber = params.pageNumber ?? 1;
  const pageSize = params.pageSize ?? 12;

  const response = await httpClient.get<unknown>({
    url: "/api/v1/Course/explore",
    params: buildExploreParams({ ...params, pageNumber, pageSize }),
  });

  if (!isApiSuccess(response)) {
    throw new Error(getApiErrorMessage(response, "Request failed"));
  }

  const payload = extractExplorePayload(response.data);
  const rows = mapApiItems(payload.courses, mapExploreCourseDto);
  const gradeFilters = mapApiItems(payload.gradeFilters, mapGradeFilterOption).sort(
    (a, b) => a.order - b.order,
  );
  const pagination = parseXPaginationHeader(response.headers);
  const totalCoursesCount =
    payload.totalCoursesCount ?? pagination?.totalCount ?? rows.length;

  return {
    rows,
    gradeFilters,
    totalCoursesCount,
    currentPage: pagination?.currentPage ?? pageNumber,
    pageSize: pagination?.pageSize ?? pageSize,
    totalCount: pagination?.totalCount ?? totalCoursesCount,
    totalPages: pagination?.totalPages ?? 1,
    hasMore: pagination ? pagination.hasNext : rows.length >= pageSize,
    hasPrevious: pagination?.hasPrevious ?? pageNumber > 1,
  };
}

export async function getCourseExploreDetails(
  courseId: string,
  locale: string,
): Promise<CourseDetailsModel> {
  const response = await httpClient.get<unknown>({
    url: `/api/v1/Course/explore/details/${courseId}`,
  });
  const raw = resolveApiData<unknown>(response);
  const dto = mapCourseDetailsDto(raw);
  if (!dto) {
    throw new Error("Course not found");
  }

  return mapCourseDetailsToModel(dto, locale);
}

export type { CourseDetailsDto };
