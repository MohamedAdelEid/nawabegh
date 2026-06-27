import type { Teacher, TeachersQueryParams } from "@/shared/domain/types/teacher.types";
import { paginatedParams } from "@/shared/domain/types/paginated-query.types";
import { mapTeacherDto } from "@/shared/domain/utils/teacher.utils";
import { resolveApiList } from "@/shared/infrastructure/api/apiResponse.utils";
import { mapApiItems } from "@/shared/infrastructure/api/mapApiItems";
import { httpClient } from "@/shared/infrastructure/http/httpClient";

export async function getTeachers(params?: TeachersQueryParams): Promise<Teacher[]> {
  const { subjectId, ...pagination } = params ?? {};

  const response = await httpClient.get<unknown>({
    url: "Teachers",
    params: {
      ...paginatedParams(pagination),
      ...(subjectId != null ? { subjectId } : {}),
    },
  });

  return mapApiItems(resolveApiList(response), mapTeacherDto);
}
