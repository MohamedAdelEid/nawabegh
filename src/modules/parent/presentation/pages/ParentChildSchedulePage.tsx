"use client";

import { useParams } from "next/navigation";
import { ParentChildScheduleDashboard } from "@/modules/parent/presentation/components/children/ParentChildScheduleDashboard";

export function ParentChildSchedulePage() {
  const params = useParams<{ studentUserId: string }>();
  const studentUserId = decodeURIComponent(params.studentUserId ?? "");

  return <ParentChildScheduleDashboard studentUserId={studentUserId} />;
}
