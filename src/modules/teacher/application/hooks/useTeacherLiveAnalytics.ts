"use client";

import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { teacherApi } from "@/modules/teacher/infrastructure/api/teacherApi";
import type { TeacherLiveAnalyticsParams } from "@/modules/teacher/domain/types/teacher.types";

export function useTeacherLiveAnalytics(params: TeacherLiveAnalyticsParams = {}) {
  const locale = useLocale();

  return useQuery({
    queryKey: ["teacher", "live-analytics", params, locale],
    queryFn: () => teacherApi.getLiveAnalytics(params, locale),
    placeholderData: (previousData) => previousData,
  });
}
