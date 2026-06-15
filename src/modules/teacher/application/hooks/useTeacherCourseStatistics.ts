"use client";

import { useQuery } from "@tanstack/react-query";
import { teacherApi } from "@/modules/teacher/infrastructure/api/teacherApi";

export function useTeacherCourseStatistics(courseId: string) {
  return useQuery({
    queryKey: ["teacher", "course", courseId, "statistics"],
    queryFn: () => teacherApi.getCourseStatistics(courseId),
    enabled: Boolean(courseId),
  });
}
