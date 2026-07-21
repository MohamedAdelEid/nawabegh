export function TeacherPublicProfilePageSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="h-4 w-56 animate-pulse rounded bg-white/70" />
        <div className="h-10 w-72 animate-pulse rounded bg-white/70" />
      </div>
      <div className="h-[280px] animate-pulse rounded-[24px] bg-white/80" />
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="h-[320px] animate-pulse rounded-[24px] bg-white/80" />
        <div className="h-[320px] animate-pulse rounded-[24px] bg-white/80" />
      </div>
      <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-[360px] animate-pulse rounded-[20px] bg-white/80" />
        ))}
      </div>
    </div>
  );
}
