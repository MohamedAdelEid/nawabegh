export function TeachersDiscoveryPageSkeleton() {
  return (
    <div className="space-y-10">
      <div className="space-y-3">
        <div className="h-4 w-40 animate-pulse rounded bg-slate-200/80" />
        <div className="h-10 w-80 max-w-full animate-pulse rounded bg-slate-200/80" />
        <div className="h-6 w-[32rem] max-w-full animate-pulse rounded bg-slate-200/60" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,220px)_minmax(0,1fr)]">
        <div className="h-14 animate-pulse rounded-2xl bg-white/80" />
        <div className="h-14 animate-pulse rounded-2xl bg-white/80" />
      </div>

      <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="h-[360px] animate-pulse rounded-[20px] bg-white/80" />
        ))}
      </div>
    </div>
  );
}
