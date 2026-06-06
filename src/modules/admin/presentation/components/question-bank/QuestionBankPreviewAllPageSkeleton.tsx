"use client";

import { Skeleton } from "@/shared/presentation/components/ui/skeleton";
import { QuestionBankQuestionPreviewCardSkeleton } from "./QuestionBankQuestionPreviewCardSkeleton";

const CARD_SKELETON_COUNT = 5;

export function QuestionBankPreviewAllPageSkeleton() {
  return (
    <div className="space-y-8" aria-hidden>
      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={`preview-all-stat-${index}`}
            className="rounded-[1.75rem] border border-white/80 bg-white p-6"
            style={{ boxShadow: "0px 8px 0px 0px #0000000D" }}
          >
            <div className="space-y-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-20" />
            </div>
          </div>
        ))}
        <div
          className="rounded-[1.75rem] border border-white/80 bg-white p-6"
          style={{ boxShadow: "0px 8px 0px 0px #0000000D" }}
        >
          <div className="space-y-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-full rounded-full" />
            <div className="flex justify-between gap-2">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
        </div>
      </section>

      <section
        className="rounded-[1.75rem] border border-white/80 bg-white p-5"
        style={{ boxShadow: "0px 8px 0px 0px #0000000D" }}
      >
        <Skeleton className="mb-6 h-4 w-40" />
        <div className="flex flex-wrap gap-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={`preview-all-filter-${index}`} className="h-14 min-w-[10rem] flex-1 rounded-2xl" />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        {Array.from({ length: CARD_SKELETON_COUNT }).map((_, index) => (
          <QuestionBankQuestionPreviewCardSkeleton key={`preview-all-card-${index}`} />
        ))}
      </section>
    </div>
  );
}
