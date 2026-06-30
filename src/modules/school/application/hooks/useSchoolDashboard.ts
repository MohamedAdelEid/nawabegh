"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/shared/application/hooks/useAuth";
import { schoolAnnouncementsQueryKeys } from "@/modules/school/application/constants/schoolAnnouncementsQueryKeys";
import { getSchoolDashboard } from "@/modules/school/infrastructure/api/schoolAnnouncementsApi";

const LIVE_POLL_INTERVAL_MS = 4000;

export function useSchoolDashboard() {
  const auth = useAuth();

  return useQuery({
    queryKey: schoolAnnouncementsQueryKeys.dashboard(),
    queryFn: getSchoolDashboard,
    enabled: auth.user?.role === "School",
    // Poll while a broadcast is actively sending (real-time tracking).
    refetchInterval: (query) =>
      query.state.data?.realtimeTracking?.isActive ? LIVE_POLL_INTERVAL_MS : false,
  });
}
