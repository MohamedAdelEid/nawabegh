"use client";

import {
  DashboardHeaderSkeleton,
  DashboardStatCardsSkeleton,
  SkeletonCard,
} from "@/shared/presentation/components/dashboard/DashboardSkeletonParts";
import { Skeleton } from "@/shared/presentation/components/ui/skeleton";
import { SkeletonScreen } from "@/shared/presentation/components/ui/skeleton-screen";

export function TeacherCoursesStatisticsOverviewSkeleton({ label }: { label?: string }) {
  return (
    <SkeletonScreen className="space-y-6" label={label}>
      <DashboardHeaderSkeleton withAction={false} />

      <DashboardStatCardsSkeleton
        count={6}
        className="md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6"
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <SkeletonCard className="rounded-[2rem]">
          <div className="space-y-4">
            <Skeleton className="h-6 w-44 rounded-lg" />
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
        </SkeletonCard>
        <SkeletonCard className="rounded-[2rem]">
          <div className="space-y-4">
            <Skeleton className="h-6 w-32 rounded-lg" />
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={`aside-${index}`} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        </SkeletonCard>
      </div>
    </SkeletonScreen>
  );
}
