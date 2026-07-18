"use client";

import { SkeletonCard } from "@/shared/presentation/components/dashboard/DashboardSkeletonParts";
import { Skeleton } from "@/shared/presentation/components/ui/skeleton";
import { SkeletonScreen } from "@/shared/presentation/components/ui/skeleton-screen";

export function SchoolAccountSettingsSkeleton({ label }: { label?: string }) {
  return (
    <SkeletonScreen className="space-y-6" label={label}>
      <div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-3 text-right">
          <Skeleton className="ms-auto h-8 w-56 rounded-xl" />
          <Skeleton className="ms-auto h-4 w-72 max-w-full rounded-lg" />
        </div>
        <Skeleton className="h-12 w-40 rounded-2xl" />
      </div>

      <SkeletonCard className="overflow-hidden rounded-[2rem] p-0">
        <Skeleton className="h-48 w-full rounded-none" />
        <div className="space-y-5 p-6 sm:p-8">
          <div className="-mt-16 flex justify-end">
            <Skeleton className="h-28 w-28 rounded-2xl border-4 border-white" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-14 w-full rounded-xl" />
            <Skeleton className="h-14 w-full rounded-xl" />
          </div>
          <Skeleton className="h-28 w-full rounded-xl" />
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-14 w-full rounded-xl" />
            <Skeleton className="h-14 w-full rounded-xl" />
          </div>
          <Skeleton className="h-14 w-full rounded-xl" />
        </div>
      </SkeletonCard>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <SkeletonCard className="rounded-[2rem]">
          <div className="space-y-4">
            <Skeleton className="ms-auto h-6 w-40 rounded-lg" />
            <Skeleton className="h-14 w-full rounded-xl" />
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-14 w-full rounded-xl" />
              <Skeleton className="h-14 w-full rounded-xl" />
            </div>
            <Skeleton className="h-14 w-full rounded-xl" />
          </div>
        </SkeletonCard>
        <SkeletonCard className="rounded-[2rem]">
          <div className="space-y-4">
            <Skeleton className="ms-auto h-6 w-28 rounded-lg" />
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={`notification-skel-${index}`} className="flex items-center justify-between gap-3">
                <Skeleton className="h-8 w-14 rounded-full" />
                <Skeleton className="h-4 w-28 rounded-lg" />
              </div>
            ))}
          </div>
        </SkeletonCard>
      </div>

      <SkeletonCard className="rounded-[2rem]">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <Skeleton className="h-10 w-48 rounded-xl" />
            <Skeleton className="h-6 w-40 rounded-lg" />
          </div>
          {Array.from({ length: 2 }).map((_, index) => (
            <Skeleton key={`session-skel-${index}`} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      </SkeletonCard>
    </SkeletonScreen>
  );
}
