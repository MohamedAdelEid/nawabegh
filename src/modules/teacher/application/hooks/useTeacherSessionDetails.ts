"use client";

import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { teacherApi } from "@/modules/teacher/infrastructure/api/teacherApi";

export function useTeacherSessionDetails(sessionId: string) {
  const locale = useLocale();

  return useQuery({
    queryKey: ["teacher", "session", sessionId, locale],
    queryFn: () => teacherApi.getSessionDetails(sessionId, locale),
    enabled: Boolean(sessionId),
  });
}
