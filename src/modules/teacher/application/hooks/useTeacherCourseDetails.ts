"use client";

import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { teacherApi } from "@/modules/teacher/infrastructure/api/teacherApi";

export function useTeacherCourseDetails(courseId: string) {
  const locale = useLocale();

  return useQuery({
    queryKey: ["teacher", "course", courseId, locale],
    queryFn: () => teacherApi.getCourseDetails(courseId, locale),
    enabled: Boolean(courseId),
  });
}

export function useTeacherCourseForEdit(courseId: string) {
  return useQuery({
    queryKey: ["teacher", "course", courseId, "edit"],
    queryFn: () => teacherApi.getCourseForEdit(courseId),
    enabled: Boolean(courseId),
  });
}
