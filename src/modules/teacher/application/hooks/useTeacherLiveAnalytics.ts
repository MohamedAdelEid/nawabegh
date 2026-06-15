"use client";

import { useQuery } from "@tanstack/react-query";
import { teacherApi } from "@/modules/teacher/infrastructure/api/teacherApi";

export function useTeacherLiveAnalytics() {
  return useQuery({
    queryKey: ["teacher", "live-analytics"],
    queryFn: () => teacherApi.getLiveAnalytics(),
  });
}
