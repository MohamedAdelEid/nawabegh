"use client";

import { useTranslations } from "next-intl";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import {
  DashboardNotImplementedState,
  DashboardPageHeader,
} from "@/shared/presentation/components/dashboard";

export function AdminSettingsPage() {
  const t = useTranslations("admin.dashboard");

  return (
    <div className="space-y-8">
      <DashboardPageHeader
        title={t("settingsPage.title")}
        description={t("settingsPage.description")}
        breadcrumbs={[
          { label: t("tabs.home.title"), href: ROUTES.ADMIN.HOME },
          { label: t("settingsPage.title") },
        ]}
      />

      <DashboardNotImplementedState
        badge={t("notImplemented.badge")}
        title={t("notImplemented.title")}
        description={t("notImplemented.description")}
      />
    </div>
  );
}
