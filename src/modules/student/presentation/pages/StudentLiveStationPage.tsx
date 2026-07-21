"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { LiveStationDashboard } from "@/modules/student/presentation/components/live-station/LiveStationDashboard";
import { LiveStationSkeleton } from "@/modules/student/presentation/components/live-station/LiveStationSkeleton";

type StudentLiveStationPageProps = {
  stationId: string;
};

function StudentLiveStationPageInner({ stationId }: StudentLiveStationPageProps) {
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId");
  const learningPathId = searchParams.get("pathId");

  return (
    <LiveStationDashboard
      stationId={stationId}
      courseId={courseId}
      learningPathId={learningPathId}
    />
  );
}

export function StudentLiveStationPage({ stationId }: StudentLiveStationPageProps) {
  return (
    <Suspense fallback={<LiveStationSkeleton />}>
      <StudentLiveStationPageInner stationId={stationId} />
    </Suspense>
  );
}
