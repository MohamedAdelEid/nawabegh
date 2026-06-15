"use client";

import { useQuery } from "@tanstack/react-query";
import { teacherApi } from "@/modules/teacher/infrastructure/api/teacherApi";

export function useTeacherSchedule() {
  return useQuery({
    queryKey: ["teacher", "schedule"],
    queryFn: () => teacherApi.getSchedule(),
  });
}
