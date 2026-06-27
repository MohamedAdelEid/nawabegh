export const courseDetailsQueryKeys = {
  detail: (locale: string, courseId: string) =>
    ["student-course-details", locale, courseId] as const,
};
