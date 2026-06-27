import type {
  CourseDetailsDto,
  CourseDetailsModel,
  ExploreCoursesPage,
  ExploreCoursesQueryParams,
} from "@/shared/domain/types/course.types";
import { paginatedParams } from "@/shared/domain/types/paginated-query.types";
import {
  mapCourseDetailsDto,
  mapCourseDetailsToModel,
} from "@/shared/domain/utils/course-details.utils";
import { mapExploreCourseDto } from "@/shared/domain/utils/course.utils";
import {
  resolveApiData,
  resolveApiList,
} from "@/shared/infrastructure/api/apiResponse.utils";
import { mapApiItems } from "@/shared/infrastructure/api/mapApiItems";
import { httpClient } from "@/shared/infrastructure/http/httpClient";

function buildExploreParams(params: ExploreCoursesQueryParams): Record<string, string | number> {
  const base = paginatedParams(params);
  return {
    ...base,
    ...(params.subjectId != null ? { subjectId: params.subjectId } : {}),
    ...(params.teacherId ? { teacherId: params.teacherId } : {}),
    ...(params.accessType != null ? { accessType: params.accessType } : {}),
  };
}

export async function getExploreCoursesPage(
  params: ExploreCoursesQueryParams,
): Promise<ExploreCoursesPage> {
  const pageNumber = params.pageNumber ?? 1;
  const pageSize = params.pageSize ?? 12;

  const response = await httpClient.get<unknown>({
    url: "Course/explore",
    params: buildExploreParams({ ...params, pageNumber, pageSize }),
  });

  const rows = mapApiItems(resolveApiList(response), mapExploreCourseDto);

  return {
    rows,
    currentPage: pageNumber,
    pageSize,
    hasMore: rows.length >= pageSize,
  };
}

export async function getCourseExploreDetails(
  courseId: string,
  locale: string,
): Promise<CourseDetailsModel> {
  const response = await httpClient.get<unknown>({
    url: `Course/explore/details/${courseId}`,
  });
  const raw = resolveApiData<unknown>(response);
  const dto = mapCourseDetailsDto(raw);
  if (!dto) {
    throw new Error("Course not found");
  }

  return mapCourseDetailsToModel(dto, locale);
}

export type { CourseDetailsDto };
