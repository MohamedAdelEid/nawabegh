"use client";

import { Skeleton } from "@/shared/presentation/components/ui/skeleton";

export function JourneyEditorStationPageSkeleton({
  showSidebar = false,
}: {
  showSidebar?: boolean;
}) {
  return (
    <div className="space-y-7" aria-hidden>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-56" />
          <Skeleton className="h-8 w-64 max-w-full" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-12 w-32 rounded-xl" />
          <Skeleton className="h-12 w-36 rounded-xl" />
        </div>
      </div>

      <div
        className={
          showSidebar
            ? "grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]"
            : "space-y-6"
        }
      >
        <div
          className="space-y-6 rounded-[1.75rem] border border-white/80 bg-white p-6"
          style={{ boxShadow: "0px 8px 0px 0px #0000000D" }}
        >
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-12 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-12 w-full rounded-2xl" />
            <Skeleton className="h-12 w-full rounded-2xl" />
          </div>
          <Skeleton className="h-24 w-full rounded-2xl" />
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton
              key={`journey-editor-station-field-${index}`}
              className="h-14 w-full rounded-2xl"
            />
          ))}
        </div>

        {showSidebar ? (
          <div
            className="space-y-4 rounded-[1.75rem] border border-white/80 bg-white p-5"
            style={{ boxShadow: "0px 8px 0px 0px #0000000D" }}
          >
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-11 w-full rounded-xl" />
          </div>
        ) : null}
      </div>
    </div>
  );
}
