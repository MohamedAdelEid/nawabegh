"use client";

import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { teacherApi } from "@/modules/teacher/infrastructure/api/teacherApi";
import type { TeacherCoursesListParams } from "@/modules/teacher/domain/types/teacher.types";

export function useTeacherCourses(params: TeacherCoursesListParams) {
  const locale = useLocale();

  return useQuery({
    queryKey: ["teacher", "courses", params, locale],
    queryFn: () => teacherApi.getCourses(params, locale),
    placeholderData: (previousData) => previousData,
  });
}
