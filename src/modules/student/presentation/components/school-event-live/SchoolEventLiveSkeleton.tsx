"use client";

import { Skeleton } from "@/shared/presentation/components/ui/skeleton";

export function SchoolEventLivePageSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-10 w-64 max-w-full" />
        <Skeleton className="h-6 w-full max-w-xl" />
      </div>
      <Skeleton className="h-[300px] w-full rounded-2xl" />
      <div className="flex gap-8 border-b-2 border-[#e2e8f0] pb-2">
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-8 w-28" />
      </div>
      <div className="grid gap-8 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-72 w-full rounded-2xl" />
        </div>
        <div className="space-y-6 lg:col-span-4">
          <Skeleton className="h-56 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-28 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
