import { Skeleton } from "@/shared/presentation/components/ui/skeleton";

export function HomeDashboardSkeleton() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-20 w-full max-w-md rounded-[1.5rem]" />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-36 rounded-[1.75rem]" />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-48 rounded-[2rem] sm:h-56 md:h-72" />
        <Skeleton className="h-48 rounded-[2rem] sm:h-56 md:h-72" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Skeleton className="h-48 rounded-[2rem] sm:h-56" />
          <Skeleton className="h-48 rounded-[2rem] sm:h-56" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-48 rounded-[2rem] sm:h-56" />
          <Skeleton className="h-48 rounded-[2rem] sm:h-56" />
        </div>
      </div>
    </div>
  );
}
