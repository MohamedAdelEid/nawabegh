"use client";

import { TeacherCourseCreateDashboard } from "@/modules/teacher/presentation/components/courses/TeacherCourseCreateDashboard";

export function TeacherCourseCreatePage({ courseId }: { courseId?: string }) {
  return <TeacherCourseCreateDashboard courseId={courseId} />;
}
