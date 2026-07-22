"use client";

import { useParams } from "next/navigation";
import { ParentFlashcardsDashboard } from "@/modules/parent/presentation/components/learning/ParentFlashcardsDashboard";

export function ParentFlashcardsPage() {
  const params = useParams<{ studentUserId: string; stationId: string }>();
  const studentUserId = decodeURIComponent(params.studentUserId ?? "");
  const stationId = decodeURIComponent(params.stationId ?? "");

  return <ParentFlashcardsDashboard studentUserId={studentUserId} stationId={stationId} />;
}
