import { Suspense } from "react";
import { AdminDashboardPage } from "@/modules/admin/presentation/pages/AdminDashboardPage";
import { Skeleton } from "@/shared/presentation/components/ui/skeleton";

function DashboardFallback() {
  return (
    <div className="space-y-3 rounded-xl border border-border bg-card p-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-full max-w-lg" />
    </div>
  );
}

export default function AdminDashboardRoutePage() {
  return (
    <Suspense fallback={<DashboardFallback />}>
      <AdminDashboardPage />
    </Suspense>
  );
}
