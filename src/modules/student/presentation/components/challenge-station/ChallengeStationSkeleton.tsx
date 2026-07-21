"use client";

import { cn } from "@/shared/application/lib/cn";

type ChallengeStationSkeletonProps = {
  variant?: "modes" | "hub" | "arena";
  className?: string;
};

export function ChallengeStationSkeleton({
  variant = "modes",
  className,
}: ChallengeStationSkeletonProps) {
  return (
    <div
      className={cn(
        "min-h-screen animate-pulse bg-[#f6f7f7] p-6",
        className,
      )}
    >
      {variant === "hub" ? (
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="h-64 rounded-3xl bg-[#dbe3f3]" />
          <div className="h-64 rounded-3xl bg-white" />
          <div className="h-40 rounded-3xl bg-white lg:col-span-2" />
        </div>
      ) : variant === "arena" ? (
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-8 pt-20">
          <div className="h-10 w-64 rounded-full bg-[#dbe3f3]" />
          <div className="flex w-full gap-8">
            <div className="h-72 flex-1 rounded-3xl bg-white" />
            <div className="h-72 flex-1 rounded-3xl bg-white" />
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="h-8 w-48 rounded-lg bg-[#dbe3f3]" />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="h-56 rounded-3xl bg-[#c7af6d]/40" />
            <div className="h-56 rounded-3xl bg-white" />
          </div>
          <div className="h-40 rounded-3xl bg-white" />
        </div>
      )}
    </div>
  );
}
