"use client";

import { useParams } from "next/navigation";
import { ParentChildReportDashboard } from "@/modules/parent/presentation/components/children/ParentChildReportDashboard";

export function ParentChildReportPage() {
  const params = useParams<{ studentUserId: string }>();
  const studentUserId = decodeURIComponent(params.studentUserId ?? "");

  return <ParentChildReportDashboard studentUserId={studentUserId} />;
}
