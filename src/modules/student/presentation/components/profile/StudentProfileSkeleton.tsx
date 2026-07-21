export function StudentProfileSkeleton() {
  return (
    <div className="animate-pulse space-y-12 pb-10">
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          <div className="h-36 rounded-3xl bg-[#e2e8f0]" />
          <div className="h-36 rounded-3xl bg-[#e2e8f0]" />
        </div>
        <div className="h-[307px] rounded-3xl bg-[#e2e8f0] lg:col-span-2" />
      </div>
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-48 rounded-3xl bg-[#e2e8f0]" />
        ))}
      </div>
      <div className="grid gap-10 lg:grid-cols-3">
        <div className="h-56 rounded-3xl bg-[#e2e8f0]" />
        <div className="h-56 rounded-3xl bg-[#e2e8f0] lg:col-span-2" />
      </div>
      <div className="grid gap-8 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-80 rounded-xl bg-[#e2e8f0]" />
        ))}
      </div>
      <div className="h-[420px] rounded-[32px] bg-[#e2e8f0]" />
    </div>
  );
}
