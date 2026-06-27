"use client";

import { Suspense } from "react";
import { ProgressPathDashboard } from "@/modules/student/presentation/components/progress-path/ProgressPathDashboard";
import { ProgressPathSkeleton } from "@/modules/student/presentation/components/progress-path/ProgressPathSkeleton";

export function StudentProgressPathPage() {
  return (
    <Suspense fallback={<ProgressPathSkeleton />}>
      <ProgressPathDashboard />
    </Suspense>
  );
}
