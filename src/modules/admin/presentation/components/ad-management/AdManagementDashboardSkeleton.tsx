"use client";

import { Skeleton } from "@/shared/presentation/components/ui/skeleton";

export function AdManagementDashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64 rounded-xl" />
          <Skeleton className="h-5 w-96 max-w-full rounded-lg" />
        </div>
        <Skeleton className="h-14 w-48 rounded-2xl" />
      </div>
      <div className="grid gap-5 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-36 rounded-[1.75rem]" />
        ))}
      </div>
      <Skeleton className="h-20 w-full rounded-2xl" />
      <Skeleton className="h-96 w-full rounded-[1.75rem]" />
    </div>
  );
}
