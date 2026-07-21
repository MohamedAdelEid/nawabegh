"use client";

import { Skeleton } from "@/shared/presentation/components/ui/skeleton";

export function HelperResourceSkeleton() {
  return (
    <div className="min-h-screen bg-[#f6f7f7]">
      <div className="border-b border-[#e2e8f0] bg-white px-8 py-4">
        <Skeleton className="h-8 w-64" />
      </div>
      <div className="mx-auto max-w-[1280px] space-y-6 p-8">
        <div className="space-y-3">
          <Skeleton className="ms-auto h-9 w-56" />
          <Skeleton className="ms-auto h-5 w-full max-w-xl" />
        </div>
        <div className="flex justify-end gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-24 rounded-full" />
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[435px] rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
