"use client";

import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { teacherApi } from "@/modules/teacher/infrastructure/api/teacherApi";
import type { TeacherScheduleParams } from "@/modules/teacher/domain/types/teacher.types";

export function useTeacherSchedule(params: TeacherScheduleParams = {}) {
  const locale = useLocale();

  return useQuery({
    queryKey: ["teacher", "schedule", params, locale],
    queryFn: () => teacherApi.getSchedule(params, locale),
    placeholderData: (previousData) => previousData,
  });
}
