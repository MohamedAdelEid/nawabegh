import type { GetSchoolHomeArticlesParams } from "@/modules/school/infrastructure/api/schoolHomeApi";

export const schoolHomeQueryKeys = {
  all: ["school-home"] as const,
  dashboard: () => [...schoolHomeQueryKeys.all, "dashboard"] as const,
  articles: (params: GetSchoolHomeArticlesParams) =>
    [...schoolHomeQueryKeys.all, "articles", params] as const,
};
