"use client";

import { useQuery } from "@tanstack/react-query";
import { teacherApi } from "@/modules/teacher/infrastructure/api/teacherApi";

export function useTeacherSessionDetails(sessionId: string) {
  return useQuery({
    queryKey: ["teacher", "session", sessionId],
    queryFn: () => teacherApi.getSessionDetails(sessionId),
    enabled: Boolean(sessionId),
  });
}
