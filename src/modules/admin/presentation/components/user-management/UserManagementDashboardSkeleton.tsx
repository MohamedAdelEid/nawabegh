"use client";

import { Skeleton } from "@/shared/presentation/components/ui/skeleton";

export function UserManagementDashboardSkeleton() {
  return (
    <div className="space-y-8" aria-hidden>
      <section className="grid gap-5 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={`stat-${index}`}
            className="rounded-[1.75rem] border border-white/80 bg-white p-6"
            style={{ boxShadow: "0px 8px 0px 0px #0000000D" }}
          >
            <div className="space-y-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        ))}
      </section>

      <section
        className="rounded-[1.75rem] border border-white/80 bg-white p-5"
        style={{ boxShadow: "0px 8px 0px 0px #0000000D" }}
      >
        <div className="grid gap-4 xl:grid-cols-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={`filter-${index}`} className="h-11 w-full rounded-xl" />
          ))}
          <Skeleton className="h-11 w-full rounded-xl xl:col-span-2" />
        </div>
      </section>

      <section
        className="overflow-hidden rounded-[2rem] border border-white/80 bg-white"
        style={{ boxShadow: "0px 8px 0px 0px #0000000D" }}
      >
        <div className="border-b border-slate-100 p-6">
          <Skeleton className="h-8 w-40" />
        </div>
        <div className="space-y-3 p-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={`row-${index}`} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      </section>
    </div>
  );
}
