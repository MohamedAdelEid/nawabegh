import { Skeleton } from "@/shared/presentation/components/ui/skeleton";

export function SchoolAnnouncementDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-24 w-full rounded-[1.75rem]" />
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-28 rounded-[1.75rem]" />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <Skeleton className="h-96 rounded-[1.75rem]" />
        <div className="space-y-6">
          <Skeleton className="h-64 rounded-[1.75rem]" />
          <Skeleton className="h-48 rounded-[1.75rem]" />
        </div>
      </div>
    </div>
  );
}
