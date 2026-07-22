"use client";

import { useParams } from "next/navigation";
import { ParentChildStationDashboard } from "@/modules/parent/presentation/components/learning/ParentChildStationDashboard";

export function ParentChildStationPage() {
  const params = useParams<{ studentUserId: string; stationId: string }>();
  const studentUserId = decodeURIComponent(params.studentUserId ?? "");
  const stationId = decodeURIComponent(params.stationId ?? "");

  return <ParentChildStationDashboard studentUserId={studentUserId} stationId={stationId} />;
}
