import type { PaginatedQueryParams } from "@/shared/domain/types/paginated-query.types";

export type School = {
  id: string;
  name: string;
};

export type SchoolDropdownQueryParams = PaginatedQueryParams & {
  countryId: number;
};
