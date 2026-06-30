import { Skeleton } from "@/shared/presentation/components/ui/skeleton";

export function SchoolDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-32 rounded-[1.75rem]" />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Skeleton className="h-[34rem] rounded-[1.75rem]" />
        <div className="space-y-6">
          <Skeleton className="h-64 rounded-[1.75rem]" />
          <Skeleton className="h-56 rounded-[1.75rem]" />
        </div>
      </div>
    </div>
  );
}
