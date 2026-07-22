"use client";

import { ParentCourseDetailDashboard } from "@/modules/parent/presentation/components/learning/ParentCourseDetailDashboard";

type ParentCourseDetailPageProps = {
  courseId: string;
};

export function ParentCourseDetailPage({ courseId }: ParentCourseDetailPageProps) {
  return <ParentCourseDetailDashboard courseId={courseId} />;
}
