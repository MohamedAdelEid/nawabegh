"use client";

import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { teacherApi } from "@/modules/teacher/infrastructure/api/teacherApi";
import type { TeacherLiveSessionsListParams } from "@/modules/teacher/domain/types/teacher.types";

export function useTeacherLiveSessions(params: TeacherLiveSessionsListParams = {}) {
  const locale = useLocale();

  return useQuery({
    queryKey: ["teacher", "live-sessions", params, locale],
    queryFn: () => teacherApi.getLiveSessions(params, locale),
    placeholderData: (previousData) => previousData,
  });
}
