import { Suspense } from "react";
import { ParentResourceViewPage } from "@/modules/parent/presentation/pages/ParentResourceViewPage";
import { Skeleton } from "@/shared/presentation/components/ui/skeleton";

export default function ParentResourceViewRoutePage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-2xl" />}>
      <ParentResourceViewPage />
    </Suspense>
  );
}
