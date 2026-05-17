import type {
  CourseAccessTypeId,
  CourseReviewReasonId,
  CourseStatusId,
} from "@/modules/admin/domain/data/courseManagementData";

/** Backend moderation status codes for learning paths (`status` on list/detail). Adjust if API contract differs. */
export const LEARNING_PATH_MODERATION_STATUS = {
  draft: 0,
  pending: 1,
  approved: 2,
  rejected: 3,
} as const;

export type LearningPathReviewListSnapshot = {
  teacherName: string;
  teacherProfileImageUrl: string | null;
  subjectNameAr: string;
  gradeNameAr: string;
  courseTitle: string;
  courseCoverImageUrl: string | null;
  courseId: string;
  courseAccessType: number;
};

const SNAPSHOT_KEY_PREFIX = "nawabegh.lpReview.snapshot:";

export function persistLearningPathReviewSnapshot(
  learningPathId: string,
  snapshot: LearningPathReviewListSnapshot,
): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(`${SNAPSHOT_KEY_PREFIX}${learningPathId}`, JSON.stringify(snapshot));
  } catch {
    /* ignore quota / privacy mode */
  }
}

export function readLearningPathReviewSnapshot(
  learningPathId: string,
): LearningPathReviewListSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(`${SNAPSHOT_KEY_PREFIX}${learningPathId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LearningPathReviewListSnapshot;
    return parsed ?? null;
  } catch {
    return null;
  }
}

export function clearLearningPathReviewSnapshot(learningPathId: string): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(`${SNAPSHOT_KEY_PREFIX}${learningPathId}`);
  } catch {
    /* ignore */
  }
}

export function moderationStatusCodeToCourseStatus(code: number): CourseStatusId {
  switch (code) {
    case LEARNING_PATH_MODERATION_STATUS.approved:
      return "approved";
    case LEARNING_PATH_MODERATION_STATUS.pending:
      return "pending";
    case LEARNING_PATH_MODERATION_STATUS.rejected:
      return "rejected";
    case LEARNING_PATH_MODERATION_STATUS.draft:
      return "draft";
    default:
      return "draft";
  }
}

export function courseStatusFilterToModerationQuery(
  status: "all" | CourseStatusId,
): number | undefined {
  if (status === "all") return undefined;
  switch (status) {
    case "draft":
      return LEARNING_PATH_MODERATION_STATUS.draft;
    case "pending":
      return LEARNING_PATH_MODERATION_STATUS.pending;
    case "approved":
      return LEARNING_PATH_MODERATION_STATUS.approved;
    case "rejected":
      return LEARNING_PATH_MODERATION_STATUS.rejected;
    default:
      return undefined;
  }
}

/** Guess map for `courseAccessType` integers until enums are documented. */
export function mapLearningPathCourseAccessType(value: number | null): CourseAccessTypeId {
  if (value === null || Number.isNaN(value)) return "unlisted";
  switch (value) {
    case 0:
      return "free";
    case 1:
      return "subscription";
    case 2:
      return "paid";
    default:
      return "unlisted";
  }
}

/**
 * Packed flags for reject payload (`rejectionReasons` on detail is numeric).
 * Bitmask can be reconciled when backend enum is confirmed.
 */
const REJECTION_REASON_FLAGS: Record<CourseReviewReasonId, number> = {
  contentQuality: 1,
  incompleteMaterials: 2,
  technicalIssues: 4,
  policyConflict: 8,
  copyrightIssue: 16,
};

export function rejectionReasonIdsToBitmask(reasons: CourseReviewReasonId[]): number {
  return reasons.reduce((acc, id) => acc | (REJECTION_REASON_FLAGS[id] ?? 0), 0);
}

const FLAGS_BY_REASON_ENTRIES = Object.entries(REJECTION_REASON_FLAGS) as Array<[CourseReviewReasonId, number]>;

export function rejectionBitmaskToReasonIds(flags: number): CourseReviewReasonId[] {
  if (!flags) return [];
  return FLAGS_BY_REASON_ENTRIES.filter(([, mask]) => (flags & mask) !== 0).map(([reason]) => reason);
}
