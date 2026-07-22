"use client";

export function ParentCheckoutPageSkeleton() {
  return (
    <div className="animate-pulse space-y-8">
      <div className="space-y-2">
        <div className="h-4 w-48 rounded bg-[#e2e8f0]" />
        <div className="h-8 w-72 rounded bg-[#e2e8f0]" />
        <div className="h-4 w-96 max-w-full rounded bg-[#f1f5f9]" />
      </div>

      <div className="flex justify-center gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="size-10 rounded-full bg-[#e2e8f0]" />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4 rounded-[20px] border border-[#e2e8f0] bg-white p-8">
          <div className="h-6 w-40 rounded bg-[#e2e8f0]" />
          <div className="grid grid-cols-2 gap-3">
            <div className="h-12 rounded-xl bg-[#f1f5f9]" />
            <div className="h-12 rounded-xl bg-[#f1f5f9]" />
          </div>
          <div className="h-32 rounded-xl bg-[#f8fafc]" />
          <div className="h-14 rounded-xl bg-[#e2e8f0]" />
        </div>
        <div className="rounded-[20px] border border-[#e2e8f0] bg-white p-6">
          <div className="mb-5 h-6 w-32 rounded bg-[#e2e8f0]" />
          <div className="mb-5 h-24 rounded-xl bg-[#f8fafc]" />
          <div className="space-y-3">
            <div className="h-4 rounded bg-[#f1f5f9]" />
            <div className="h-4 rounded bg-[#f1f5f9]" />
            <div className="h-6 rounded bg-[#e2e8f0]" />
          </div>
        </div>
      </div>
    </div>
  );
}
