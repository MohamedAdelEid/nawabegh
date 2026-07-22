"use client";

import { useParams } from "next/navigation";
import { ParentChildLearningDashboard } from "@/modules/parent/presentation/components/learning/ParentChildLearningDashboard";

export function ParentChildLearningPage() {
  const params = useParams<{ studentUserId: string }>();
  const studentUserId = decodeURIComponent(params.studentUserId ?? "");

  return <ParentChildLearningDashboard studentUserId={studentUserId} />;
}
