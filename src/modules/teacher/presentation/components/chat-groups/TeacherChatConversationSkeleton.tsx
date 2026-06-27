"use client";

import { Skeleton } from "@/shared/presentation/components/ui/skeleton";
import { SkeletonScreen } from "@/shared/presentation/components/ui/skeleton-screen";

export function TeacherChatConversationSkeleton({ label }: { label?: string }) {
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
          <Skeleton className="h-10 w-10 rounded-xl" />
        </div>

        <div className="flex flex-1 flex-col gap-4 overflow-hidden p-5">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={`message-${index}`}
              className={`flex ${index % 2 === 0 ? "justify-end" : "justify-start"}`}
            >
              <Skeleton
                className={`h-14 rounded-2xl ${
                  index % 2 === 0 ? "w-2/5" : "w-1/3"
                }`}
              />
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
