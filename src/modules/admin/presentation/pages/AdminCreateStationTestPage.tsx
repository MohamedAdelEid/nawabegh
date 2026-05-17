"use client";

import { useTranslations } from "next-intl";
import { DashboardPageHeader } from "@/shared/presentation/components/dashboard";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import { Button } from "@/shared/presentation/components/ui/button";

export function AdminCreateStationTestPage() {
  const t = useTranslations("admin.dashboard");
  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title={t("overviewInsights.stationTest.title")}
        description={t("overviewInsights.stationTest.description")}
        breadcrumbs={[
          { label: t("tabs.home.title"), href: ROUTES.ADMIN.HOME },
          { label: t("overviewInsights.title"), href: ROUTES.ADMIN.OVERVIEW_INSIGHTS.LIST },
          { label: t("overviewInsights.stationTest.title") },
        ]}
      />
      <div className="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <Card><CardContent className="space-y-4 p-5 text-right"><p className="text-2xl font-bold text-[#1E3A66]">80%</p><Button className="w-full">{t("overviewInsights.stationTest.actions.publish")}</Button></CardContent></Card>
        <Card><CardContent className="space-y-4 p-6 text-right"><h3 className="text-2xl font-bold text-[#1E3A66]">{t("overviewInsights.stationTest.formTitle")}</h3><div className="h-64 rounded-xl bg-slate-50" /></CardContent></Card>
      </div>
    </div>
  );
}
