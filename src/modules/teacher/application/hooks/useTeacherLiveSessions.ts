"use client";

import { useQuery } from "@tanstack/react-query";
import { teacherApi } from "@/modules/teacher/infrastructure/api/teacherApi";

export function useTeacherLiveSessions() {
  return useQuery({
    queryKey: ["teacher", "live-sessions"],
    queryFn: () => teacherApi.getLiveSessions(),
  });
}
