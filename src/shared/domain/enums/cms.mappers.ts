import {
  CourseAccessType,
  CourseRejectionReasons,
  CourseStatus,
  CourseTerm,
} from "@/shared/domain/enums/course.enums";
import { LearningPathStatus } from "@/shared/domain/enums/learning-path.enums";

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

function normalizeApiEnumToken(value: string): string {
  return value.trim().toLowerCase().replace(/[\s_-]+/g, "");
}

function mapNumericCourseStatus(code: number): CourseStatusId {
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

export function courseStatusFromApi(code: unknown): CourseStatusId {
  if (typeof code === "string") {
    switch (normalizeApiEnumToken(code)) {
      case "approved":
        return "approved";
      case "pending":
        return "pending";
      case "rejected":
        return "rejected";
      case "archived":
        return "archived";
      case "draft":
        return "draft";
      default: {
        const numeric = Number(code);
        if (!Number.isNaN(numeric)) return mapNumericCourseStatus(numeric);
        return "draft";
      }
    }
  }

  if (typeof code === "number" && Number.isFinite(code)) {
    return mapNumericCourseStatus(code);
  }

  return "draft";
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

export function courseAccessTypeFromApi(value: unknown): CourseAccessTypeId {
  if (typeof value === "string") {
    switch (normalizeApiEnumToken(value)) {
      case "free":
        return "free";
      case "paid":
        return "paid";
      case "subscription":
        return "subscription";
      default: {
        const numeric = Number(value);
        if (!Number.isNaN(numeric)) return courseAccessTypeFromApi(numeric);
        return "unlisted";
      }
    }
  }

  if (typeof value === "number" && Number.isFinite(value)) {
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

  if (value === null || value === undefined) return "unlisted";
  return "unlisted";
}

export function courseAccessTypeToApiNumber(value: unknown): number {
  switch (courseAccessTypeFromApi(value)) {
    case "free":
      return CourseAccessType.Free;
    case "paid":
      return CourseAccessType.Paid;
    case "subscription":
      return CourseAccessType.Subscription;
    default:
      return CourseAccessType.Free;
  }
}

export function courseTermFromApi(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;

  if (typeof value === "string") {
    switch (normalizeApiEnumToken(value)) {
      case "firstterm":
        return CourseTerm.FirstTerm;
      case "secondterm":
        return CourseTerm.SecondTerm;
      case "thirdterm":
        return CourseTerm.ThirdTerm;
      default: {
        const numeric = Number(value);
        if (!Number.isNaN(numeric)) return numeric;
        return CourseTerm.FirstTerm;
      }
    }
  }

  return CourseTerm.FirstTerm;
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
