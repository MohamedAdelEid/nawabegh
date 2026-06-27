"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import {DashboardPageHeader, DashboardStatCard,
  DashboardBreadcrumb,} from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";
import { BookOpen, FileQuestion, Users, Award } from "lucide-react";

export function AdminOverviewInsightsPage() {
  const t = useTranslations("admin.dashboard");
  const router = useRouter();

  return (
    <div className="space-y-8">
            <div className="space-y-2">
        <DashboardBreadcrumb items={[
          { label: t("tabs.home.title"), href: ROUTES.ADMIN.HOME },
          { label: t("overviewInsights.title") },
        ]} />
        <DashboardPageHeader
        title={t("overviewInsights.title")}
        description={t("overviewInsights.description")}
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push(ROUTES.ADMIN.OVERVIEW_INSIGHTS.CREATE_RANDOM_TEST)}>
              {t("overviewInsights.actions.createRandom")}
            </Button>
            <Button onClick={() => router.push(ROUTES.ADMIN.OVERVIEW_INSIGHTS.CREATE_STATION_TEST)}>
              {t("overviewInsights.actions.createStation")}
            </Button>
          </div>
        }
      />
      </div>
      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <DashboardStatCard label={t("overviewInsights.stats.totalTests")} value="1,284" indicator="+12%" icon={FileQuestion} iconTone="info" />
        <DashboardStatCard label={t("overviewInsights.stats.questionBank")} value="42,500" indicator="نمو" icon={BookOpen} iconTone="warning" />
        <DashboardStatCard label={t("overviewInsights.stats.students")} value="8,932" indicator="+5.2%" icon={Users} iconTone="success" />
        <DashboardStatCard label={t("overviewInsights.stats.certificates")} value="7,421" indicator="+21%" icon={Award} iconTone="primary" />
      </section>
    </div>
  );
}
