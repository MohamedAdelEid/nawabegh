"use client";

import { useParams } from "next/navigation";
import { ParentCourseJourneyDashboard } from "@/modules/parent/presentation/components/learning/ParentCourseJourneyDashboard";

export function ParentCourseJourneyPage() {
  const params = useParams<{ studentUserId: string; courseId: string }>();
  const studentUserId = decodeURIComponent(params.studentUserId ?? "");
  const courseId = decodeURIComponent(params.courseId ?? "");

  return <ParentCourseJourneyDashboard studentUserId={studentUserId} courseId={courseId} />;
}
