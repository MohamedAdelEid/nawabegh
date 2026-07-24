"use client";

import { Skeleton } from "@/shared/presentation/components/ui/skeleton";
import { OnboardingQuizQuestionCardSkeleton } from "./OnboardingQuizQuestionCardSkeleton";

export function OnboardingQuizPreviewPageSkeleton() {
  return (
    <div className="space-y-6" aria-hidden>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-3">
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-9 w-80" />
          <Skeleton className="h-5 w-96 max-w-full" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-12 w-24 rounded-2xl" />
          <Skeleton className="h-12 w-40 rounded-2xl" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-14 w-full rounded-2xl" />
        <Skeleton className="h-14 w-full rounded-2xl" />
        <Skeleton className="h-14 w-full rounded-2xl" />
      </div>

      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <OnboardingQuizQuestionCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}
