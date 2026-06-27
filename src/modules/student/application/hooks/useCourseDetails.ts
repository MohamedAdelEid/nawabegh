"use client";

import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { courseDetailsQueryKeys } from "@/modules/student/application/constants/courseDetailsQueryKeys";
import type { CourseDetailsModel } from "@/shared/domain/types/course.types";
import { getCourseExploreDetails } from "@/shared/infrastructure/api/course.api";

export type CourseDetailsInitialData = {
  course: CourseDetailsModel;
};

type UseCourseDetailsOptions = {
  courseId: string;
  initial?: CourseDetailsInitialData;
  enabled?: boolean;
};

export function useCourseDetails({
  courseId,
  initial,
  enabled = true,
}: UseCourseDetailsOptions) {
  const locale = useLocale();

  return useQuery({
    queryKey: courseDetailsQueryKeys.detail(locale, courseId),
    queryFn: () => getCourseExploreDetails(courseId, locale),
    initialData: initial?.course,
    enabled: Boolean(courseId) && enabled,
    staleTime: 60_000,
  });
}
