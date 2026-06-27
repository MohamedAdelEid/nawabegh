"use client";

import {
  DashboardFiltersSkeleton,
  DashboardHeaderSkeleton,
  DashboardStatCardsSkeleton,
  DashboardTableSkeleton,
} from "@/shared/presentation/components/dashboard/DashboardSkeletonParts";
import { SkeletonScreen } from "@/shared/presentation/components/ui/skeleton-screen";

export function TeacherLiveSessionsDashboardSkeleton({
  label,
  withHeader = true,
}: {
  label?: string;
  withHeader?: boolean;
}) {
  return (
    <SkeletonScreen className="space-y-6" label={label}>
      {withHeader ? <DashboardHeaderSkeleton withAction={false} /> : null}
      <DashboardFiltersSkeleton count={3} />
      <DashboardStatCardsSkeleton count={3} className="md:grid-cols-3 xl:grid-cols-3" />
      <DashboardTableSkeleton rows={6} showHeader={false} />
    </SkeletonScreen>
  );
}
