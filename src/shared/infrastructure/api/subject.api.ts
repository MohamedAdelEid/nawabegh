import type { Subject } from "@/shared/domain/types/subject.types";
import {
  paginatedParams,
  type PaginatedQueryParams,
} from "@/shared/domain/types/paginated-query.types";
import { mapSubjectDto } from "@/shared/domain/utils/subject.utils";
import { resolveApiList } from "@/shared/infrastructure/api/apiResponse.utils";
import { mapApiItems } from "@/shared/infrastructure/api/mapApiItems";
import { httpClient } from "@/shared/infrastructure/http/httpClient";

export async function getSubjects(params?: PaginatedQueryParams): Promise<Subject[]> {
  const response = await httpClient.get<unknown>({
    url: "Subject",
    params: paginatedParams(params),
  });

  return mapApiItems(resolveApiList(response), mapSubjectDto);
}
