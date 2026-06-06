"use client";

import { Skeleton } from "@/shared/presentation/components/ui/skeleton";

export function JourneyEditorDashboardSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-hidden>
      {Array.from({ length: 1 }).map((_, index) => (
        <div
          key={`journey-editor-dashboard-card-${index}`}
          className="rounded-[1.75rem] border border-white/80 bg-white p-6"
          style={{ boxShadow: "0px 8px 0px 0px #0000000D" }}
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-12 w-12 rounded-2xl" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          <div className="mt-4 space-y-2">
            <Skeleton className="ms-auto h-6 w-40" />
            <Skeleton className="ms-auto h-4 w-full max-w-[16rem]" />
          </div>
          <div className="mt-4 flex items-center justify-between gap-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-14" />
          </div>
          <Skeleton className="mt-4 h-1.5 w-full rounded-full" />
          <Skeleton className="mt-4 h-11 w-full rounded-lg" />
        </div>
      ))}
    </div>
  );
}
