export const parentLearningQueryKeys = {
  all: ["parent", "learning"] as const,
  courses: (studentUserId: string) =>
    [...parentLearningQueryKeys.all, "courses", studentUserId] as const,
  reports: (studentUserId: string, courseId?: string) =>
    [...parentLearningQueryKeys.all, "reports", studentUserId, courseId ?? "all"] as const,
  dashboard: (studentUserId: string, weekStart?: string) =>
    [...parentLearningQueryKeys.all, "dashboard", studentUserId, weekStart ?? ""] as const,
  journey: (studentUserId: string, courseId: string) =>
    [...parentLearningQueryKeys.all, "journey", studentUserId, courseId] as const,
  resources: (
    studentUserId: string,
    filters: Record<string, string | number | undefined>,
  ) => [...parentLearningQueryKeys.all, "resources", studentUserId, filters] as const,
  station: (studentUserId: string, stationId: string) =>
    [...parentLearningQueryKeys.all, "station", studentUserId, stationId] as const,
  subscription: (studentUserId: string, enrollmentId: string) =>
    [...parentLearningQueryKeys.all, "subscription", studentUserId, enrollmentId] as const,
  catalog: (filters: Record<string, string | number | undefined>) =>
    [...parentLearningQueryKeys.all, "catalog", filters] as const,
};
