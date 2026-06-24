"use client";

import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { teacherApi } from "@/modules/teacher/infrastructure/api/teacherApi";
import type { TeacherCoursesStatisticsOverviewParams } from "@/modules/teacher/infrastructure/api/teacherCoursesStatisticsApi";

export function useTeacherCoursesStatisticsOverview(
  params: Omit<TeacherCoursesStatisticsOverviewParams, "locale"> = {},
) {
  const locale = useLocale();

  return useQuery({
    queryKey: ["teacher", "courses-statistics-overview", params, locale],
    queryFn: () => teacherApi.getCoursesStatisticsOverview({ ...params, locale }),
  });
}
