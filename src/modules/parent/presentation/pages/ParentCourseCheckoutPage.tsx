"use client";

import { ParentCheckoutDashboard } from "@/modules/parent/presentation/components/checkout/ParentCheckoutDashboard";

type ParentCourseCheckoutPageProps = {
  courseId: string;
  studentUserId?: string;
  initialSessionId?: string;
};

export function ParentCourseCheckoutPage({
  courseId,
  studentUserId,
  initialSessionId,
}: ParentCourseCheckoutPageProps) {
  return (
    <ParentCheckoutDashboard
      courseId={courseId}
      studentUserId={studentUserId}
      initialSessionId={initialSessionId}
    />
  );
}
