"use client";

import { cn } from "@/shared/application/lib/cn";

type ShortQuizSkeletonProps = {
  variant?: "intro" | "instructions" | "attempt" | "results" | "review";
};

export function ShortQuizSkeleton({ variant = "intro" }: ShortQuizSkeletonProps) {
  return (
    <div className="min-h-full animate-pulse bg-[#f6f7f7] p-6">
      <div className="mx-auto max-w-[900px] space-y-6">
        <div className="h-16 rounded-xl bg-white" />
        {variant === "intro" || variant === "instructions" ? (
          <>
            <div className="h-48 rounded-2xl bg-[#dbe3ee]" />
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-36 rounded-2xl bg-white" />
              ))}
            </div>
            <div className="h-64 rounded-2xl bg-white" />
          </>
        ) : null}
        {variant === "attempt" ? (
          <>
            <div className="h-32 rounded-xl bg-white" />
            <div className="h-72 rounded-xl bg-white" />
            <div className="h-40 rounded-xl bg-white" />
          </>
        ) : null}
        {variant === "results" || variant === "review" ? (
          <>
            <div className={cn("mx-auto h-40 w-40 rounded-full bg-white")} />
            <div className="h-48 rounded-2xl bg-white" />
            <div className="h-24 rounded-xl bg-white" />
          </>
        ) : null}
      </div>
    </div>
  );
}
