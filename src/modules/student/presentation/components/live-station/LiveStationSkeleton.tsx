"use client";

export function LiveStationSkeleton() {
  return (
    <div className="flex h-dvh flex-col bg-[#f6f7f7]">
      <div className="h-16 animate-pulse border-b border-slate-200 bg-white" />
      <div className="flex flex-1 gap-4 p-4">
        <div className="hidden w-80 animate-pulse rounded-xl bg-white md:block" />
        <div className="flex-1 animate-pulse rounded-2xl bg-slate-200" />
      </div>
      <div className="h-10 animate-pulse bg-[#2c4260]/80" />
    </div>
  );
}
