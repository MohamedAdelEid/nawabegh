"use client";

import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import { Skeleton } from "@/shared/presentation/components/ui/skeleton";
import { cn } from "@/shared/application/lib/cn";

interface OnboardingQuizQuestionCardSkeletonProps {
  className?: string;
}

export function OnboardingQuizQuestionCardSkeleton({
  className,
}: OnboardingQuizQuestionCardSkeletonProps) {
  return (
    <Card
      className={cn(
        "overflow-hidden rounded-2xl border border-slate-100 bg-white",
        "!shadow-[var(--dashboard-shadow-soft)]",
        className,
      )}
      aria-hidden
    >
      <CardContent className="space-y-5 p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-9 rounded-full" />
            <Skeleton className="h-7 w-28 rounded-full" />
          </div>
          <Skeleton className="h-10 w-24 rounded-xl" />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-6 w-11/12" />
          <Skeleton className="h-6 w-2/3" />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-14 w-full rounded-2xl" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
