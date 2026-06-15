"use client";

import { useQuery } from "@tanstack/react-query";
import { teacherApi } from "@/modules/teacher/infrastructure/api/teacherApi";

export function useTeacherDashboard() {
  return useQuery({
    queryKey: ["teacher", "dashboard"],
    queryFn: () => teacherApi.getDashboard(),
  });
}
