"use client";

import { TeacherCourseSubscriberProfileDashboard } from "@/modules/teacher/presentation/components/courses/subscribers";

export function TeacherCourseSubscriberProfilePage({
  courseId,
  studentUserId,
}: {
  courseId: string;
  studentUserId: string;
}) {
  return (
    <TeacherCourseSubscriberProfileDashboard courseId={courseId} studentUserId={studentUserId} />
  );
}
