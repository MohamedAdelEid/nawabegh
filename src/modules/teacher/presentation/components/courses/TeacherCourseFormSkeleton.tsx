"use client";

import {
  DashboardHeaderSkeleton,
  SkeletonCard,
} from "@/shared/presentation/components/dashboard/DashboardSkeletonParts";
import { Skeleton } from "@/shared/presentation/components/ui/skeleton";
import { SkeletonScreen } from "@/shared/presentation/components/ui/skeleton-screen";

export function TeacherCourseFormSkeleton({ label }: { label?: string }) {
  return (
    <SkeletonScreen className="space-y-6" label={label}>
      <DashboardHeaderSkeleton />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <SkeletonCard className="rounded-[2rem]">
          <div className="space-y-6">
            <Skeleton className="h-6 w-40 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24 rounded-lg" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-28 rounded-lg" />
              <Skeleton className="h-28 w-full rounded-xl" />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 2 }).map((_, index) => (
                <div key={`field-${index}`} className="space-y-2">
                  <Skeleton className="h-4 w-20 rounded-lg" />
                  <Skeleton className="h-12 w-full rounded-xl" />
                </div>
              ))}
            </div>
          </div>
        </SkeletonCard>

        <SkeletonCard className="rounded-[2rem]">
          <div className="space-y-4">
            <Skeleton className="h-6 w-28 rounded-lg" />
            <Skeleton className="h-40 w-full rounded-2xl" />
            <Skeleton className="h-4 w-3/4 rounded-lg" />
            <Skeleton className="h-4 w-1/2 rounded-lg" />
          </div>
        </SkeletonCard>
      </div>
    </SkeletonScreen>
  );
}
