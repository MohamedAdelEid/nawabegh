import { Skeleton } from "@/shared/presentation/components/ui/skeleton";

export function SchoolEventsOverviewSkeleton() {
  return (
    <div className="space-y-6" aria-hidden>
      <div className="space-y-3">
        <Skeleton className="h-9 w-72 max-w-full rounded-xl" />
        <Skeleton className="h-5 w-full max-w-xl rounded-lg" />
      </div>
      <div className="flex flex-wrap gap-3 border-b border-slate-200 pb-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-9 w-28 rounded-lg" />
        ))}
      </div>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-80 rounded-[1.5rem]" />
        ))}
      </div>
    </div>
  );
}

export function SchoolEventFormSkeleton() {
  return (
    <div className="space-y-6" aria-hidden>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-3">
          <Skeleton className="h-9 w-64 rounded-xl" />
          <Skeleton className="h-5 w-80 max-w-full rounded-lg" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-20 w-36 rounded-2xl" />
          <Skeleton className="h-20 w-36 rounded-2xl" />
        </div>
      </div>
      <Skeleton className="h-12 w-full max-w-md rounded-full" />
      {Array.from({ length: 3 }).map((_, index) => (
        <Skeleton key={index} className="h-64 rounded-[1.5rem]" />
      ))}
    </div>
  );
}

export function SchoolEventLiveSkeleton() {
  return (
    <div className="space-y-6" aria-hidden>
      <Skeleton className="h-44 w-full rounded-[1.75rem]" />
      <div className="flex gap-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-10 w-36 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-5">
          <Skeleton className="h-72 rounded-[1.5rem]" />
          <Skeleton className="h-80 rounded-[1.5rem]" />
        </div>
        <div className="space-y-5">
          <Skeleton className="h-56 rounded-[1.5rem]" />
          <Skeleton className="h-64 rounded-[1.5rem]" />
          <Skeleton className="h-36 rounded-[1.5rem]" />
        </div>
      </div>
    </div>
  );
}

export function SchoolTeamFormSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]" aria-hidden>
      <div className="space-y-5">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-56 rounded-[1.5rem]" />
        ))}
      </div>
      <div className="space-y-5">
        <Skeleton className="h-80 rounded-[1.5rem]" />
        <Skeleton className="h-48 rounded-[1.5rem]" />
      </div>
    </div>
  );
}

export function SchoolTeamRankingsSkeleton() {
  return (
    <div className="space-y-6" aria-hidden>
      <div className="space-y-3">
        <Skeleton className="h-5 w-48 rounded-lg" />
        <Skeleton className="h-9 w-72 rounded-xl" />
        <Skeleton className="h-5 w-80 max-w-full rounded-lg" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-28 rounded-[1.5rem]" />
        ))}
      </div>
      <Skeleton className="h-[28rem] rounded-[1.75rem]" />
    </div>
  );
}
