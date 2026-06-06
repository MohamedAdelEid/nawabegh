import {
  paginatedParams,
  type PaginatedQueryParams,
} from "@/shared/domain/types/paginated-query.types";
import type { Country } from "@/shared/domain/types/country.types";
import { resolveApiList } from "@/shared/infrastructure/api/apiResponse.utils";
import { mapApiItems, mapCountryItem } from "@/shared/infrastructure/api/mapApiItems";
import { httpClient } from "@/shared/infrastructure/http/httpClient";

export async function getCountriesDropdown(
  params?: PaginatedQueryParams,
): Promise<Country[]> {
  const response = await httpClient.get<unknown>({
    url: "Countries/dropdown",
    params: paginatedParams(params),
  });

  return mapApiItems(resolveApiList(response), mapCountryItem);
}
