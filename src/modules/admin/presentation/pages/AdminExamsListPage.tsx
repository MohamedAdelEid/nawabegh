"use client";

import { useTranslations } from "next-intl";
import { ExamsManagementDashboard } from "@/modules/admin/presentation/components/exams-management";
import { DashboardPageHeader } from "@/shared/presentation/components/dashboard";
import { ROUTES } from "@/shared/infrastructure/config/routes";

export function AdminExamsListPage() {
  const t = useTranslations("admin.dashboard.examsManagement");

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title={t("listPage.title")}
        description={t("listPage.description")}
        breadcrumbs={[
          { label: t("breadcrumbs.home"), href: ROUTES.ADMIN.HOME },
          { label: t("page.title"), href: ROUTES.ADMIN.EXAMS.LIST },
          { label: t("listPage.title") },
        ]}
      />
      <ExamsManagementDashboard showFilters showWidgets={false} pageSize={20} />
    </div>
  );
}
