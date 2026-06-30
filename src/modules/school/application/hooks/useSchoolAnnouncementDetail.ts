"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/shared/application/hooks/useAuth";
import { schoolAnnouncementsQueryKeys } from "@/modules/school/application/constants/schoolAnnouncementsQueryKeys";
import { getSchoolAnnouncementById } from "@/modules/school/infrastructure/api/schoolAnnouncementsApi";

export function useSchoolAnnouncementDetail(id: string) {
  const auth = useAuth();

  return useQuery({
    queryKey: schoolAnnouncementsQueryKeys.detail(id),
    queryFn: () => getSchoolAnnouncementById(id),
    enabled: auth.user?.role === "School" && Boolean(id),
    // Keep tracking delivery while the broadcast is still processing.
    refetchInterval: (query) =>
      query.state.data?.statistics.inProgressCount ? 4000 : false,
  });
}
