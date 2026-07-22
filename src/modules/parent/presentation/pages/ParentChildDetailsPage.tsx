"use client";

import { useParams } from "next/navigation";
import { ParentChildDetailsDashboard } from "@/modules/parent/presentation/components/children/ParentChildDetailsDashboard";

export function ParentChildDetailsPage() {
  const params = useParams<{ studentUserId: string }>();
  const studentUserId = decodeURIComponent(params.studentUserId ?? "");

  return <ParentChildDetailsDashboard studentUserId={studentUserId} />;
}
