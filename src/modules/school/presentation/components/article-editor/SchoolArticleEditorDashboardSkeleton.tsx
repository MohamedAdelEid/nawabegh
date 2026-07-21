"use client";

import { Skeleton } from "@/shared/presentation/components/ui/skeleton";

export function SchoolArticleEditorDashboardSkeleton() {
  return (
    <div className="space-y-8" aria-hidden>
      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={`school-article-stat-${index}`}
            className="rounded-[1.75rem] border border-white/80 bg-white p-6"
            style={{ boxShadow: "0px 8px 0px 0px #0000000D" }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-24" />
              </div>
              <Skeleton className="h-14 w-14 rounded-2xl" />
            </div>
          </div>
        ))}
      </section>

      <section
        className="rounded-[1.75rem] border border-white/80 bg-white p-5"
        style={{ boxShadow: "0px 8px 0px 0px #0000000D" }}
      >
        <div className="grid gap-4 xl:grid-cols-3">
          <Skeleton className="h-11 w-full rounded-xl" />
          <Skeleton className="h-11 w-full rounded-xl" />
          <Skeleton className="h-11 w-full rounded-xl" />
        </div>
      </section>

      <section
        className="overflow-hidden rounded-[2rem] border border-white/80 bg-white"
        style={{ boxShadow: "0px 8px 0px 0px #0000000D" }}
      >
        <div className="border-b border-slate-100 p-6">
          <Skeleton className="h-8 w-56" />
        </div>
        <div className="space-y-3 p-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={`school-article-row-${index}`} className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
              <Skeleton className="h-14 w-full rounded-xl" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
