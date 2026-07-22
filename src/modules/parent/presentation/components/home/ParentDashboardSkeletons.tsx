"use client";

import { Skeleton } from "@/shared/presentation/components/ui/skeleton";

export function ParentHomeDashboardSkeleton() {
  return (
    <div className="flex w-full flex-col gap-8">
      <Skeleton className="h-40 w-full rounded-[32px]" />
      <div className="grid gap-6 lg:grid-cols-12">
        <Skeleton className="h-64 rounded-[20px] lg:col-span-4" />
        <Skeleton className="h-64 rounded-[20px] lg:col-span-4" />
        <Skeleton className="h-64 rounded-[20px] lg:col-span-4" />
      </div>
      <div className="grid gap-6 lg:grid-cols-12">
        <Skeleton className="h-72 rounded-[20px] lg:col-span-7" />
        <Skeleton className="h-72 rounded-[20px] lg:col-span-5" />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-80 rounded-[20px]" />
        <Skeleton className="h-80 rounded-[20px]" />
      </div>
    </div>
  );
}

export function ParentChildrenStatsSkeleton() {
  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-16 w-72" />
        <Skeleton className="h-12 w-56 rounded-xl" />
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        <Skeleton className="h-36 rounded-[20px]" />
        <Skeleton className="h-36 rounded-[20px]" />
        <Skeleton className="h-36 rounded-[20px]" />
      </div>
      <div className="grid gap-6 lg:grid-cols-12">
        <Skeleton className="h-[28rem] rounded-[20px] lg:col-span-8" />
        <Skeleton className="h-[28rem] rounded-[20px] lg:col-span-4" />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-48 rounded-[20px]" />
        <Skeleton className="h-48 rounded-[20px]" />
      </div>
    </div>
  );
}
