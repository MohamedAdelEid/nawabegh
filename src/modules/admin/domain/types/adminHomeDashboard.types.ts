/** Query parameters accepted by GET /api/v1/admin/dashboard. */
export type AdminHomeDashboardParams = {
  schoolRankingLimit?: number;
  topStudentsLimit?: number;
  newUsersChartMonths?: number;
  recentActivityLimit?: number;
};

export type AdminHomeSummaryCard = {
  key: string;
  count: number;
  changePercent: number;
};

export type AdminHomeRevenue = {
  totalRevenue: number;
  currency: string;
  activeSubscriptions: number;
  activeSubscriptionsChangePercent: number;
  monthlyGoalPercent: number;
};

export type AdminHomeNewUsersPoint = {
  year: number;
  month: number;
  /** Server-provided localized label (monthLabelAr). */
  monthLabel: string;
  newUsers: number;
};

export type AdminHomeSchoolRanking = {
  rank: number;
  schoolId: string;
  name: string;
  logoUrl: string | null;
  totalPoints: number;
  studentCount: number;
};

export type AdminHomeTopStudent = {
  rank: number;
  studentUserId: string;
  fullName: string;
  profileImageUrl: string | null;
  points: number;
};

export type AdminHomeActivityMetrics = {
  liveSessionsToday: number;
  completedLessons: number;
  completedExams: number;
  issuedCertificates: number;
};

export type AdminHomeReviewTask = {
  key: string;
  /** Server-provided localized label (labelAr). */
  label: string;
  count: number;
};

export type AdminHomeReviewTasks = {
  items: AdminHomeReviewTask[];
  totalPending: number;
};

export type AdminHomeRecentActivity = {
  type: string;
  /** Server-provided localized message (messageAr). */
  message: string;
  occurredAt: string;
  entityId: string;
};

export type AdminHomeDashboard = {
  summaryCards: AdminHomeSummaryCard[];
  revenue: AdminHomeRevenue;
  newUsersChart: AdminHomeNewUsersPoint[];
  schoolRankings: AdminHomeSchoolRanking[];
  topStudents: AdminHomeTopStudent[];
  activityMetrics: AdminHomeActivityMetrics;
  reviewTasks: AdminHomeReviewTasks;
  recentActivities: AdminHomeRecentActivity[];
};
