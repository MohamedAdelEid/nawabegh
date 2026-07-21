"use client";

export function FlashcardsStationSkeleton() {
  return (
    <div className="min-h-screen bg-[#f6f7f7]">
      <div className="border-b-2 border-[#e2e8f0] bg-white px-4 py-4">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4">
          <div className="h-4 flex-1 max-w-md animate-pulse rounded-full bg-[#e2e8f0]" />
          <div className="flex items-center gap-3">
            <div className="hidden h-10 w-40 animate-pulse rounded-lg bg-[#e2e8f0] sm:block" />
            <div className="size-14 animate-pulse rounded-full bg-[#e2e8f0]" />
          </div>
        </div>
      </div>
      <div className="mx-auto mt-16 max-w-[672px] px-4">
        <div className="h-[560px] animate-pulse rounded-[20px] bg-white shadow-[0px_8px_0px_0px_rgba(0,0,0,0.05)]" />
      </div>
    </div>
  );
}
