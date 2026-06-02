import type { PaginatedQueryParams } from "@/shared/domain/types/paginated-query.types";

export type EducationLevel = {
  id: number;
  countryId: number;
  nameAr: string;
  nameEn: string;
  gradeCount: number;
  icon?: string;
};

export type EducationLevelsQueryParams = PaginatedQueryParams & {
  countryId?: number;
};
