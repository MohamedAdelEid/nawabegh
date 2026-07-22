"use client";

import { useParams } from "next/navigation";
import { ParentChildSettingsDashboard } from "@/modules/parent/presentation/components/children/ParentChildSettingsDashboard";

export function ParentChildSettingsPage() {
  const params = useParams<{ studentUserId: string }>();
  const studentUserId = decodeURIComponent(params.studentUserId ?? "");

  return <ParentChildSettingsDashboard studentUserId={studentUserId} />;
}
