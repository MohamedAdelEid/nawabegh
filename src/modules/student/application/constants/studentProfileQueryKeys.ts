export const studentProfileQueryKeys = {
  all: () => ["student-profile"] as const,
  badges: () => ["student-profile", "badges"] as const,
  schoolRank: () => ["student-profile", "school-rank"] as const,
  points: () => ["student-profile", "points"] as const,
  achievementAudit: () => ["student-profile", "achievement-audit"] as const,
};
