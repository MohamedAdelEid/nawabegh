"use client";

import { TeacherCourseStatisticsDashboard } from "@/modules/teacher/presentation/components/courses/TeacherCourseStatisticsDashboard";

export function TeacherCourseStatisticsPage({ courseId }: { courseId: string }) {
  return <TeacherCourseStatisticsDashboard courseId={courseId} />;
}
