"use client";

import {
  DashboardHeaderSkeleton,
  DashboardTableSkeleton,
} from "@/shared/presentation/components/dashboard/DashboardSkeletonParts";
import { Skeleton } from "@/shared/presentation/components/ui/skeleton";
import { SkeletonScreen } from "@/shared/presentation/components/ui/skeleton-screen";

export function TeacherAbsentStudentsDashboardSkeleton({ label }: { label?: string }) {
  return (
    <SkeletonScreen className="space-y-6" label={label}>
      <DashboardHeaderSkeleton withAction={false} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-11 w-full max-w-md rounded-xl" />
        <Skeleton className="h-11 w-36 rounded-xl" />
      </div>

      <DashboardTableSkeleton rows={6} showHeader={false} />
    </SkeletonScreen>
  );
}
