"use client";

import { HelperResourceDashboard } from "@/modules/student/presentation/components/helper-resource/HelperResourceDashboard";

type StudentHelperResourcePageProps = {
  stationId: string;
  fileId?: string | null;
};

export function StudentHelperResourcePage({
  stationId,
  fileId,
}: StudentHelperResourcePageProps) {
  return (
    <HelperResourceDashboard stationId={stationId} initialFileId={fileId} />
  );
}
