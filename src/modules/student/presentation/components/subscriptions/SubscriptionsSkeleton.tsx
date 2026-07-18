export function SubscriptionsSkeleton() {
  return (
    <div className="animate-pulse space-y-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3 text-end">
          <div className="ms-auto h-10 w-72 max-w-full rounded-lg bg-[#e2e8f0]" />
        </div>
        <div className="h-12 w-52 rounded-2xl bg-[#e2e8f0]" />
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <div className="grid gap-6 sm:grid-cols-3 lg:col-span-3">
          <div className="h-[198px] rounded-3xl bg-[#e2e8f0]" />
          <div className="h-[198px] rounded-3xl bg-[#e2e8f0]" />
          <div className="h-[198px] rounded-3xl bg-[#e2e8f0]" />
        </div>
        <div className="h-[198px] rounded-3xl bg-[#e2e8f0]" />
      </div>

      <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
        <div className="h-[520px] rounded-3xl bg-[#e2e8f0]" />
        <div className="h-[520px] rounded-3xl bg-[#e2e8f0]" />
        <div className="h-[520px] rounded-3xl bg-[#e2e8f0]" />
      </div>
    </div>
  );
}
