export type SchoolLeaderboardPeriod = "weekly" | "monthly" | "term" | "all";
export type SchoolLeaderboardMetric = "points" | "achievements" | "grades";

export interface SchoolLeaderboardKpis {
  totalParticipants: number;
  totalPoints: number;
  totalPointsLabel: string;
  participationRate: number;
  participationRateLabel: string;
  topSchoolName: string | null;
  topSchoolRank: number | null;
}

export interface SchoolLeaderboardEntry {
  rank: number;
  studentProfileId: string;
  userId: string;
  fullName: string;
  profileImageUrl: string | null;
  gradeLabel: string;
  score: number;
  scoreLabel: string;
  rankChange: number | null;
}

export interface SchoolLeaderboardMeta {
  totalCompetitors: number;
  nextUpdateAt: string | null;
  nextUpdateCountdown: string;
  availablePeriods: SchoolLeaderboardPeriod[];
  availableMetrics: SchoolLeaderboardMetric[];
}

export interface SchoolLeaderboardDashboard {
  kpis: SchoolLeaderboardKpis;
  topThree: SchoolLeaderboardEntry[];
  others: SchoolLeaderboardEntry[];
  othersTotal: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  meta: SchoolLeaderboardMeta;
}

export interface SchoolLeaderboardParams {
  period: SchoolLeaderboardPeriod;
  metric: SchoolLeaderboardMetric;
  pageNumber: number;
  pageSize: number;
}

export type SchoolHonorStatus = "Active" | "Hidden" | "Expired";
export type SchoolHonorFilter = "all" | "active" | "hidden";

export interface SchoolHonoredStudentKpis {
  totalHonored: number;
  activeHonors: number;
  honoredThisMonth: number;
  averageRating: number;
}

export interface SchoolHonoredStudent {
  id: string;
  studentUserId: string;
  fullName: string;
  profileImageUrl: string | null;
  gradeLabel: string;
  reason: string;
  reasonDetails: string | null;
  referenceCode: string;
  honoredAt: string | null;
  durationDays: number;
  durationLabel: string;
  expiresAt: string | null;
  status: SchoolHonorStatus;
  statusLabel: string;
  isVisible: boolean;
  displayOrder: number;
  achievementImageUrl: string | null;
  canEdit: boolean;
  canDelete: boolean;
  canToggleVisibility: boolean;
}

export interface SchoolHonoredStudentsPage {
  kpis: SchoolHonoredStudentKpis;
  items: SchoolHonoredStudent[];
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface SchoolHonoredStudentsParams {
  status: SchoolHonorFilter;
  search?: string;
  pageNumber: number;
  pageSize: number;
}

export interface SchoolStudentSearchResult {
  userId: string;
  studentProfileId: string;
  fullName: string;
  profileImageUrl: string | null;
  gradeLabel: string;
  referenceCode: string;
}

export interface UpsertSchoolHonoredStudentPayload {
  studentUserId: string;
  reason: string;
  reasonDetails?: string | null;
  displayOrder: number;
  durationDays: number;
  achievementImageUrl?: string | null;
  publishNow: boolean;
}
