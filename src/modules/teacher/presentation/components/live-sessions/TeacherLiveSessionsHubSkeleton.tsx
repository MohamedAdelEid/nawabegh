"use client";

import {
  DashboardStatCardsSkeleton,
  SkeletonCard,
} from "@/shared/presentation/components/dashboard/DashboardSkeletonParts";
import { Skeleton } from "@/shared/presentation/components/ui/skeleton";
import { SkeletonScreen } from "@/shared/presentation/components/ui/skeleton-screen";

export function TeacherLiveSessionsHubSkeleton({ label }: { label?: string }) {
  return (
    <SkeletonScreen className="space-y-6" label={label}>
      <div className="flex flex-col-reverse gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-3">
          <Skeleton className="h-8 w-56 rounded-xl" />
          <Skeleton className="h-4 w-72 max-w-full rounded-lg" />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Skeleton className="h-11 w-52 rounded-xl" />
          <Skeleton className="h-11 w-32 rounded-xl" />
          <Skeleton className="h-11 w-36 rounded-xl" />
        </div>
      </div>

      <DashboardStatCardsSkeleton count={4} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <SkeletonCard className="rounded-[2rem]">
          <Skeleton className="h-64 w-full rounded-2xl" />
        </SkeletonCard>
        <SkeletonCard className="rounded-[2rem]">
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={`aside-${index}`} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        </SkeletonCard>
      </div>
    </SkeletonScreen>
  );
}
