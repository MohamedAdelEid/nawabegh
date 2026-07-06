export type {
  CourseAccessTypeId,
  CourseReviewReasonId,
  CourseStatusId,
} from "@/shared/domain/enums/cms.mappers";

export {
  courseAccessTypeFromApi,
  courseStatusIdToLearningPathStatus,
  courseStatusFilterToModerationQuery,
  learningPathStatusToCourseStatusId,
  LEARNING_PATH_MODERATION_STATUS,
  mapLearningPathCourseAccessType,
  moderationStatusCodeToCourseStatus,
  rejectionBitmaskToReasonIds,
  rejectionReasonIdsToBitmask,
} from "@/shared/domain/enums/cms.mappers";

export type LearningPathReviewListSnapshot = {
  teacherName: string;
  teacherProfileImageUrl: string | null;
  subjectNameAr: string;
  gradeNameAr: string;
  gradeNameEn: string;
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
