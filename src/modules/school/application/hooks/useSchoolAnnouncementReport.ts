"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/shared/application/hooks/useAuth";
import { schoolAnnouncementsQueryKeys } from "@/modules/school/application/constants/schoolAnnouncementsQueryKeys";
import { getSchoolAnnouncementReport } from "@/modules/school/infrastructure/api/schoolAnnouncementsApi";

export function useSchoolAnnouncementReport(id: string) {
  const auth = useAuth();

  return useQuery({
    queryKey: schoolAnnouncementsQueryKeys.report(id),
    queryFn: () => getSchoolAnnouncementReport(id),
    enabled: auth.user?.role === "School" && Boolean(id),
  });
}
