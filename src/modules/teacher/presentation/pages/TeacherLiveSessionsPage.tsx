"use client";

import { Suspense } from "react";
import { TeacherLiveSessionsHubDashboard } from "@/modules/teacher/presentation/components/live-sessions/TeacherLiveSessionsHubDashboard";
import { Skeleton } from "@/shared/presentation/components/ui/skeleton";

export function TeacherLiveSessionsPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-[2rem]" />}>
      <TeacherLiveSessionsHubDashboard />
    </Suspense>
  );
}
