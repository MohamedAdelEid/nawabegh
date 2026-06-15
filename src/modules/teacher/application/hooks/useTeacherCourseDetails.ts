"use client";

import { useQuery } from "@tanstack/react-query";
import { teacherApi } from "@/modules/teacher/infrastructure/api/teacherApi";

export function useTeacherCourseDetails(courseId: string) {
  return useQuery({
    queryKey: ["teacher", "course", courseId],
    queryFn: () => teacherApi.getCourseDetails(courseId),
    enabled: Boolean(courseId),
  });
}
