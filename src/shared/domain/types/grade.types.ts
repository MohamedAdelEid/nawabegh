import type { PaginatedQueryParams } from "@/shared/domain/types/paginated-query.types";

export type Grade = {
  id: number;
  nameAr: string;
  nameEn: string;
};

export type GradesQueryParams = PaginatedQueryParams & {
  educationLevelId?: number;
};
