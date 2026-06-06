"use client";

import { Skeleton } from "@/shared/presentation/components/ui/skeleton";

export function ResultsAnalyticsDashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-36 rounded-[1.75rem]" />
        ))}
      </div>

      <Skeleton className="h-24 rounded-[1.75rem]" />

      <div className="rounded-[2rem] border border-white/80 bg-white p-6 shadow-[var(--dashboard-shadow-soft)]">
        <Skeleton className="mb-6 h-10 w-full rounded-2xl" />
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="mb-3 h-14 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
