import type { ExploreCoursesQueryParams } from "@/shared/domain/types/course.types";

export const EXPLORE_COURSES_PAGE_SIZE = 5;

export type ExploreCoursesFilterSnapshot = Pick<
  ExploreCoursesQueryParams,
  "keyword" | "subjectId" | "teacherId" | "accessType" | "gradeId" | "term"
>;

export const exploreCoursesQueryKeys = {
  subjects: (locale: string) => ["student-explore-subjects", locale] as const,
  teachers: (locale: string, subjectId: number | null, keyword: string) =>
    ["student-explore-teachers", locale, subjectId, keyword] as const,
  courses: (locale: string, filters: ExploreCoursesFilterSnapshot) =>
    ["student-explore-courses", locale, filters] as const,
};
