"use client";

import { useParams } from "next/navigation";
import { ParentChildCoursesDashboard } from "@/modules/parent/presentation/components/learning/ParentChildCoursesDashboard";

export function ParentChildCoursesPage() {
  const params = useParams<{ studentUserId: string }>();
  const studentUserId = decodeURIComponent(params.studentUserId ?? "");

  return <ParentChildCoursesDashboard studentUserId={studentUserId} />;
}
