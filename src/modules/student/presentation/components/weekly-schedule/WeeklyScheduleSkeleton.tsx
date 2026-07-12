export function WeeklyScheduleSkeleton() {
  return (
    <div className="animate-pulse space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div className="h-10 w-48 rounded-xl bg-[#e2e8f0]" />
        <div className="flex gap-2">
          <div className="size-10 rounded-xl bg-[#e2e8f0]" />
          <div className="size-10 rounded-xl bg-[#e2e8f0]" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="space-y-4">
            <div className="h-9 rounded-t-xl bg-[#e2e8f0]" />
            <div className="h-[183px] rounded-2xl bg-[#e2e8f0]" />
            <div className="h-[183px] rounded-2xl bg-[#e2e8f0]" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="h-[163px] rounded-3xl bg-[#e2e8f0] lg:col-span-1" />
        <div className="h-[163px] rounded-3xl bg-[#e2e8f0] lg:col-span-2" />
      </div>
    </div>
  );
}
