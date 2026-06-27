"use client";

import { SkeletonCard } from "@/shared/presentation/components/dashboard/DashboardSkeletonParts";
import { Skeleton } from "@/shared/presentation/components/ui/skeleton";

/** Mirrors `CommunityPageShell` grid without the live header/search. */
export function CommunityPageLayoutSkeleton({
  main,
  sidebar,
}: {
  main: React.ReactNode;
  sidebar: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2 text-right">
          <Skeleton className="ms-auto h-9 w-56 rounded-xl" />
          <Skeleton className="ms-auto h-4 w-72 max-w-full rounded-lg" />
        </div>
        <Skeleton className="h-12 w-full max-w-md rounded-full" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-6">{main}</div>
        <aside className="space-y-4">{sidebar}</aside>
      </div>
    </div>
  );
}

export function CommunitySidebarCardSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <SkeletonCard className="rounded-[1.5rem] p-5">
      <Skeleton className="mb-4 h-5 w-32 rounded-lg" />
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, index) => (
          <Skeleton key={`line-${index}`} className="h-4 w-full rounded-lg" />
        ))}
      </div>
    </SkeletonCard>
  );
}
