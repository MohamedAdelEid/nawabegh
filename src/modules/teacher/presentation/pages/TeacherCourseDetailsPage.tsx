"use client";

import { TeacherCourseDetailsView } from "@/modules/teacher/presentation/components/courses/TeacherCourseDetailsView";

export function TeacherCourseDetailsPage({ courseId }: { courseId: string }) {
  return <TeacherCourseDetailsView courseId={courseId} />;
}
