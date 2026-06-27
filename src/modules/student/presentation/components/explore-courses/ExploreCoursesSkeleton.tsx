"use client";

import { Skeleton } from "@/shared/presentation/components/ui/skeleton";

export function ExploreCoursesPageSkeleton() {
  return (
    <div className="space-y-10">
      <div className="space-y-3">
        <Skeleton className="ms-auto h-4 w-48" />
        <Skeleton className="ms-auto h-9 w-80 max-w-full" />
        <Skeleton className="ms-auto h-5 w-96 max-w-full" />
      </div>
      <div className="rounded-xl border border-[#e2e8f0] bg-white p-6">
        <Skeleton className="mb-6 h-16 w-full" />
        <div className="flex flex-col gap-4 lg:flex-row">
          <Skeleton className="h-[53px] w-full lg:max-w-[248px]" />
          <Skeleton className="h-[53px] flex-1" />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Skeleton className="h-[38px] w-[38px] rounded-lg" />
          <Skeleton className="h-[38px] w-[38px] rounded-lg" />
        </div>
        <Skeleton className="h-9 w-56" />
      </div>
      <ExploreCoursesGridSkeleton />
    </div>
  );
}

export function ExploreCoursesGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
      <div dir="ltr" className="flex min-h-[453px] overflow-hidden rounded-[20px] md:col-span-2">
        <div className="flex flex-1 flex-col justify-between p-8">
          <div className="space-y-3">
            <Skeleton className="ms-auto h-5 w-40" />
            <Skeleton className="ms-auto h-9 w-full max-w-sm" />
            <Skeleton className="ms-auto h-4 w-28" />
            <Skeleton className="ms-auto h-10 w-full max-w-xs" />
          </div>
          <div className="flex items-end justify-between gap-4">
            <Skeleton className="h-12 w-[154px] rounded-xl" />
            <Skeleton className="h-9 w-[114px] rounded-full" />
          </div>
        </div>
        <Skeleton className="hidden h-[453px] w-[321px] shrink-0 md:block" />
      </div>
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-[20px] border border-[#e2e8f0] bg-white"
        >
          <Skeleton className="h-48 w-full rounded-none" />
          <div className="space-y-3 p-6">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-7 w-full" />
            <Skeleton className="h-4 w-32 ms-auto" />
            <Skeleton className="h-11 w-full rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}
