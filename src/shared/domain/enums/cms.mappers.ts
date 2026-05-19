import {
  CourseAccessType,
  CourseStatus,
  CourseRejectionReasons,
  LearningPathStatus,
} from "@/shared/domain/enums/cms.enums";

/** Dashboard filter / badge keys for course & learning-path moderation rows. */
export type CourseStatusId = "draft" | "pending" | "approved" | "rejected" | "archived";

export type CourseAccessTypeId = "free" | "paid" | "subscription" | "unlisted";

/** i18n keys under `courseManagement.reject.reasons.*`. */
export type CourseReviewReasonId =
  | "incompleteMaterials"
  | "technicalIssues"
  | "contentQuality"
  | "policyConflict"
  | "copyrightIssue";

/** @deprecated Prefer `LearningPathStatus` from cms.enums */
export const LEARNING_PATH_MODERATION_STATUS = {
  draft: LearningPathStatus.Draft,
  pending: LearningPathStatus.Pending,
  approved: LearningPathStatus.Approved,
  rejected: LearningPathStatus.Rejected,
} as const;

const COURSE_REVIEW_REASON_TO_API: Record<CourseReviewReasonId, CourseRejectionReasons> = {
  incompleteMaterials: CourseRejectionReasons.IncompleteContent,
  technicalIssues: CourseRejectionReasons.PoorAudioVideo,
  contentQuality: CourseRejectionReasons.ContentQuality,
  policyConflict: CourseRejectionReasons.PolicyViolation,
  copyrightIssue: CourseRejectionReasons.CopyrightIssue,
};

const API_TO_COURSE_REVIEW_REASON = Object.entries(COURSE_REVIEW_REASON_TO_API) as Array<
  [CourseReviewReasonId, CourseRejectionReasons]
>;

export function learningPathStatusToCourseStatusId(code: number): CourseStatusId {
  switch (code) {
    case LearningPathStatus.Approved:
      return "approved";
    case LearningPathStatus.Pending:
      return "pending";
    case LearningPathStatus.Rejected:
      return "rejected";
    case LearningPathStatus.Draft:
    default:
      return "draft";
  }
}

export function courseStatusFromApi(code: number): CourseStatusId {
  switch (code) {
    case CourseStatus.Approved:
      return "approved";
    case CourseStatus.Pending:
      return "pending";
    case CourseStatus.Rejected:
      return "rejected";
    case CourseStatus.Archived:
      return "archived";
    case CourseStatus.Draft:
    default:
      return "draft";
  }
}

export function courseStatusIdToApi(status: "all" | CourseStatusId): number | undefined {
  if (status === "all") return undefined;
  switch (status) {
    case "draft":
      return CourseStatus.Draft;
    case "pending":
      return CourseStatus.Pending;
    case "approved":
      return CourseStatus.Approved;
    case "rejected":
      return CourseStatus.Rejected;
    case "archived":
      return CourseStatus.Archived;
    default:
      return undefined;
  }
}

export function courseStatusIdToLearningPathStatus(status: "all" | CourseStatusId): number | undefined {
  if (status === "all") return undefined;
  switch (status) {
    case "draft":
      return LearningPathStatus.Draft;
    case "pending":
      return LearningPathStatus.Pending;
    case "approved":
      return LearningPathStatus.Approved;
    case "rejected":
      return LearningPathStatus.Rejected;
    case "archived":
      return undefined;
    default:
      return undefined;
  }
}

export function courseAccessTypeFromApi(value: number | null): CourseAccessTypeId {
  if (value === null || Number.isNaN(value)) return "unlisted";
  switch (value) {
    case CourseAccessType.Free:
      return "free";
    case CourseAccessType.Paid:
      return "paid";
    case CourseAccessType.Subscription:
      return "subscription";
    default:
      return "unlisted";
  }
}

export function rejectionReasonIdsToBitmask(reasons: CourseReviewReasonId[]): number {
  return reasons.reduce((acc, id) => acc | (COURSE_REVIEW_REASON_TO_API[id] ?? 0), 0);
}

export function rejectionBitmaskToReasonIds(flags: number): CourseReviewReasonId[] {
  if (!flags) return [];
  return API_TO_COURSE_REVIEW_REASON.filter(([, mask]) => (flags & mask) !== 0).map(([reason]) => reason);
}

/** @deprecated Use `learningPathStatusToCourseStatusId` */
export const moderationStatusCodeToCourseStatus = learningPathStatusToCourseStatusId;

/** @deprecated Use `courseStatusIdToLearningPathStatus` */
export const courseStatusFilterToModerationQuery = courseStatusIdToLearningPathStatus;

/** @deprecated Use `courseAccessTypeFromApi` */
export const mapLearningPathCourseAccessType = courseAccessTypeFromApi;
