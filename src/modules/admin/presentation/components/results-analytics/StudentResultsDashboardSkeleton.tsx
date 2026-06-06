"use client";

import { Skeleton } from "@/shared/presentation/components/ui/skeleton";

export function StudentResultsDashboardSkeleton() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-16 w-full rounded-2xl" />
      <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
        <Skeleton className="h-40 w-full max-w-xl rounded-[2rem]" />
        <div className="flex gap-3">
          <Skeleton className="h-12 w-32 rounded-2xl" />
          <Skeleton className="h-12 w-32 rounded-2xl" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-32 rounded-[1.75rem]" />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[18rem_minmax(0,1fr)]">
        <div className="space-y-4">
          <Skeleton className="h-56 rounded-[2rem]" />
          <Skeleton className="h-56 rounded-[2rem]" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-80 rounded-[2rem]" />
          <Skeleton className="h-48 rounded-[2rem]" />
        </div>
      </div>
      <Skeleton className="h-96 rounded-[2rem]" />
    </div>
  );
}
