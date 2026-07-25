"use client";

import { Skeleton } from "@/shared/presentation/components/ui/skeleton";

export function SchoolEventsPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-10 w-80 max-w-full" />
        <Skeleton className="h-6 w-full max-w-xl" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-24 rounded-2xl" />
        ))}
      </div>
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-10 w-28" />
        ))}
      </div>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white"
          >
            <Skeleton className="aspect-[16/9] w-full rounded-none" />
            <div className="space-y-4 p-5">
              <Skeleton className="h-7 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-11 w-32" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
