"use client";

import { Skeleton } from "@/shared/presentation/components/ui/skeleton";

export function QuestionBankAddPageSkeleton() {
  return (
    <div
      className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_25rem]"
      aria-hidden
    >
      <div
        className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5"
        style={{ boxShadow: "0px 6px 0px 0px #0000000A" }}
      >
        <div className="space-y-3">
          <Skeleton className="h-4 w-28" />
          <div className="flex flex-wrap gap-3">
            <Skeleton className="h-12 w-40 rounded-lg" />
            <Skeleton className="h-12 w-44 rounded-lg" />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-4 w-20" />
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={`add-choice-${index}`} className="h-14 w-full rounded-2xl" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={`add-field-${index}`} className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <div
          className="rounded-2xl border border-slate-200 bg-white p-5"
          style={{ boxShadow: "0px 6px 0px 0px #0000000A" }}
        >
          <Skeleton className="mb-4 h-5 w-36" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
        <div
          className="rounded-2xl border border-slate-200 bg-white p-5"
          style={{ boxShadow: "0px 6px 0px 0px #0000000A" }}
        >
          <Skeleton className="mb-4 h-5 w-40" />
          <div className="space-y-3">
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        </div>
        <div
          className="rounded-2xl border border-slate-200 bg-white p-5"
          style={{ boxShadow: "0px 6px 0px 0px #0000000A" }}
        >
          <Skeleton className="mb-4 h-5 w-44" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
