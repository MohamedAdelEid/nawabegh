export function DailyTasksSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="h-9 w-64 rounded-lg bg-[#e2e8f0]" />
          <div className="h-5 w-80 max-w-full rounded bg-[#e2e8f0]" />
        </div>
        <div className="h-11 w-36 rounded-xl bg-[#e2e8f0]" />
      </div>

      <div className="h-[440px] rounded-[40px] bg-[#e2e8f0]" />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-[385px] rounded-2xl bg-[#e2e8f0]" />
        <div className="h-[385px] rounded-[32px] bg-[#e2e8f0]" />
      </div>
    </div>
  );
}
