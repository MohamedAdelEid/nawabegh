"use client";

import { useParams, useSearchParams } from "next/navigation";
import { ParentResourceViewerDashboard } from "@/modules/parent/presentation/components/learning/ParentResourceViewerDashboard";

export function ParentResourceViewPage() {
  const params = useParams<{ studentUserId: string; resourceId: string }>();
  const searchParams = useSearchParams();
  const studentUserId = decodeURIComponent(params.studentUserId ?? "");
  const resourceId = decodeURIComponent(params.resourceId ?? "");
  const kindHint = searchParams.get("kind");

  return (
    <ParentResourceViewerDashboard
      studentUserId={studentUserId}
      resourceId={resourceId}
      kindHint={kindHint}
    />
  );
}
