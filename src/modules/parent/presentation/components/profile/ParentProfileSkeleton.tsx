import { Skeleton } from "@/shared/presentation/components/ui/skeleton";

export function ParentProfileSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true">
      <div className="space-y-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-10 w-56" />
      </div>

      <Skeleton className="h-64 w-full rounded-[2rem]" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-32 rounded-[1.75rem]" />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-6">
          <Skeleton className="h-64 rounded-[2rem]" />
          <Skeleton className="h-56 rounded-[2rem]" />
        </div>
        <Skeleton className="h-[34rem] rounded-[2rem]" />
      </div>
    </div>
  );
}
