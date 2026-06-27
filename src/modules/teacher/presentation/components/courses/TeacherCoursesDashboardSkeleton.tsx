"use client";

import {
  DashboardFiltersSkeleton,
  DashboardHeaderSkeleton,
  DashboardStatCardsSkeleton,
  DashboardTableSkeleton,
} from "@/shared/presentation/components/dashboard/DashboardSkeletonParts";
import { SkeletonScreen } from "@/shared/presentation/components/ui/skeleton-screen";

export function TeacherCoursesDashboardSkeleton({ label }: { label?: string }) {
  return (
    <SkeletonScreen className="space-y-6" label={label}>
      <DashboardHeaderSkeleton />
      <DashboardStatCardsSkeleton count={4} />
      <DashboardFiltersSkeleton count={4} />
      <DashboardTableSkeleton rows={6} />
    </SkeletonScreen>
  );
}
