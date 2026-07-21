import type { SchoolCommunityArticlesQuery } from "@/modules/school/domain/types/schoolCommunity.types";

export const schoolCommunityQueryKeys = {
  all: ["school", "community"] as const,
  dashboard: (params: SchoolCommunityArticlesQuery) =>
    [...schoolCommunityQueryKeys.all, "dashboard", params] as const,
  articles: (params: SchoolCommunityArticlesQuery) =>
    [...schoolCommunityQueryKeys.all, "articles", params] as const,
  meta: () => [...schoolCommunityQueryKeys.all, "meta"] as const,
  categories: () => [...schoolCommunityQueryKeys.all, "categories"] as const,
  article: (id: string) => [...schoolCommunityQueryKeys.all, "article", id] as const,
  comments: (id: string) => [...schoolCommunityQueryKeys.all, "comments", id] as const,
  settings: () => [...schoolCommunityQueryKeys.all, "settings"] as const,
};
