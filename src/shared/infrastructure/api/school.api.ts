import type { School, SchoolDropdownQueryParams } from "@/shared/domain/types/school.types";
import { paginatedParams } from "@/shared/domain/types/paginated-query.types";
import {
  extractApiList,
  isApiSuccess,
} from "@/shared/infrastructure/api/apiResponse.utils";
import { mapApiItems, mapSchoolItem } from "@/shared/infrastructure/api/mapApiItems";
import { httpClient } from "@/shared/infrastructure/http/httpClient";

function schoolDropdownParams(params: SchoolDropdownQueryParams) {
  return {
    ...paginatedParams(params),
    countryId: params.countryId,
  };
}

export async function getSchoolsDropdown(
  params: SchoolDropdownQueryParams,
): Promise<School[]> {
  try {
    const response = await httpClient.get<unknown>({
      url: "/api/v1/School/dropdown",
      params: schoolDropdownParams(params),
    });

    if (!isApiSuccess(response)) return [];

    return mapApiItems(extractApiList(response.data), mapSchoolItem);
  } catch {
    return [];
  }
}
