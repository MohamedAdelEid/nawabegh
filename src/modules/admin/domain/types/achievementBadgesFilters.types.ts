export type AchievementBadgeStatusFilter = "all" | "active" | "inactive";

export type AchievementBadgeFilterState = {
  keyword: string;
  status: AchievementBadgeStatusFilter;
};

export const DEFAULT_ACHIEVEMENT_BADGE_FILTERS: AchievementBadgeFilterState = {
  keyword: "",
  status: "all",
};
