"use client";

import { Skeleton } from "@/shared/presentation/components/ui/skeleton";

export function SchoolEventsPageSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-10 w-80 max-w-full" />
        <Skeleton className="h-6 w-full max-w-xl" />
      </div>
      <div className="flex gap-2 border-b-2 border-[#e2e8f0] pb-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-10 w-28" />
        ))}
      </div>
      <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="overflow-hidden rounded-[20px] bg-white shadow-sm">
            <Skeleton className="h-48 w-full rounded-none" />
            <div className="space-y-4 p-6">
              <Skeleton className="h-7 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
