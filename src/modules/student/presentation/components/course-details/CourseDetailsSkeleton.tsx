"use client";

import { Skeleton } from "@/shared/presentation/components/ui/skeleton";

export function CourseDetailsPageSkeleton() {
  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <Skeleton className="ms-auto h-4 w-64" />
        <Skeleton className="ms-auto h-9 w-96 max-w-full" />
        <Skeleton className="ms-auto h-5 w-full max-w-2xl" />
      </div>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          <Skeleton className="h-64 w-full rounded-[20px]" />
          <div className="space-y-4">
            <Skeleton className="ms-auto h-7 w-72" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-xl" />
              ))}
            </div>
          </div>
          <Skeleton className="h-48 w-full rounded-xl" />
          <div className="space-y-3">
            <Skeleton className="ms-auto h-7 w-48" />
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-52 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
