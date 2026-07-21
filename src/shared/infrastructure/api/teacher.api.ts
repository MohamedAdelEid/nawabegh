import type { Teacher, TeachersPage, TeachersQueryParams, TeacherPublicProfile } from "@/shared/domain/types/teacher.types";
import { paginatedParams } from "@/shared/domain/types/paginated-query.types";
import { mapTeacherDto, mapTeacherPublicProfileDto } from "@/shared/domain/utils/teacher.utils";
import { resolveApiData, resolveApiList } from "@/shared/infrastructure/api/apiResponse.utils";
import { mapApiItems } from "@/shared/infrastructure/api/mapApiItems";
import { httpClient } from "@/shared/infrastructure/http/httpClient";
import { parseXPaginationHeader } from "@/shared/infrastructure/http/xPagination";

function buildTeachersParams(params: TeachersQueryParams): Record<string, string | number> {
  const { subjectId, ...pagination } = params;
  return {
    ...paginatedParams(pagination),
    ...(subjectId != null ? { subjectId } : {}),
  };
}

export async function getTeachers(params?: TeachersQueryParams): Promise<Teacher[]> {
  const response = await httpClient.get<unknown>({
    url: "/api/v1/Teachers",
    params: buildTeachersParams(params ?? {}),
  });

  return mapApiItems(resolveApiList(response), mapTeacherDto);
}

export async function getTeachersPage(params: TeachersQueryParams): Promise<TeachersPage> {
  const pageNumber = params.pageNumber ?? 1;
  const pageSize = params.pageSize ?? 9;

  const response = await httpClient.get<unknown>({
    url: "/api/v1/Teachers",
    params: buildTeachersParams({ ...params, pageNumber, pageSize }),
  });

  const rows = mapApiItems(resolveApiList(response), mapTeacherDto);
  const pagination = parseXPaginationHeader(response.headers);

  return {
    rows,
    currentPage: pagination?.currentPage ?? pageNumber,
    pageSize: pagination?.pageSize ?? pageSize,
    totalPages: pagination?.totalPages ?? 1,
    totalCount: pagination?.totalCount ?? rows.length,
    hasPrevious: pagination?.hasPrevious ?? pageNumber > 1,
    hasNext: pagination?.hasNext ?? rows.length >= pageSize,
  };
}

export async function getTeacherPublicProfile(teacherId: string): Promise<TeacherPublicProfile> {
  const response = await httpClient.get<unknown>({
    url: `/api/v1/Teachers/${encodeURIComponent(teacherId)}`,
  });

  const profile = mapTeacherPublicProfileDto(resolveApiData(response));
  if (!profile) {
    throw new Error("Teacher not found");
  }

  return profile;
}
