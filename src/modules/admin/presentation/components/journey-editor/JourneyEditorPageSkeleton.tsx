"use client";

import { Skeleton } from "@/shared/presentation/components/ui/skeleton";

function PathCardSkeleton() {
  return (
    <div
      className="rounded-[1.75rem] border border-white/80 bg-white p-5"
      style={{ boxShadow: "0px 8px 0px 0px #0000000D" }}
    >
      <div className="flex items-center justify-between gap-4">
        <Skeleton className="h-6 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-9 rounded-xl" />
          <Skeleton className="h-9 w-9 rounded-xl" />
        </div>
      </div>
      <div className="mt-4 space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton
            key={`journey-editor-path-station-${index}`}
            className="h-16 w-full rounded-2xl"
          />
        ))}
      </div>
      <Skeleton className="mt-4 h-11 w-full rounded-2xl" />
    </div>
  );
}

function SidebarSkeleton() {
  return (
    <div className="space-y-5">
      <div
        className="rounded-[1.75rem] border border-white/80 bg-white p-5"
        style={{ boxShadow: "0px 8px 0px 0px #0000000D" }}
      >
        <Skeleton className="h-5 w-40" />
        <Skeleton className="mt-1 h-3 w-56" />
        <div className="mt-5 space-y-4">
          <Skeleton className="h-12 w-full rounded-2xl" />
          <div className="grid grid-cols-2 gap-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton
                key={`journey-editor-station-type-${index}`}
                className="h-20 w-full rounded-2xl"
              />
            ))}
          </div>
          <Skeleton className="h-12 w-full rounded-2xl" />
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-12 w-full rounded-2xl" />
            <Skeleton className="h-12 w-full rounded-2xl" />
          </div>
          <Skeleton className="h-12 w-full rounded-2xl" />
          <Skeleton className="h-12 w-full rounded-2xl" />
          <Skeleton className="h-12 w-full rounded-2xl" />
        </div>
      </div>

      <div
        className="rounded-[1.75rem] border border-white/80 bg-[#2C4260] p-5"
        style={{ boxShadow: "0px 8px 0px 0px #0000000D" }}
      >
        <Skeleton className="h-5 w-36 bg-white/20" />
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Skeleton className="h-20 w-full rounded-2xl bg-white/10" />
          <Skeleton className="h-20 w-full rounded-2xl bg-white/10" />
        </div>
        <Skeleton className="mt-3 h-16 w-full rounded-2xl bg-white/10" />
      </div>
    </div>
  );
}

export function JourneyEditorPageSkeleton() {
  return (
    <div className="space-y-7" aria-hidden>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-8 w-72 max-w-full" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
        <Skeleton className="h-12 w-40 rounded-xl" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-5">
          <PathCardSkeleton />
          <PathCardSkeleton />
        </div>
        <SidebarSkeleton />
      </div>
    </div>
  );
}
