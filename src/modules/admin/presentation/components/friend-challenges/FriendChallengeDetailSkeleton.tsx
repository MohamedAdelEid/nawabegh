import { Skeleton } from "@/shared/presentation/components/ui/skeleton";

export function FriendChallengeDetailSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-5 w-80 max-w-full" />
      </div>

      <Skeleton className="h-32 rounded-[2rem]" />

      <div className="grid gap-6 lg:grid-cols-[1fr_auto_1fr]">
        <Skeleton className="h-72 rounded-[2rem]" />
        <Skeleton className="mx-auto h-16 w-16 rounded-full" />
        <Skeleton className="h-72 rounded-[2rem]" />
      </div>

      <Skeleton className="h-96 rounded-[2rem]" />
    </div>
  );
}
