import type { QueryClient } from "@tanstack/react-query";
import { courseDetailsQueryKeys } from "@/modules/student/application/constants/courseDetailsQueryKeys";
import { exploreCoursesQueryKeys } from "@/modules/student/application/constants/exploreCoursesQueryKeys";

export async function invalidateEnrollmentCaches(
  queryClient: QueryClient,
  locale: string,
  courseId: string,
) {
  await Promise.all([
    queryClient.invalidateQueries({
      queryKey: courseDetailsQueryKeys.detail(locale, courseId),
    }),
    queryClient.invalidateQueries({
      queryKey: ["student-explore-courses"],
    }),
    queryClient.invalidateQueries({
      queryKey: exploreCoursesQueryKeys.courses(locale, {}),
    }),
  ]);
}
