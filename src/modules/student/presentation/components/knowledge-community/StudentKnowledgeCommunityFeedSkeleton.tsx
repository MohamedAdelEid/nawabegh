"use client";

import { SkeletonCard } from "@/shared/presentation/components/dashboard/DashboardSkeletonParts";
import { Skeleton } from "@/shared/presentation/components/ui/skeleton";
import { SkeletonScreen } from "@/shared/presentation/components/ui/skeleton-screen";

export function StudentKnowledgeCommunityFeedSkeleton({ label }: { label?: string }) {
  return (
    <SkeletonScreen className="space-y-4" label={label}>
      {Array.from({ length: 3 }).map((_, index) => (
        <SkeletonCard key={`post-${index}`} className="rounded-[1.5rem]">
          <div className="flex items-start justify-between gap-4">
            <div className="flex -space-x-2 rtl:space-x-reverse">
              <Skeleton className="h-9 w-9 rounded-full" />
            </div>
            <div className="min-w-0 flex-1 space-y-3 text-right">
              <Skeleton className="ms-auto h-5 w-3/4 rounded-lg" />
              <Skeleton className="ms-auto h-4 w-full rounded-lg" />
              <Skeleton className="ms-auto h-4 w-5/6 rounded-lg" />
              <div className="flex justify-end gap-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            </div>
          </div>
        </SkeletonCard>
      ))}
    </SkeletonScreen>
  );
}
