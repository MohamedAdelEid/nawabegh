import { CourseAccessType } from "@/shared/domain/enums/course.enums";
import type { CourseCardModel } from "@/shared/domain/types/course.types";

export type CourseCtaVariant = "continue" | "enrollFree" | "startNow";

export function getCourseCtaVariant(course: CourseCardModel): CourseCtaVariant {
  if (course.isEnrolled) return "continue";
  if (course.accessType === CourseAccessType.Free) return "enrollFree";
  return "startNow";
}
