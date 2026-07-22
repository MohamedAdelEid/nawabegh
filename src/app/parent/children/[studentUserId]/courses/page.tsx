import { Suspense } from "react";
import { ParentChildCoursesPage } from "@/modules/parent/presentation/pages/ParentChildCoursesPage";
import { Skeleton } from "@/shared/presentation/components/ui/skeleton";

export default function ParentChildCoursesRoutePage() {
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full rounded-2xl" />}>
      <ParentChildCoursesPage />
    </Suspense>
  );
}
