import type {
  EducationLevel,
  EducationLevelsQueryParams,
} from "@/shared/domain/types/education-level.types";
import { paginatedParams } from "@/shared/domain/types/paginated-query.types";
import { resolveApiList } from "@/shared/infrastructure/api/apiResponse.utils";
import { mapApiItems, mapEducationLevelItem } from "@/shared/infrastructure/api/mapApiItems";
import { httpClient } from "@/shared/infrastructure/http/httpClient";

export async function getEducationLevels(
  params?: EducationLevelsQueryParams,
): Promise<EducationLevel[]> {
  const response = await httpClient.get<unknown>({
    url: "/api/v1/EducationLevels",
    params: {
      ...paginatedParams(params),
      ...(params?.countryId != null ? { countryId: params.countryId } : {}),
    },
  });

  return mapApiItems(resolveApiList(response), mapEducationLevelItem);
}
