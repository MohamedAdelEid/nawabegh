export const weeklyScheduleQueryKeys = {
  weekly: (weekStart?: string) => ["student-weekly-schedule", weekStart ?? "current"] as const,
};
