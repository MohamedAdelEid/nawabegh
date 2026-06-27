"use client";

import { SkeletonCard } from "@/shared/presentation/components/dashboard/DashboardSkeletonParts";
import { Skeleton } from "@/shared/presentation/components/ui/skeleton";
import { SkeletonScreen } from "@/shared/presentation/components/ui/skeleton-screen";

export function TeacherScheduleDashboardSkeleton({ label }: { label?: string }) {
  return (
    <SkeletonScreen className="space-y-6" label={label}>
      <div className="flex flex-col-reverse gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-3">
          <Skeleton className="h-8 w-48 rounded-xl" />
          <Skeleton className="h-4 w-64 max-w-full rounded-lg" />
        </div>
        <Skeleton className="h-11 w-52 rounded-xl" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[300px_1fr]">
        <div className="space-y-6">
          <Skeleton className="h-56 w-full rounded-[2rem]" />
          <SkeletonCard className="rounded-[2rem]">
            <div className="space-y-4">
              <Skeleton className="h-6 w-32 rounded-lg" />
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={`topic-${index}`} className="h-14 w-full rounded-2xl" />
              ))}
            </div>
          </SkeletonCard>
        </div>

        <div className="space-y-6">
          <SkeletonCard className="rounded-[2rem]">
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4 rounded-xl" />
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={`metric-${index}`} className="h-16 w-full rounded-2xl" />
                ))}
              </div>
              <div className="flex gap-3">
                <Skeleton className="h-11 w-36 rounded-xl" />
                <Skeleton className="h-11 w-28 rounded-xl" />
              </div>
            </div>
          </SkeletonCard>

          <SkeletonCard className="rounded-[2rem]">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-40 rounded-lg" />
                <div className="flex gap-2">
                  <Skeleton className="h-10 w-10 rounded-xl" />
                  <Skeleton className="h-10 w-10 rounded-xl" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
                {Array.from({ length: 7 }).map((_, index) => (
                  <Skeleton key={`day-${index}`} className="min-h-[120px] w-full rounded-2xl" />
                ))}
              </div>
            </div>
          </SkeletonCard>
        </div>
      </div>
    </SkeletonScreen>
  );
}
