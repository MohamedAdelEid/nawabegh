"use client";

import { Skeleton } from "@/shared/presentation/components/ui/skeleton";

export function CurriculumManagementDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={`tab-${index}`} className="h-10 w-36 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-20 w-full rounded-2xl" />
      <Skeleton className="h-96 w-full rounded-[1.75rem]" />
    </div>
  );
}
