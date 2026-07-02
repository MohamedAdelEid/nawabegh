"use client";

import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { teacherApi } from "@/modules/teacher/infrastructure/api/teacherApi";

export function useTeacherCourseSubscriberProfile(courseId: string, studentUserId: string) {
  const locale = useLocale();

  return useQuery({
    queryKey: ["teacher", "course", courseId, "subscriber-profile", studentUserId, locale],
    queryFn: () => teacherApi.getCourseSubscriberProfile(courseId, studentUserId, locale),
    enabled: Boolean(courseId) && Boolean(studentUserId),
  });
}
