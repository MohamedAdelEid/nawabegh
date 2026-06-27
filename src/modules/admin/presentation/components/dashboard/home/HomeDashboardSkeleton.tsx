import { Skeleton } from "@/shared/presentation/components/ui/skeleton";

export function HomeDashboardSkeleton() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-20 w-full max-w-md rounded-[1.5rem]" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-36 rounded-[1.75rem]" />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[22rem_minmax(0,1fr)]">
        <Skeleton className="h-72 rounded-[2rem]" />
        <Skeleton className="h-72 rounded-[2rem]" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <Skeleton className="h-80 rounded-[2rem]" />
        <Skeleton className="h-80 rounded-[2rem]" />
      </div>
    </div>
  );
}
