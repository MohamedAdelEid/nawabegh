"use client";

import { AlertTriangle, Clock, Megaphone, TrendingUp } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { DashboardStatCard } from "@/shared/presentation/components/dashboard/DashboardStatCard";
import { formatNumber } from "@/shared/application/lib/format";
import type { SchoolAnnouncementKpis } from "@/modules/school/domain/types/schoolAnnouncements.types";

function changeIndicator(
  t: ReturnType<typeof useTranslations>,
  value: number | null,
): { text?: string; className?: string } {
  if (value === null || value === 0) return {};
  const sign = value > 0 ? "+" : "";
  return {
    text: t("kpis.changeThisMonth", { value: `${sign}${value}` }),
    className: value > 0 ? "text-emerald-600" : "text-red-500",
  };
}

export function SchoolKpiCards({ kpis }: { kpis: SchoolAnnouncementKpis }) {
  const t = useTranslations("school.dashboard");
  const locale = useLocale();

  const totalChange = changeIndicator(t, kpis.totalAnnouncementsChangePercent);
  const alertsChange = changeIndicator(t, kpis.activeAlertsChangePercent);
  const reachIndicator =
    kpis.reachRateLabel === "ExcellentPerformance" || kpis.reachRate >= 90
      ? t("kpis.excellentPerformance")
      : undefined;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <DashboardStatCard
        label={t("kpis.totalAnnouncements")}
        value={formatNumber(kpis.totalAnnouncements, locale)}
        indicator={totalChange.text}
        indicatorClassName={totalChange.className}
        icon={Megaphone}
        iconTone="primary"
      />
      <DashboardStatCard
        label={t("kpis.activeAlerts")}
        value={formatNumber(kpis.activeAlerts, locale)}
        indicator={alertsChange.text}
        indicatorClassName={alertsChange.className}
        icon={AlertTriangle}
        iconTone="danger"
      />
      <DashboardStatCard
        label={t("kpis.reachRate")}
        value={`${formatNumber(kpis.reachRate, locale)}%`}
        indicator={reachIndicator}
        indicatorClassName="text-emerald-600"
        icon={TrendingUp}
        iconTone="success"
      />
      <DashboardStatCard
        label={t("kpis.scheduledSoon")}
        value={formatNumber(kpis.scheduledSoon, locale)}
        icon={Clock}
        iconTone="warning"
      />
    </div>
  );
}
