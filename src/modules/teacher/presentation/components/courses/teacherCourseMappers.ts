import type { CourseAccessTypeId, CourseStatusId } from "@/shared/domain/enums/cms.mappers";
import type {
  TeacherCourseAccessType,
  TeacherCourseStatus,
} from "@/modules/teacher/domain/types/teacher.types";

export function teacherCourseStatusToBadge(status: TeacherCourseStatus): CourseStatusId {
  return status;
}

export function teacherCourseAccessToBadge(access: TeacherCourseAccessType): CourseAccessTypeId {
  if (access === "unspecified") return "unlisted";
  return access;
}
