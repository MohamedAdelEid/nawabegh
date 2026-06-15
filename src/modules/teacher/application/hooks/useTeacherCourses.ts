"use client";

import { useQuery } from "@tanstack/react-query";
import { teacherApi } from "@/modules/teacher/infrastructure/api/teacherApi";
import type { TeacherCoursesListParams } from "@/modules/teacher/domain/types/teacher.types";

export function useTeacherCourses(params: TeacherCoursesListParams) {
  return useQuery({
    queryKey: ["teacher", "courses", params],
    queryFn: () => teacherApi.getCourses(params),
  });
}
