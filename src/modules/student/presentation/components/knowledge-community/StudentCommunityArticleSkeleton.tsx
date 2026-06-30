"use client";

import {
  CommunityPageLayoutSkeleton,
  CommunitySidebarCardSkeleton,
} from "@/shared/presentation/components/community/CommunityPageLayoutSkeleton";
import { SkeletonCard } from "@/shared/presentation/components/dashboard/DashboardSkeletonParts";
import { Skeleton } from "@/shared/presentation/components/ui/skeleton";
import { SkeletonScreen } from "@/shared/presentation/components/ui/skeleton-screen";

export function StudentCommunityArticleSkeleton({ label }: { label?: string }) {
  return (
    <SkeletonScreen label={label}>
      <CommunityPageLayoutSkeleton
        sidebar={
          <>
            <SkeletonCard className="rounded-[1.5rem] p-5 text-center">
              <Skeleton className="mx-auto h-20 w-20 rounded-full" />
              <Skeleton className="mx-auto mt-4 h-6 w-40 rounded-lg" />
              <Skeleton className="mx-auto mt-2 h-4 w-56 rounded-lg" />
              <Skeleton className="mx-auto mt-4 h-11 w-full rounded-xl" />
            </SkeletonCard>
            <CommunitySidebarCardSkeleton lines={4} />
            <CommunitySidebarCardSkeleton lines={2} />
          </>
        }
        main={
          <>
            <Skeleton className="ms-auto h-4 w-72 max-w-full rounded-lg" />
            <SkeletonCard className="rounded-[1.5rem]">
              <div className="space-y-4">
                <Skeleton className="h-9 w-4/5 rounded-xl" />
                <div className="flex flex-wrap items-center gap-3">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <Skeleton className="h-4 w-32 rounded-lg" />
                  <Skeleton className="h-4 w-24 rounded-lg" />
                </div>
                <Skeleton className="h-56 w-full rounded-2xl" />
                <Skeleton className="h-4 w-full rounded-lg" />
                <Skeleton className="h-4 w-full rounded-lg" />
                <Skeleton className="h-4 w-5/6 rounded-lg" />
              </div>
            </SkeletonCard>
          </>
        }
      />
    </SkeletonScreen>
  );
}
