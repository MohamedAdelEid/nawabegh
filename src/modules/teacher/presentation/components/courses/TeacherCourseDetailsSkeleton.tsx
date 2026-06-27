"use client";

import {
  DashboardStatCardsSkeleton,
  SkeletonCard,
} from "@/shared/presentation/components/dashboard/DashboardSkeletonParts";
import { Skeleton } from "@/shared/presentation/components/ui/skeleton";
import { SkeletonScreen } from "@/shared/presentation/components/ui/skeleton-screen";

export function TeacherCourseDetailsSkeleton({ label }: { label?: string }) {
  return (
    <SkeletonScreen className="space-y-6" label={label}>
      <Skeleton className="min-h-[16rem] w-full rounded-[2rem]" />

      <SkeletonCard className="rounded-[2rem]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-14 w-14 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-20 rounded-lg" />
              <Skeleton className="h-5 w-32 rounded-lg" />
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Skeleton className="h-10 w-36 rounded-xl" />
            <Skeleton className="h-10 w-32 rounded-xl" />
            <Skeleton className="h-10 w-32 rounded-xl" />
          </div>
        </div>
      </SkeletonCard>

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <DashboardStatCardsSkeleton count={4} className="sm:grid-cols-2 xl:grid-cols-4" />
          <SkeletonCard className="rounded-[2rem]">
            <div className="space-y-4">
              <Skeleton className="h-6 w-40 rounded-lg" />
              <Skeleton className="h-40 w-full rounded-2xl" />
            </div>
          </SkeletonCard>
        </div>
        <SkeletonCard className="rounded-[2rem]">
          <div className="space-y-4">
            <Skeleton className="h-6 w-32 rounded-lg" />
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={`aside-${index}`} className="h-12 w-full rounded-xl" />
            ))}
          </div>
        </SkeletonCard>
      </div>
    </SkeletonScreen>
  );
}
