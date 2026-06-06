"use client";

import { Skeleton } from "@/shared/presentation/components/ui/skeleton";

export function SendNotificationPageSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_min(100%,22rem)]" aria-hidden>
      <div
        className="space-y-6 rounded-[1.75rem] border border-white/80 bg-white p-6"
        style={{ boxShadow: "0px 8px 0px 0px #0000000D" }}
      >
        <Skeleton className="ms-auto h-8 w-56" />
        <Skeleton className="h-14 w-full rounded-2xl" />
        <div className="space-y-4 rounded-2xl border border-dashed border-slate-200 p-4">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-14 w-full rounded-2xl" />
          <Skeleton className="h-14 w-full rounded-2xl" />
          <Skeleton className="h-14 w-full rounded-2xl" />
        </div>
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-14 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-14 w-full rounded-2xl" />
          <Skeleton className="h-14 w-full rounded-2xl" />
        </div>
        <Skeleton className="h-12 w-64 rounded-2xl" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-28 w-full rounded-2xl" />
        </div>
        <Skeleton className="h-14 w-full rounded-2xl" />
      </div>

      <div className="flex flex-col items-center gap-4">
        <Skeleton className="h-5 w-44" />
        <Skeleton className="aspect-[320/640] w-full max-w-[18rem] rounded-[3rem]" />
        <div className="flex w-full max-w-[18rem] justify-between gap-4">
          <Skeleton className="h-10 flex-1 rounded-xl" />
          <Skeleton className="h-10 flex-1 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
