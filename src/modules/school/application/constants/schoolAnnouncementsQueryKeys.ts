import type { GetSchoolAnnouncementsParams } from "@/modules/school/infrastructure/api/schoolAnnouncementsApi";

export const schoolAnnouncementsQueryKeys = {
  all: ["school-announcements"] as const,
  dashboard: () => [...schoolAnnouncementsQueryKeys.all, "dashboard"] as const,
  kpis: () => [...schoolAnnouncementsQueryKeys.all, "kpis"] as const,
  list: (params: GetSchoolAnnouncementsParams) =>
    [...schoolAnnouncementsQueryKeys.all, "list", params] as const,
  detail: (id: string) => [...schoolAnnouncementsQueryKeys.all, "detail", id] as const,
};
