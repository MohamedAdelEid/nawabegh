"use client";

import { Skeleton } from "@/shared/presentation/components/ui/skeleton";

export function InteractiveBookManagePageSkeleton() {
  return (
    <div className="space-y-8" aria-hidden>
      <section
        className="rounded-3xl border border-[var(--dashboard-border-soft)] bg-white p-6"
        style={{ boxShadow: "var(--dashboard-shadow-soft)" }}
      >
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-6 rounded-md" />
            <Skeleton className="h-8 w-52" />
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={`manage-field-${index}`} className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
            ))}
            <div className="space-y-2 md:col-span-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <div
          className="overflow-hidden rounded-3xl border border-[var(--dashboard-border-soft)] bg-white"
          style={{ boxShadow: "var(--dashboard-shadow-soft)" }}
        >
          <div className="flex items-center justify-between border-b border-slate-100 p-4">
            <Skeleton className="h-10 w-64 rounded-xl" />
            <Skeleton className="h-11 w-48 rounded-xl" />
          </div>
          <div className="space-y-4 p-6">
            <Skeleton className="mx-auto h-6 w-56" />
            <Skeleton className="h-[24rem] w-full rounded-2xl" />
          </div>
        </div>

        <div className="space-y-6">
          <div
            className="rounded-3xl border border-[var(--dashboard-border-soft)] bg-white p-4"
            style={{ boxShadow: "var(--dashboard-shadow-soft)" }}
          >
            <div className="space-y-4">
              <Skeleton className="h-6 w-40" />
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={`hotspot-${index}`} className="h-24 w-full rounded-2xl" />
              ))}
              <Skeleton className="h-12 w-full rounded-2xl" />
            </div>
          </div>
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
      </section>
    </div>
  );
}
