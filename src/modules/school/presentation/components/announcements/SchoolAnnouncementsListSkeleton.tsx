import { Skeleton } from "@/shared/presentation/components/ui/skeleton";

export function SchoolAnnouncementsListSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-32 rounded-[1.75rem]" />
        ))}
      </div>
      <Skeleton className="h-[28rem] w-full rounded-[1.75rem]" />
    </div>
  );
}
