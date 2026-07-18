import { Skeleton } from "@/shared/presentation/components/ui/skeleton";

export function SchoolHonorBoardSkeleton({ tableOnly = false }: { tableOnly?: boolean }) {
  return (
    <div className="space-y-6" aria-hidden>
      {!tableOnly ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-28 rounded-[1.5rem]" />
            ))}
          </div>
          <Skeleton className="h-[25rem] rounded-[1.75rem]" />
        </>
      ) : null}
      <Skeleton className="h-[24rem] rounded-[1.75rem]" />
      {!tableOnly ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-28 rounded-[1.5rem]" />
          <Skeleton className="h-28 rounded-[1.5rem]" />
        </div>
      ) : null}
    </div>
  );
}
