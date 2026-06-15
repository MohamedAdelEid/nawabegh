import { Suspense } from "react";
import { TeacherDashboardPage } from "@/modules/teacher/presentation/pages/TeacherDashboardPage";
import { Skeleton } from "@/shared/presentation/components/ui/skeleton";

function DashboardFallback() {
  return (
    <div className="space-y-3 rounded-xl border border-border bg-card p-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-full max-w-lg" />
    </div>
  );
}

export default function TeacherDashboardRoutePage() {
  return (
    <Suspense fallback={<DashboardFallback />}>
      <TeacherDashboardPage />
    </Suspense>
  );
}
