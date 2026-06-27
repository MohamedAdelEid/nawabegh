"use client";

import {
  DashboardHeaderSkeleton,
  DashboardStatCardsSkeleton,
  SkeletonCard,
} from "@/shared/presentation/components/dashboard/DashboardSkeletonParts";
import { Skeleton } from "@/shared/presentation/components/ui/skeleton";
import { SkeletonScreen } from "@/shared/presentation/components/ui/skeleton-screen";

export function TeacherCourseStatisticsSkeleton({ label }: { label?: string }) {
  return (
    <SkeletonScreen className="space-y-6" label={label}>
      <DashboardHeaderSkeleton />

      <Skeleton className="min-h-[12rem] w-full rounded-[2rem]" />

      <DashboardStatCardsSkeleton count={5} className="xl:grid-cols-5" />

      <SkeletonCard className="rounded-[2rem]">
        <div className="space-y-4">
          <Skeleton className="h-6 w-48 rounded-lg" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </SkeletonCard>
    </SkeletonScreen>
  );
}
