"use client";

import { SkeletonCard } from "@/shared/presentation/components/dashboard/DashboardSkeletonParts";
import { Skeleton } from "@/shared/presentation/components/ui/skeleton";
import { SkeletonScreen } from "@/shared/presentation/components/ui/skeleton-screen";

export function TeacherChatMembersSkeleton({ label }: { label?: string }) {
  return (
    <SkeletonScreen className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]" label={label}>
      <SkeletonCard className="rounded-[2rem]">
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex -space-x-2 rtl:space-x-reverse">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={`avatar-${index}`} className="h-9 w-9 rounded-full ring-2 ring-white" />
              ))}
            </div>
            <Skeleton className="h-6 w-40 rounded-lg" />
          </div>
          <Skeleton className="h-12 w-full rounded-xl" />
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={`member-${index}`} className="h-16 w-full rounded-2xl" />
            ))}
          </div>
        </div>
      </SkeletonCard>

      <div className="space-y-5">
        <SkeletonCard className="rounded-[2rem]">
          <div className="flex flex-col items-center space-y-4 text-center">
            <Skeleton className="h-20 w-20 rounded-full" />
            <Skeleton className="h-6 w-48 rounded-lg" />
            <Skeleton className="h-4 w-full rounded-lg" />
            <Skeleton className="h-4 w-3/4 rounded-lg" />
          </div>
        </SkeletonCard>
        <SkeletonCard className="rounded-[2rem]">
          <div className="space-y-4">
            <Skeleton className="ms-auto h-6 w-32 rounded-lg" />
            {Array.from({ length: 2 }).map((_, index) => (
              <Skeleton key={`setting-${index}`} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        </SkeletonCard>
      </div>
    </SkeletonScreen>
  );
}
