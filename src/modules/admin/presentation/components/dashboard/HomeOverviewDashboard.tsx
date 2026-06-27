"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { DashboardPageHeader } from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";
import { useAdminHomeDashboard } from "@/modules/admin/application/hooks/useAdminHomeDashboard";
import { HomeOverviewAnimatedSection } from "@/modules/admin/presentation/components/dashboard/HomeOverviewAnimatedSection";
import {
  HomeActivityMetrics,
  HomeDashboardSkeleton,
  HomeNewUsersChart,
  HomeQuickLinks,
  HomeRecentActivities,
  HomeReviewTasks,
  HomeRevenuePanel,
  HomeSchoolRankings,
  HomeSummaryCards,
  HomeTopStudents,
  type NewUsersChartMonths,
} from "@/modules/admin/presentation/components/dashboard/home";

export function HomeOverviewDashboard() {
  const t = useTranslations("admin.dashboard");
  const [chartMonths, setChartMonths] = useState<NewUsersChartMonths>(6);

  const { data, isPending, isError, refetch } = useAdminHomeDashboard({
    newUsersChartMonths: chartMonths,
  });

  if (isPending && !data) {
    return <HomeDashboardSkeleton />;
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-[2rem] border border-white/80 bg-white p-10 text-center shadow-[var(--dashboard-shadow-soft)]">
        <p className="text-sm text-slate-500">{t("home.common.error")}</p>
        <Button type="button" variant="outline" className="rounded-xl" onClick={() => refetch()}>
          {t("home.common.retry")}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 overflow-visible">
      <HomeOverviewAnimatedSection direction="top" delay={0}>
        <DashboardPageHeader
          title={t("home.title")}
          description={t("home.description")}
          breadcrumbs={[{ label: t("tabs.home.title"), href: ROUTES.ADMIN.HOME }]}
        />
      </HomeOverviewAnimatedSection>

      <HomeSummaryCards cards={data.summaryCards} />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <HomeNewUsersChart
            points={data.newUsersChart}
            months={chartMonths}
            onMonthsChange={setChartMonths}
          />
        </div>
        <div className="space-y-6">
          <HomeRevenuePanel revenue={data.revenue} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="flex flex-col gap-6">
            <HomeActivityMetrics metrics={data.activityMetrics} />
            <HomeTopStudents students={data.topStudents} />
          </div>
        </div>

        <div className="space-y-6">
          <HomeSchoolRankings schools={data.schoolRankings} />
        </div>
      </div>

      <HomeQuickLinks />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <HomeReviewTasks reviewTasks={data.reviewTasks} />
        </div>
        <HomeRecentActivities activities={data.recentActivities} />
      </div>
    </div>
  );
}
