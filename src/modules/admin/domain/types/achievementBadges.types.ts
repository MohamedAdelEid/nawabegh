export type AchievementBadgeRow = {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  requiredPoints: number;
  isActive: boolean;
  earnedCount: number;
  createdAt: string;
};

export type AchievementBadgeTablePage = {
  rows: AchievementBadgeRow[];
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

export type AchievementBadgePayload = {
  name: string;
  description: string;
  iconUrl: string;
  requiredPoints: number;
};

export type AchievementBadgeAnalyticsByBadge = {
  badgeId: string;
  name: string;
  iconUrl: string;
  requiredPoints: number;
  earnedCount: number;
  lastAwardedAt: string | null;
};

export type AchievementBadgeAnalytics = {
  totalBadgesActive: number;
  totalBadgesAwarded: number;
  byBadge: AchievementBadgeAnalyticsByBadge[];
};
