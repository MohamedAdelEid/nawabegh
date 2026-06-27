import { CourseAccessType } from "@/shared/domain/enums/course.enums";
import type { CourseDetailsModel } from "@/shared/domain/types/course.types";

export type CourseDetailsCtaVariant = "continue" | "enrollFree" | "subscribeNow";

export function getCourseDetailsCtaVariant(
  course: Pick<CourseDetailsModel, "isEnrolled" | "accessType">,
): CourseDetailsCtaVariant {
  if (course.isEnrolled) return "continue";
  if (course.accessType === CourseAccessType.Free) return "enrollFree";
  return "subscribeNow";
}
