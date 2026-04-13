import { Suspense } from "react";
import { StudentDashboardPage } from "@/modules/student/presentation/pages/StudentDashboardPage";
import { Skeleton } from "@/shared/presentation/components/ui/skeleton";

function DashboardFallback() {
  return (
    <div className="space-y-3 rounded-xl border border-border bg-card p-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-full max-w-lg" />
    </div>
  );
}

export default function StudentDashboardRoutePage() {
  return (
    <Suspense fallback={<DashboardFallback />}>
      <StudentDashboardPage />
    </Suspense>
  );
}
