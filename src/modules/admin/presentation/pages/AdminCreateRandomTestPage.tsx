"use client";

import { useTranslations } from "next-intl";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import {DashboardPageHeader,
  DashboardBreadcrumb,} from "@/shared/presentation/components/dashboard";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import { Button } from "@/shared/presentation/components/ui/button";

export function AdminCreateRandomTestPage() {
  const t = useTranslations("admin.dashboard");
  return (
    <div className="space-y-6">
            <div className="space-y-2">
        <DashboardBreadcrumb items={[
          { label: t("tabs.home.title"), href: ROUTES.ADMIN.HOME },
          { label: t("overviewInsights.title"), href: ROUTES.ADMIN.OVERVIEW_INSIGHTS.LIST },
          { label: t("overviewInsights.randomTest.title") },
        ]} />
        <DashboardPageHeader
        title={t("overviewInsights.randomTest.title")}
        description={t("overviewInsights.randomTest.description")}
      />
      </div>
      <div className="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <Card><CardContent className="space-y-4 p-5"><Button className="w-full">{t("overviewInsights.randomTest.actions.generate")}</Button></CardContent></Card>
        <Card><CardContent className="space-y-4 p-6"><div className="h-72 rounded-xl bg-slate-50" /></CardContent></Card>
      </div>
    </div>
  );
}
