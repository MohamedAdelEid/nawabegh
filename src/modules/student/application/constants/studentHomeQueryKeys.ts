export const studentHomeQueryKeys = {
  profile: () => ["student-home-profile"] as const,
  currentStations: () => ["student-home-current-stations"] as const,
  leaderboard: () => ["student-home-leaderboard"] as const,
  courses: (locale: string) => ["student-home-courses", locale] as const,
  teachers: (locale: string) => ["student-home-teachers", locale] as const,
  communityFeed: (locale: string) => ["student-home-community-feed", locale] as const,
  notifications: () => ["student-home-notifications"] as const,
};
