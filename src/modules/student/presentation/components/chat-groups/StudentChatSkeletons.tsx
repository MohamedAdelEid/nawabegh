"use client";

import { Skeleton } from "@/shared/presentation/components/ui/skeleton";
import { SkeletonScreen } from "@/shared/presentation/components/ui/skeleton-screen";

export function StudentChatGroupsSkeleton({ label }: { label?: string }) {
  return (
    <SkeletonScreen label={label} className="space-y-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2 text-right lg:order-2">
          <Skeleton className="ms-auto h-9 w-56 rounded-lg" />
          <Skeleton className="ms-auto h-5 w-72 rounded-lg" />
        </div>
        <Skeleton className="h-12 w-full max-w-md rounded-xl lg:order-1" />
      </div>
      <div className="flex justify-end gap-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={`filter-${index}`} className="h-10 w-24 rounded-full" />
        ))}
      </div>
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={`group-${index}`} className="h-28 w-full rounded-xl" />
        ))}
      </div>
    </SkeletonScreen>
  );
}

export function StudentChatConversationSkeleton({ label }: { label?: string }) {
  return (
    <SkeletonScreen label={label}>
      <div className="flex h-[calc(100vh-8rem)] flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-[#F8F9FA]">
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4">
          <div className="flex items-center gap-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={`action-${index}`} className="h-10 w-10 rounded-xl" />
            ))}
          </div>
          <div className="flex items-center gap-3">
            <div className="space-y-2 text-right">
              <Skeleton className="ms-auto h-5 w-40 rounded-lg" />
              <Skeleton className="ms-auto h-3 w-28 rounded-lg" />
            </div>
            <Skeleton className="h-11 w-11 rounded-xl" />
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-4 overflow-hidden p-5">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={`message-${index}`}
              className={`flex ${index % 2 === 0 ? "justify-end" : "justify-start"}`}
            >
              <Skeleton className={`h-14 rounded-2xl ${index % 2 === 0 ? "w-2/5" : "w-1/3"}`} />
            </div>
          ))}
        </div>
        <div className="border-t border-slate-200 bg-white p-4">
          <Skeleton className="h-12 w-full rounded-2xl" />
        </div>
      </div>
    </SkeletonScreen>
  );
}

export function StudentChatMembersSkeleton({ label }: { label?: string }) {
  return (
    <SkeletonScreen className="space-y-6" label={label}>
      <Skeleton className="h-16 w-full rounded-2xl" />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <Skeleton className="h-72 w-full rounded-[2rem]" />
          <Skeleton className="h-80 w-full rounded-[2rem]" />
        </div>
        <div className="space-y-5">
          <Skeleton className="h-64 w-full rounded-[2rem]" />
          <Skeleton className="h-48 w-full rounded-[2rem]" />
        </div>
      </div>
    </SkeletonScreen>
  );
}
