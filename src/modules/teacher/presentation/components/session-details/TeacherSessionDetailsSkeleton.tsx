"use client";

import {
  DashboardHeaderSkeleton,
  SkeletonCard,
} from "@/shared/presentation/components/dashboard/DashboardSkeletonParts";
import { Skeleton } from "@/shared/presentation/components/ui/skeleton";
import { SkeletonScreen } from "@/shared/presentation/components/ui/skeleton-screen";

export function TeacherSessionDetailsSkeleton({ label }: { label?: string }) {
  return (
    <SkeletonScreen className="space-y-6" label={label}>
      <DashboardHeaderSkeleton />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-6">
          <SkeletonCard className="rounded-[2rem]">
            <div className="space-y-4">
              <Skeleton className="h-6 w-40 rounded-lg" />
              <Skeleton className="h-4 w-full rounded-lg" />
              <Skeleton className="h-4 w-5/6 rounded-lg" />
              <div className="grid gap-4 md:grid-cols-2">
                <Skeleton className="h-16 w-full rounded-2xl" />
                <Skeleton className="h-16 w-full rounded-2xl" />
              </div>
            </div>
          </SkeletonCard>
          <SkeletonCard className="rounded-[2rem]">
            <div className="space-y-4">
              <Skeleton className="h-6 w-32 rounded-lg" />
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={`resource-${index}`} className="h-16 w-full rounded-2xl" />
              ))}
            </div>
          </SkeletonCard>
        </div>
        <SkeletonCard className="rounded-[2rem]">
          <div className="space-y-4">
            <Skeleton className="h-6 w-28 rounded-lg" />
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={`aside-${index}`} className="h-12 w-full rounded-xl" />
            ))}
          </div>
        </SkeletonCard>
      </div>
    </SkeletonScreen>
  );
}
