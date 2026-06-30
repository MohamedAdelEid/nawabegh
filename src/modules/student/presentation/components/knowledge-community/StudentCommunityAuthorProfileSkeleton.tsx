"use client";

import {
  CommunityPageLayoutSkeleton,
  CommunitySidebarCardSkeleton,
} from "@/shared/presentation/components/community/CommunityPageLayoutSkeleton";
import { SkeletonCard } from "@/shared/presentation/components/dashboard/DashboardSkeletonParts";
import { Skeleton } from "@/shared/presentation/components/ui/skeleton";
import { SkeletonScreen } from "@/shared/presentation/components/ui/skeleton-screen";

export function StudentCommunityAuthorProfileSkeleton({ label }: { label?: string }) {
  return (
    <SkeletonScreen label={label}>
      <CommunityPageLayoutSkeleton
        sidebar={
          <>
            <CommunitySidebarCardSkeleton lines={4} />
            <CommunitySidebarCardSkeleton lines={3} />
            <CommunitySidebarCardSkeleton lines={4} />
          </>
        }
        main={
          <>
            <Skeleton className="ms-auto h-4 w-48 rounded-lg" />
            <SkeletonCard className="overflow-hidden rounded-[1.5rem] p-0">
              <Skeleton className="h-40 w-full rounded-none" />
              <div className="space-y-6 p-6">
                <div className="flex flex-col items-end gap-4 sm:flex-row sm:items-end">
                  <Skeleton className="h-24 w-24 rounded-full" />
                  <div className="space-y-2 text-right">
                    <Skeleton className="ms-auto h-7 w-48 rounded-lg" />
                    <Skeleton className="ms-auto h-4 w-36 rounded-lg" />
                    <Skeleton className="ms-auto h-4 w-64 max-w-full rounded-lg" />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={`stat-${index}`} className="h-20 w-full rounded-2xl" />
                  ))}
                </div>
                <Skeleton className="h-11 w-64 rounded-xl" />
              </div>
            </SkeletonCard>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={`post-${index}`} className="h-40 w-full rounded-[1.5rem]" />
              ))}
            </div>
          </>
        }
      />
    </SkeletonScreen>
  );
}
