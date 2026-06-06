"use client";

import { Skeleton } from "@/shared/presentation/components/ui/skeleton";

export function HelperFileManagementDashboardSkeleton() {
  return (
    <div className="space-y-8" aria-hidden>
      <section
        className="rounded-[1.75rem] border border-white/80 bg-white p-5"
        style={{ boxShadow: "0px 8px 0px 0px #0000000D" }}
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={`helper-file-filter-${index}`} className="h-14 w-full rounded-2xl" />
          ))}
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
            <Skeleton key={`helper-file-row-${index}`} className="h-14 w-full rounded-xl" />
          ))}
        </div>
        <div className="flex items-center justify-between border-t border-slate-100 p-6">
          <Skeleton className="h-4 w-52" />
          <Skeleton className="h-10 w-48 rounded-xl" />
        </div>
      </section>
    </div>
  );
}
