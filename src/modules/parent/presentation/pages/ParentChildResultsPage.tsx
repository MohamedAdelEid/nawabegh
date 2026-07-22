"use client";

import { useParams } from "next/navigation";
import { ParentChildResultsDashboard } from "@/modules/parent/presentation/components/learning/ParentChildResultsDashboard";

export function ParentChildResultsPage() {
  const params = useParams<{ studentUserId: string; courseId: string }>();
  const studentUserId = decodeURIComponent(params.studentUserId ?? "");
  const courseId = decodeURIComponent(params.courseId ?? "");

  return <ParentChildResultsDashboard studentUserId={studentUserId} courseId={courseId} />;
}
