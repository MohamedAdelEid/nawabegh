import type { Grade, GradesQueryParams } from "@/shared/domain/types/grade.types";
import { paginatedParams } from "@/shared/domain/types/paginated-query.types";
import { resolveApiList } from "@/shared/infrastructure/api/apiResponse.utils";
import { mapApiItems, mapGradeItem } from "@/shared/infrastructure/api/mapApiItems";
import { httpClient } from "@/shared/infrastructure/http/httpClient";

export async function getGrades(
  params?: GradesQueryParams,
): Promise<Grade[]> {
  const response = await httpClient.get<unknown>({
    url: "/api/v1/Grades",
    params: {
      ...paginatedParams(params),
      ...(params?.educationLevelId != null
        ? { educationLevelId: params.educationLevelId }
        : {}),
    },
  });

  return mapApiItems(resolveApiList(response), mapGradeItem);
}
