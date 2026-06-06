export type AdDisplayType = "banner" | "popup" | "card";

export type AdLifecycleStatus = "active" | "scheduled" | "expired" | "draft" | "paused";

export type AdTargetAudience = "all" | "students" | "teachers" | "parents";

export type AdPublishMode = "now" | "schedule";

export type InAppAdPlacement =
  | "home_top"
  | "home_inline"
  | "dashboard_sidebar"
  | "lesson_bottom"
  | "app_open"
  | "after_login"
  | "after_lesson"
  | "timed_popup";

export type InAppAdFrequencyType =
  | "once_per_session"
  | "once_per_day"
  | "unlimited"
  | "custom_limit";

export type AdTableRow = {
  id: string;
  displayId: string;
  title: string;
  thumbnailUrl: string;
  type: AdDisplayType;
  audiences: AdTargetAudience[];
  status: AdLifecycleStatus;
  createdAt: string;
  views: number;
  clicks: number;
};

export type AdTablePage = {
  rows: AdTableRow[];
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

export type AdKpis = {
  activeAds: number;
  scheduledAds: number;
  totalViews: number;
  engagementRate: number;
  activeAdsTrend?: number;
  totalViewsTrend?: number;
  engagementRateTrend?: number;
};

export type AdAnalyticsDailyRow = {
  day: string;
  impressions: number;
  clicks: number;
  uniqueUsers: number;
};

export type AdAnalytics = {
  impressions: number;
  clicks: number;
  ctrPercentage: number;
  uniqueUsers: number;
  daily: AdAnalyticsDailyRow[];
};

export type AdDetail = {
  id: string;
  displayId: string;
  title: string;
  description: string;
  ctaText: string;
  ctaUrl: string;
  mediaUrl: string;
  placement?: InAppAdPlacement;
  frequencyType?: InAppAdFrequencyType;
  type: AdDisplayType;
  audiences: AdTargetAudience[];
  status: AdLifecycleStatus;
  schoolIds: string[];
  schoolLabels: string[];
  gradeLevelIds: string[];
  gradeLevelLabels: string[];
  subjectIds: string[];
  subjectLabels: string[];
  publishMode: AdPublishMode;
  startAt: string;
  endAt: string;
  timezone: string;
  createdAt: string;
  createdBy: string;
  views: number;
  clicks: number;
  ctr: number;
  daysRemaining: number;
  viewsTrend?: number;
  clicksTrend?: number;
};

/** Exclusion entry for `POST /api/admin/ads`. */
export type AdExclusion = {
  type: string;
  referenceId: string;
};

/** Request body for `POST /api/admin/ads`. */
export type CreateAdApiPayload = {
  title: string;
  description: string;
  type: string;
  placement: string;
  priority: number;
  mediaUrl: string;
  mobileMediaUrl: string;
  ctaText: string;
  ctaUrl: string;
  startAtUtc: string;
  endAtUtc: string;
  timezone: string;
  frequencyType: InAppAdFrequencyType;
  frequencyValue: number | null;
  closeable: boolean;
  autoCloseSeconds: number | null;
  gradeIds: number[];
  subjectIds: number[];
  schoolIds: string[];
  exclusions: AdExclusion[];
};

export type AdCreateSubmitStatus = "draft" | "scheduled" | "active";

/** @deprecated Use {@link CreateAdApiPayload} — kept as alias during migration. */
export type CreateAdPayload = CreateAdApiPayload;

export type UpdateAdPayload = CreateAdApiPayload & {
  id: string;
};
