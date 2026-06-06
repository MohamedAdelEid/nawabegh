"use client";

import { Skeleton } from "@/shared/presentation/components/ui/skeleton";

export function CommunityBadgesDashboardSkeleton() {
  return (
    <div className="space-y-6 text-right">
      <div className="space-y-2">
        <Skeleton className="ms-auto h-8 w-64" />
        <Skeleton className="ms-auto h-4 w-96 max-w-full" />
      </div>
      <div className="flex flex-wrap items-center justify-end gap-3">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-36" />
      </div>
      <div className="overflow-hidden rounded-xl border border-[#EEF4FD]">
        <div className="space-y-0 divide-y divide-[#E8ECF2] bg-white p-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-center justify-end gap-4 px-4 py-4">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-11 w-11 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
