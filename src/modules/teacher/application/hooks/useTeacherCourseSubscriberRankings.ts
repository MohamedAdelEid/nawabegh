"use client";

import { useQuery } from "@tanstack/react-query";
import { teacherApi } from "@/modules/teacher/infrastructure/api/teacherApi";
import type { TeacherCourseSubscriberRankingsParams } from "@/modules/teacher/infrastructure/api/teacherCourseSubscribersApi";

export function useTeacherCourseSubscriberRankings(
  courseId: string,
  params: TeacherCourseSubscriberRankingsParams = { limit: 5 },
) {
  return useQuery({
    queryKey: ["teacher", "course", courseId, "subscriber-rankings", params],
    queryFn: () => teacherApi.getCourseSubscriberRankings(courseId, params),
    enabled: Boolean(courseId),
  });
}
