export type ParentHomeSummary = {
  averageProgressPercent: number;
  totalAchievements: number;
  completedStationsCount: number;
  totalStationsCount: number;
  lessonProgressPercent: number;
  quizAverageScorePercent: number;
};

export type ParentWeeklyActivityPoint = {
  labelAr: string;
  labelEn?: string | null;
  weekStartUtc: string;
  activityCount: number;
};

export type ParentHomeChild = {
  studentUserId: string;
  fullName: string;
  profileImageUrl: string | null;
  gradeNameAr: string | null;
  gradeNameEn?: string | null;
  educationLevelNameAr: string | null;
  educationLevelNameEn?: string | null;
  schoolName: string | null;
  progressPercent: number;
  activeDaysLast30: number;
  points: number;
  schoolRank: number | null;
};

export type ParentSchoolLeaderboardEntry = {
  studentUserId: string;
  fullName: string;
  profileImageUrl: string | null;
  rank: number;
  schoolName: string | null;
  points: number;
};

export type ParentRecentActivityType =
  | "station_completed"
  | "quiz_submitted"
  | "live_joined";

export type ParentRecentActivity = {
  studentUserId: string;
  childFullName: string;
  type: ParentRecentActivityType;
  titleAr: string;
  title: string;
  occurredAtUtc: string;
};

export type ParentHomeDashboard = {
  userId: string;
  fullName: string;
  profileImageUrl: string | null;
  summary: ParentHomeSummary;
  weeklyActivity: ParentWeeklyActivityPoint[];
  children: ParentHomeChild[];
  schoolLeaderboard: ParentSchoolLeaderboardEntry[];
  recentActivities: ParentRecentActivity[];
};

export type ParentAlertType =
  | "account_inactive"
  | "inactivity"
  | "low_progress"
  | "low_quiz_score";

export type ParentAlertSeverity = "warning" | "urgent";

export type ParentChildrenStatsAlert = {
  type: ParentAlertType;
  severity: ParentAlertSeverity;
  studentUserId?: string | null;
  childFullName?: string | null;
  titleAr?: string | null;
  titleEn?: string | null;
  messageAr?: string | null;
  messageEn?: string | null;
};

export type ParentChildComparison = {
  studentUserId: string;
  fullName: string;
  profileImageUrl: string | null;
  progressPercent: number;
  points: number;
  badgesCount: number;
  quizAverageScorePercent: number;
};

export type ParentExamStats = {
  totalAttempts: number;
  passedAttempts: number;
  successRatePercent: number;
  averageScorePercent: number;
};

export type ParentPointsProgress = {
  currentPoints: number;
  targetPoints: number;
};

export type ParentChildrenStatsDashboard = {
  summary: ParentHomeSummary;
  weeklyTrend: ParentWeeklyActivityPoint[];
  childrenComparison: ParentChildComparison[];
  examStats: ParentExamStats;
  pointsProgress: ParentPointsProgress;
  alerts: ParentChildrenStatsAlert[];
};
