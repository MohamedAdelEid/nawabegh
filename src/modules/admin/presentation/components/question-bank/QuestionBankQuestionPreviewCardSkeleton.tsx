"use client";

import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import { Skeleton } from "@/shared/presentation/components/ui/skeleton";
import { cn } from "@/shared/application/lib/cn";

interface QuestionBankQuestionPreviewCardSkeletonProps {
  className?: string;
}

/**
 * Loading placeholder that mirrors the layout of QuestionBankQuestionPreviewCard
 * to prevent layout shift while individual question details are being fetched.
 */
export function QuestionBankQuestionPreviewCardSkeleton({
  className,
}: QuestionBankQuestionPreviewCardSkeletonProps) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden rounded-2xl border border-slate-100 bg-white",
        "!shadow-[var(--dashboard-shadow-soft)]",
        className,
      )}
      aria-hidden
    >
      <span className="absolute inset-y-0 right-0 w-1.5 bg-slate-200" />
      <CardContent className="space-y-4 p-6 text-right">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-1.5 w-1.5 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          <Skeleton className="h-6 w-32 rounded-full" />
        </div>

        <div className="my-8 space-y-3">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-6 w-2/3" />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex-1 flex items-center gap-3 rounded-2xl border-2 border-[#E2E8F080] bg-[#F1F5F966] p-[20px]">
            <div className="flex-1 space-y-2 text-right">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-5 w-40" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-12 w-32 rounded-2xl" />
            <Skeleton className="h-9 w-9 rounded-xl" />
            <Skeleton className="h-9 w-9 rounded-xl" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
