import type { CourseStatusId } from "@/shared/domain/enums/cms.mappers";

/** `POST /Course/{id}/approve` — valid from Draft or Pending. */
export function canApproveCourse(statusId: CourseStatusId): boolean {
  return statusId === "draft" || statusId === "pending";
}

/** `POST /Course/{id}/reject` — valid from Pending only. */
export function canRejectCourse(statusId: CourseStatusId): boolean {
  return statusId === "pending";
}

/** `POST /Course/{id}/archive` — valid from Approved only. */
export function canArchiveCourse(statusId: CourseStatusId): boolean {
  return statusId === "approved";
}

/** `POST /Course/{id}/unpublish` — keeps Approved, sets isPublished false. */
export function canUnpublishCourse(statusId: CourseStatusId, isPublished: boolean): boolean {
  return statusId === "approved" && isPublished;
}

/** `POST /Course/{id}/publish` — valid when Approved and not yet in catalog. */
export function canPublishCourse(statusId: CourseStatusId, isPublished: boolean): boolean {
  return statusId === "approved" && !isPublished;
}
