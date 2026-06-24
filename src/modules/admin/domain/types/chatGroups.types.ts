import type { ComponentType, SVGProps } from "react";

export type ChatGroupStatusId = "active" | "paused";

export type ChatGroupChatModeId = "everyone" | "teacherOnly";

export type ChatGroupGradeId =
  | "all"
  | "grade1"
  | "grade2"
  | "grade3"
  | "grade4"
  | "grade5"
  | "grade6"
  | "grade7"
  | "grade8"
  | "grade9"
  | "grade10"
  | "grade11"
  | "grade12";

export type ChatGroupSubjectId =
  | "all"
  | "arabic"
  | "english"
  | "math"
  | "science"
  | "physics"
  | "chemistry"
  | "biology"
  | "history"
  | "geography";

export type ChatGroupAttachmentType = "pdf" | "doc" | "xls" | "img";

export type ChatGroupAttachment = {
  type: ChatGroupAttachmentType;
  count?: number;
};

export type IconTone = "primary" | "success" | "warning" | "info";

export type ChatGroupStatCard = {
  id: string;
  labelKey: string;
  value: string;
  indicatorKey?: string;
  accentClassName: string;
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
  iconToneClassName?: IconTone;
};

export type ChatGroupFilterOption<T extends string> = {
  id: T;
  labelKey: string;
};

export type ChatGroupRow = {
  id: string;
  courseId: string;
  groupName: string;
  courseSubtitle: string;
  colorIndicator: string;
  studentCount: number;
  chatModeId: ChatGroupChatModeId;
  attachments: ChatGroupAttachment[];
  allowParentView: boolean;
  statusId: ChatGroupStatusId;
  /** Raw API status: ActiveNow, Locked, or Inactive. */
  apiStatus?: string;
  isLocked: boolean;
  lastActivityKey: string;
  /** Pre-formatted last activity when loaded from API. */
  lastActivityDisplay?: string;
};

export type ChatGroupPagination = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  visibleItems: number;
};

export type ChatGroupFilters = {
  statuses: ChatGroupFilterOption<ChatGroupStatusId | "all">[];
  grades: ChatGroupFilterOption<ChatGroupGradeId>[];
  subjects: ChatGroupFilterOption<ChatGroupSubjectId>[];
};

export type ChatGroupDashboardData = {
  stats: ChatGroupStatCard[];
  filters: ChatGroupFilters;
  rows: ChatGroupRow[];
  pagination: ChatGroupPagination;
};

export type ChatGroupMediaPermissions = {
  allowFiles: boolean;
  allowImages: boolean;
  allowPdf: boolean;
  allowWebLinks: boolean;
};

export type ChatGroupLinkedCourse = {
  id: string;
  url: string;
  name: string;
};

export type ChatGroupFormValues = {
  chatGroupId: string;
  courseId: string;
  groupName: string;
  subjectDisplayName: string;
  gradeDisplayName: string;
  subjectId: ChatGroupSubjectId | "";
  gradeId: ChatGroupGradeId | "";
  description: string;
  teacherId: string;
  chatModeId: ChatGroupChatModeId;
  mediaPermissions: ChatGroupMediaPermissions;
  blockAttachments: boolean;
  isLocked: boolean;
  /** Current URL typed before verify / add to list. */
  linkedCourseDraftUrl: string;
  /** Verified linked courses (books) shown in the list. */
  linkedCourses: ChatGroupLinkedCourse[];
  parentViewOnly: boolean;
  groupImageFile: File | null;
  groupImagePreviewUrl: string;
};

export type ChatGroupEditData = ChatGroupFormValues & {
  id: string;
};
