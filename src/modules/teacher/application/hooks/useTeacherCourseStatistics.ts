"use client";

import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { teacherApi } from "@/modules/teacher/infrastructure/api/teacherApi";
import type { TeacherCourseStatisticsParams } from "@/modules/teacher/infrastructure/api/teacherCoursesStatisticsApi";

export function useTeacherCourseStatistics(
  courseId: string,
  params: Omit<TeacherCourseStatisticsParams, "locale"> = {},
) {
  const locale = useLocale();

  return useQuery({
    queryKey: ["teacher", "course", courseId, "statistics", params, locale],
    queryFn: () => teacherApi.getCourseStatistics(courseId, { ...params, locale }),
    enabled: Boolean(courseId),
  });
}
