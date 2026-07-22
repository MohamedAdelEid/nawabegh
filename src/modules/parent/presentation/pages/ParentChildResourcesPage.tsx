"use client";

import { useParams } from "next/navigation";
import { ParentChildResourcesDashboard } from "@/modules/parent/presentation/components/learning/ParentChildResourcesDashboard";

export function ParentChildResourcesPage() {
  const params = useParams<{ studentUserId: string }>();
  const studentUserId = decodeURIComponent(params.studentUserId ?? "");

  return <ParentChildResourcesDashboard studentUserId={studentUserId} />;
}
