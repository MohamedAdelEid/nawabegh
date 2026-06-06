"use client";

import { Skeleton } from "@/shared/presentation/components/ui/skeleton";

export function SupportTicketsDashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-10 w-80" />
        <Skeleton className="h-4 w-96" />
      </div>

      <section className="grid gap-5 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-32 rounded-[1.75rem]" />
        ))}
      </section>

      <Skeleton className="h-20 w-full rounded-[1.75rem]" />
      <Skeleton className="h-96 w-full rounded-[1.75rem]" />
    </div>
  );
}
