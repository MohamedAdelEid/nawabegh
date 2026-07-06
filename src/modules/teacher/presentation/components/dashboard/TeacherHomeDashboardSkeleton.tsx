"use client";

import {
  DashboardStatCardsSkeleton,
  SkeletonCard,
} from "@/shared/presentation/components/dashboard/DashboardSkeletonParts";
import { Skeleton } from "@/shared/presentation/components/ui/skeleton";
import { SkeletonScreen } from "@/shared/presentation/components/ui/skeleton-screen";

export function TeacherHomeDashboardSkeleton({ label }: { label?: string }) {
  return (
    <SkeletonScreen className="space-y-6" label={label}>
      <DashboardStatCardsSkeleton count={4} className="grid-cols-1 sm:grid-cols-2 xl:grid-cols-4" />

      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-[1fr_320px]">
        <div className="min-w-0 space-y-6">
          <SkeletonCard className="rounded-[2rem]">
            <div className="space-y-4">
              <Skeleton className="h-6 w-48 rounded-lg" />
              <Skeleton className="h-64 w-full rounded-2xl" />
            </div>
          </SkeletonCard>
          <SkeletonCard className="rounded-[2rem]">
            <div className="space-y-4">
              <Skeleton className="h-6 w-40 rounded-lg" />
              <div className="grid gap-6 md:grid-cols-2">
                <Skeleton className="h-56 w-full rounded-[1.5rem]" />
                <Skeleton className="h-56 w-full rounded-[1.5rem]" />
              </div>
            </div>
          </SkeletonCard>
        </div>
        <div className="min-w-0 space-y-6">
          <SkeletonCard className="rounded-[2rem]">
            <div className="space-y-4">
              <Skeleton className="ms-auto h-6 w-36 rounded-lg" />
              {Array.from({ length: 2 }).map((_, index) => (
                <Skeleton key={`live-${index}`} className="h-24 w-full rounded-2xl" />
              ))}
            </div>
          </SkeletonCard>
          <SkeletonCard className="rounded-[2rem]">
            <div className="space-y-4">
              <Skeleton className="ms-auto h-6 w-28 rounded-lg" />
              {Array.from({ length: 2 }).map((_, index) => (
                <Skeleton key={`alert-${index}`} className="h-20 w-full rounded-2xl" />
              ))}
            </div>
          </SkeletonCard>
          <Skeleton className="h-40 w-full rounded-[2rem]" />
        </div>
      </div>
    </SkeletonScreen>
  );
}
