"use client";

import { useParams } from "next/navigation";
import { ParentQuizReviewDashboard } from "@/modules/parent/presentation/components/learning/ParentQuizReviewDashboard";

export function ParentQuizReviewPage() {
  const params = useParams<{ studentUserId: string; stationId: string }>();
  const studentUserId = decodeURIComponent(params.studentUserId ?? "");
  const stationId = decodeURIComponent(params.stationId ?? "");

  return <ParentQuizReviewDashboard studentUserId={studentUserId} stationId={stationId} />;
}
