/** Domain view models for the School Announcements & Alerts portal. */

export type SchoolAnnouncementType = "Ad" | "UrgentAlert";

/** Audience codes accepted/returned by the API. */
export type SchoolAnnouncementAudience =
  | "all"
  | "students"
  | "parents"
  | "teachers"
  | "studentsTeachersParents";

/** Normalized status used for badge styling and i18n labels. */
export type SchoolAnnouncementStatusTone =
  | "published"
  | "urgent"
  | "scheduled"
  | "draft"
  | "sending"
  | "success"
  | "failed";

/** Filter tabs on the list screen. */
export type SchoolAnnouncementListFilter = "all" | "Published" | "Scheduled" | "Draft";

export type SchoolDeliveryChannelCode = "InApp" | "MobilePush" | "Sms";

export interface SchoolAnnouncementKpis {
  totalAnnouncements: number;
  totalAnnouncementsChangePercent: number | null;
  activeAlerts: number;
  activeAlertsChangePercent: number | null;
  reachRate: number;
  reachRateLabel: string | null;
  scheduledSoon: number;
}

export interface SchoolAnnouncementListItem {
  id: string;
  referenceCode: string;
  title: string;
  type: SchoolAnnouncementType;
  isUrgent: boolean;
  audience: SchoolAnnouncementAudience;
  audienceLabel: string;
  statusTone: SchoolAnnouncementStatusTone;
  statusLabel: string;
  date: string;
  reachPercentage: number;
  sentCount: number;
  failedCount: number;
  totalRecipients: number;
  canEdit: boolean;
  canDelete: boolean;
  canView: boolean;
}

export interface SchoolAnnouncementListPage {
  items: SchoolAnnouncementListItem[];
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface SchoolAnnouncementChannel {
  code: SchoolDeliveryChannelCode;
  label: string;
  enabled: boolean;
}

export interface SchoolAnnouncementStatistics {
  deliveryRate: number;
  totalRecipients: number;
  successCount: number;
  failureCount: number;
  inProgressCount: number;
  reachPercentage: number;
}

export interface SchoolAnnouncementAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  fileSizeBytes: number;
  fileSizeLabel: string;
}

export interface SchoolAnnouncementOperationLogEntry {
  id: string;
  eventType: string;
  eventLabel: string;
  description: string;
  occurredAt: string;
  icon: string;
}

export interface SchoolAnnouncementActions {
  canEdit: boolean;
  canDelete: boolean;
  canResend: boolean;
  canArchive: boolean;
  canPrintReport: boolean;
}

export interface SchoolAnnouncementDetail {
  id: string;
  referenceCode: string;
  title: string;
  type: SchoolAnnouncementType;
  isUrgent: boolean;
  statusTone: SchoolAnnouncementStatusTone;
  statusLabel: string;
  createdAt: string;
  sentAt: string | null;
  scheduledAt: string | null;
  createdByName: string;
  statistics: SchoolAnnouncementStatistics;
  body: string;
  bodyHtml: string;
  displayDurationHours: number;
  attachments: SchoolAnnouncementAttachment[];
  audience: SchoolAnnouncementAudience;
  audienceLabel: string;
  studentsCount: number;
  parentsCount: number;
  teachersCount: number;
  channels: SchoolAnnouncementChannel[];
  operationLog: SchoolAnnouncementOperationLogEntry[];
  actions: SchoolAnnouncementActions;
}

export interface SchoolRealtimeTracking {
  isActive: boolean;
  announcementId: string;
  referenceCode: string;
  title: string;
  statusTone: SchoolAnnouncementStatusTone;
  statusLabel: string;
  sentCount: number;
  inProgressCount: number;
  failedCount: number;
  totalRecipients: number;
  progressPercentage: number;
}

export interface SchoolDashboardSidebarItem {
  id: string;
  referenceCode: string;
  title: string;
  type: SchoolAnnouncementType;
  isUrgent: boolean;
  audience: SchoolAnnouncementAudience;
  audienceLabel: string;
  statusTone: SchoolAnnouncementStatusTone;
  statusLabel: string;
  scheduledOrSentAt: string | null;
  timeLabel: string | null;
  canEdit: boolean;
  canView: boolean;
  canDelete: boolean;
}

export interface SchoolDashboardActivityItem {
  id: string;
  title: string;
  type: SchoolAnnouncementType;
  typeLabel: string;
  statusTone: SchoolAnnouncementStatusTone;
  statusLabel: string;
  date: string;
}

export interface SchoolDashboardCallout {
  title: string;
  body: string;
  actionLabel: string;
  actionUrl: string | null;
}

export interface SchoolDashboardData {
  kpis: SchoolAnnouncementKpis;
  activeAndScheduled: SchoolDashboardSidebarItem[];
  recentActivity: SchoolDashboardActivityItem[];
  realtimeTracking: SchoolRealtimeTracking | null;
  tips: SchoolDashboardCallout | null;
  smartRecommendations: SchoolDashboardCallout | null;
}

export interface SchoolAnnouncementAttachmentInput {
  fileName: string;
  fileUrl: string;
  mimeType: string;
  fileSizeBytes: number;
}

export interface UpsertSchoolAnnouncementPayload {
  type: SchoolAnnouncementType;
  title: string;
  body: string;
  audience: SchoolAnnouncementAudience;
  sendMethod: "Instant" | "Scheduled";
  scheduledAtUtc: string | null;
  displayDurationHours: number;
  sendMobilePush: boolean;
  sendInApp: boolean;
  sendSms: boolean;
  isDraft: boolean;
  attachments: SchoolAnnouncementAttachmentInput[];
}

export interface CreateSchoolAnnouncementResult {
  id: string;
  referenceCode: string;
  statusTone: SchoolAnnouncementStatusTone;
  statusLabel: string;
  realtimeTracking: SchoolRealtimeTracking | null;
}

export type SchoolAnnouncementsApiResult<T> = {
  ok: boolean;
  message?: string;
  errorMessage?: string;
  data: T | null;
};
