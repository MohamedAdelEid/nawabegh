import { Skeleton } from "@/shared/presentation/components/ui/skeleton";

export function ParentProfileSkeleton() {
  return (
    <div className="space-y-8" aria-busy="true">
      <div className="space-y-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-9 w-56" />
      </div>

      <Skeleton className="h-[184px] w-full rounded-[20px]" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-[132px] rounded-[20px]" />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-52 rounded-[20px]" />
            <Skeleton className="h-52 rounded-[20px]" />
          </div>
          <Skeleton className="h-56 rounded-[20px]" />
        </div>
        <Skeleton className="h-[511px] rounded-[20px]" />
      </div>
    </div>
  );
}
