"use client";

import { Skeleton } from "@/shared/presentation/components/ui/skeleton";

const CHOICE_SKELETON_COUNT = 4;

export function QuestionBankPreviewPageSkeleton() {
  return (
    <div
      className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_28rem]"
      aria-hidden
    >
      <div
        className="rounded-2xl border border-slate-200 bg-white p-6"
        style={{ boxShadow: "0px 6px 0px 0px #0000000A" }}
      >
        <div className="space-y-6">
          <Skeleton className="h-6 w-36 rounded-full" />
          <div className="flex flex-col items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <Skeleton className="h-10 w-4/5 max-w-lg" />
            <Skeleton className="h-10 w-3/5 max-w-md" />
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            {Array.from({ length: CHOICE_SKELETON_COUNT }).map((_, index) => (
              <Skeleton
                key={`preview-choice-${index}`}
                className="h-24 w-36 rounded-2xl"
              />
            ))}
          </div>
          <div className="space-y-3 rounded-2xl border border-dashed border-slate-200 p-5">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div
          className="rounded-2xl border border-slate-200 bg-white p-4"
          style={{ boxShadow: "0px 6px 0px 0px #0000000A" }}
        >
          <Skeleton className="mb-4 h-6 w-40" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={`preview-meta-${index}`}
                className="flex items-center justify-end gap-3 rounded-xl border border-slate-100 p-3"
              >
                <div className="flex-1 space-y-2 text-right">
                  <Skeleton className="ms-auto h-3 w-20" />
                  <Skeleton className="ms-auto h-4 w-32" />
                </div>
                <Skeleton className="h-10 w-10 rounded-xl" />
              </div>
            ))}
          </div>
        </div>

        <div
          className="rounded-2xl border border-slate-200 bg-white p-4"
          style={{ boxShadow: "0px 6px 0px 0px #0000000A" }}
        >
          <Skeleton className="mb-4 h-6 w-44" />
          {Array.from({ length: 2 }).map((_, index) => (
            <div
              key={`preview-person-${index}`}
              className="mb-3 space-y-3 rounded-2xl bg-slate-50 p-4 last:mb-0"
            >
              <Skeleton className="ms-auto h-4 w-28" />
              <div className="flex items-center justify-end gap-3">
                <div className="flex-1 space-y-2">
                  <Skeleton className="ms-auto h-4 w-32" />
                  <Skeleton className="ms-auto h-3 w-24" />
                </div>
                <Skeleton className="h-12 w-12 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
