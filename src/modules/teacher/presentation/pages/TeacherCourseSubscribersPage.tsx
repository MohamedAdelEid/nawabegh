"use client";

import { TeacherCourseSubscribersDashboard } from "@/modules/teacher/presentation/components/courses/subscribers";

export function TeacherCourseSubscribersPage({ courseId }: { courseId: string }) {
  return <TeacherCourseSubscribersDashboard courseId={courseId} />;
}
