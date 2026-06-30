import { Suspense } from "react";
import { SchoolDashboardPage } from "@/modules/school/presentation/pages/SchoolDashboardPage";
import { SchoolDashboardSkeleton } from "@/modules/school/presentation/components/dashboard/SchoolDashboardSkeleton";

export default function SchoolDashboardRoutePage() {
  return (
    <Suspense fallback={<SchoolDashboardSkeleton />}>
      <SchoolDashboardPage />
    </Suspense>
  );
}
