"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/shared/application/hooks/useAuth";
import { schoolAnnouncementsQueryKeys } from "@/modules/school/application/constants/schoolAnnouncementsQueryKeys";
import { getSchoolAnnouncementsKpis } from "@/modules/school/infrastructure/api/schoolAnnouncementsApi";

export function useSchoolAnnouncementsKpis() {
  const auth = useAuth();

  return useQuery({
    queryKey: schoolAnnouncementsQueryKeys.kpis(),
    queryFn: getSchoolAnnouncementsKpis,
    enabled: auth.user?.role === "School",
  });
}
