import { SkeletonScreen } from "@/shared/presentation/components/ui/skeleton-screen";
import { Skeleton } from "@/shared/presentation/components/ui/skeleton";

interface SchoolHomeSkeletonProps {
  label: string;
}

export function SchoolHomeSkeleton({ label }: SchoolHomeSkeletonProps) {
  return (
    <SkeletonScreen label={label} className="space-y-7">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-40 rounded-[1.75rem]" />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Skeleton className="h-80 rounded-[2rem]" />
        <Skeleton className="h-80 rounded-[2rem]" />
      </div>
      <Skeleton className="h-[32rem] rounded-[2rem]" />
    </SkeletonScreen>
  );
}
