"use client";

import { SkeletonCard } from "@/shared/presentation/components/dashboard/DashboardSkeletonParts";
import { Skeleton } from "@/shared/presentation/components/ui/skeleton";
import { SkeletonScreen } from "@/shared/presentation/components/ui/skeleton-screen";

export function TeacherAccountSettingsSkeleton({ label }: { label?: string }) {
  return (
    <SkeletonScreen
      className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]"
      label={label}
    >
      <SkeletonCard className="rounded-[2rem]">
        <div className="flex flex-col items-center space-y-4 text-center">
          <Skeleton className="h-28 w-28 rounded-full" />
          <Skeleton className="h-6 w-40 rounded-lg" />
          <Skeleton className="h-4 w-48 rounded-lg" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
      </SkeletonCard>
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <SkeletonCard key={`section-${index}`} className="rounded-[2rem]">
            <div className="space-y-4">
              <Skeleton className="ms-auto h-6 w-40 rounded-lg" />
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
              {index === 0 ? <Skeleton className="h-24 w-full rounded-xl" /> : null}
            </div>
          </SkeletonCard>
        ))}
      </div>
    </SkeletonScreen>
  );
}
