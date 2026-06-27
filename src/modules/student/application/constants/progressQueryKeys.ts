export const progressQueryKeys = {
  dashboard: () => ["student-subscriptions-dashboard"] as const,
  courseProgress: (courseId: string) => ["student-course-progress", courseId] as const,
  pathDropdown: (courseId: string) => ["student-path-dropdown", courseId] as const,
  pathStations: (pathId: string) => ["student-path-stations", pathId] as const,
};
