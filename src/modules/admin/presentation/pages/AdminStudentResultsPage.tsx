"use client";

import { useTranslations } from "next-intl";
import { StudentResultsDashboard } from "@/modules/admin/presentation/components/results-analytics";
import { DashboardPageHeader } from "@/shared/presentation/components/dashboard";
import { ROUTES } from "@/shared/infrastructure/config/routes";

export function AdminStudentResultsPage({ studentId }: { studentId: string }) {
  const t = useTranslations("admin.dashboard.resultsAnalytics");

  return (
    <div className="space-y-8">
      <DashboardPageHeader
        title={t("student.page.title")}
        description={t("student.page.description")}
        breadcrumbs={[
          { label: t("breadcrumbs.home"), href: ROUTES.ADMIN.HOME },
          { label: t("breadcrumbs.results"), href: ROUTES.ADMIN.RESULTS.LIST },
          { label: t("student.page.title") },
        ]}
      />
      <StudentResultsDashboard studentId={studentId} />
    </div>
  );
}
