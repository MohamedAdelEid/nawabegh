import { Suspense } from "react";
import { ParentCoursesCatalogPage } from "@/modules/parent/presentation/pages/ParentCoursesCatalogPage";
import { Skeleton } from "@/shared/presentation/components/ui/skeleton";

export default function ParentCoursesCatalogRoutePage() {
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full rounded-2xl" />}>
      <ParentCoursesCatalogPage />
    </Suspense>
  );
}
