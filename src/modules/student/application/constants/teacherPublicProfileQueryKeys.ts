export const TEACHER_PUBLIC_PROFILE_COURSES_PAGE_SIZE = 8;

export const teacherPublicProfileQueryKeys = {
  all: ["teacherPublicProfile"] as const,
  profile: (locale: string, teacherId: string) =>
    [...teacherPublicProfileQueryKeys.all, "profile", locale, teacherId] as const,
  courses: (locale: string, teacherId: string, pageNumber: number) =>
    [
      ...teacherPublicProfileQueryKeys.all,
      "courses",
      locale,
      teacherId,
      pageNumber,
    ] as const,
};
