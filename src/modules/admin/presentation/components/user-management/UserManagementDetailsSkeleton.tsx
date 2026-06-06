"use client";

import { Skeleton } from "@/shared/presentation/components/ui/skeleton";

export function UserManagementDetailsSkeleton() {
  return (
    <div className="space-y-6" aria-hidden>
      <section className="grid gap-6 xl:grid-cols-[22rem_minmax(0,1fr)]">
        <div
          className="rounded-[2rem] border border-white/80 bg-white p-6"
          style={{ boxShadow: "0px 8px 0px 0px #0000000D" }}
        >
          <div className="space-y-5">
            <Skeleton className="mx-auto h-24 w-24 rounded-full" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3 md:gap-8">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={`detail-stat-${index}`}
                className="rounded-[1.75rem] border border-white/80 bg-white p-5"
                style={{ boxShadow: "0px 8px 0px 0px #0000000D" }}
              >
                <Skeleton className="h-4 w-20" />
                <Skeleton className="mt-3 h-8 w-24" />
              </div>
            ))}
          </div>
          <div
            className="rounded-[2rem] border border-white/80 bg-white p-6"
            style={{ boxShadow: "0px 8px 0px 0px #0000000D" }}
          >
            <Skeleton className="h-6 w-44" />
            <Skeleton className="mt-6 h-56 w-full rounded-xl" />
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            key={`extra-card-${index}`}
            className="rounded-[2rem] border border-white/80 bg-white p-6"
            style={{ boxShadow: "0px 8px 0px 0px #0000000D" }}
          >
            <Skeleton className="h-6 w-40" />
            <div className="mt-5 space-y-3">
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          </div>
        ))}
      </section>

      <section
        className="rounded-[2rem] border border-white/80 bg-white p-6"
        style={{ boxShadow: "0px 8px 0px 0px #0000000D" }}
      >
        <Skeleton className="h-6 w-44" />
        <div className="mt-5 space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={`subscription-${index}`} className="h-12 w-full rounded-xl" />
          ))}
        </div>
      </section>
    </div>
  );
}
