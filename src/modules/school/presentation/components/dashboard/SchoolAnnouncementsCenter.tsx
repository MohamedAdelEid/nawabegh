"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Activity, Download, Eye, FileDown } from "lucide-react";
import { Button } from "@/shared/presentation/components/ui/button";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import { DashboardBadge } from "@/shared/presentation/components/dashboard/DashboardBadge";
import { formatDate, formatNumber } from "@/shared/application/lib/format";
import { notify } from "@/shared/application/lib/toast";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { useSchoolDashboard } from "@/modules/school/application/hooks/useSchoolDashboard";
import { exportSchoolAnnouncements } from "@/modules/school/infrastructure/api/schoolAnnouncementsApi";
import { SchoolKpiCards } from "@/modules/school/presentation/components/shared/SchoolKpiCards";
import { SchoolStatusBadge } from "@/modules/school/presentation/components/shared/SchoolStatusBadge";
import { audienceText } from "@/modules/school/presentation/lib/schoolAnnouncementLabels";
import { SchoolAnnouncementComposer } from "@/modules/school/presentation/components/dashboard/SchoolAnnouncementComposer";
import { SchoolDashboardSkeleton } from "@/modules/school/presentation/components/dashboard/SchoolDashboardSkeleton";

export function SchoolAnnouncementsCenter() {
  const t = useTranslations("school.dashboard");
  const locale = useLocale();
  const router = useRouter();
  const { data, isLoading, isError } = useSchoolDashboard();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportSchoolAnnouncements();
    } catch {
      notify.error(t("common.error"));
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) return <SchoolDashboardSkeleton />;
  if (isError || !data) {
    return <p className="text-sm text-red-600">{t("common.error")}</p>;
  }

  const tracking = data.realtimeTracking;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <Button
          type="button"
          variant="outline"
          disabled={isExporting}
          onClick={() => void handleExport()}
          className="h-11 rounded-2xl border-slate-200"
        >
          <FileDown className="h-4 w-4" />
          {t("dashboardPage.exportReport")}
        </Button>
        <div className="text-right">
          <h1 className="text-2xl font-bold text-slate-800">{t("dashboardPage.title")}</h1>
          <p className="mt-1 text-sm text-slate-500">{t("dashboardPage.subtitle")}</p>
        </div>
      </header>

      <SchoolKpiCards kpis={data.kpis} />

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <SchoolAnnouncementComposer />

          <Card className="rounded-[1.75rem] border-transparent bg-[#2C4260] text-white shadow-[var(--dashboard-shadow-soft)]">
            <CardContent className="space-y-4 p-6 text-right">
              <div className="flex items-center justify-between gap-3">
                {tracking?.isActive ? (
                  <DashboardBadge tone="success" withDot>
                    {t("dashboardPage.realtimeTracking.activeNow")}
                  </DashboardBadge>
                ) : (
                  <span />
                )}
                <h2 className="flex items-center gap-2 text-lg font-bold">
                  {t("dashboardPage.realtimeTracking.title")}
                  <Activity className="h-5 w-5 text-[#C9A227]" />
                </h2>
              </div>

              {tracking ? (
                <>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold">
                        {formatNumber(tracking.sentCount, locale)}
                      </p>
                      <p className="mt-1 text-xs text-white/60">
                        {t("dashboardPage.realtimeTracking.sent")}
                      </p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {formatNumber(tracking.inProgressCount, locale)}
                      </p>
                      <p className="mt-1 text-xs text-white/60">
                        {t("dashboardPage.realtimeTracking.inProgress")}
                      </p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-[#F87171]">
                        {formatNumber(tracking.failedCount, locale)}
                      </p>
                      <p className="mt-1 text-xs text-white/60">
                        {t("dashboardPage.realtimeTracking.failed")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/15">
                      <div
                        className="h-full rounded-full bg-[#C9A227]"
                        style={{ width: `${Math.min(100, tracking.progressPercentage)}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-[#C9A227]">
                      {formatNumber(tracking.progressPercentage, locale)}%
                    </span>
                  </div>
                </>
              ) : (
                <p className="text-sm text-white/60">{t("dashboardPage.realtimeTracking.idle")}</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-[1.75rem] border-white/80 bg-white shadow-[var(--dashboard-shadow-soft)]">
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center justify-between gap-2">
                <DashboardBadge tone="primary">
                  {t("dashboardPage.activeAndScheduled.latestBadge")}
                </DashboardBadge>
                <h2 className="text-lg font-bold text-slate-800">
                  {t("dashboardPage.activeAndScheduled.title")}
                </h2>
              </div>

              {data.activeAndScheduled.length === 0 ? (
                <p className="text-sm text-slate-500">
                  {t("dashboardPage.activeAndScheduled.empty")}
                </p>
              ) : (
                <ul className="space-y-3">
                  {data.activeAndScheduled.map((item) => (
                    <li
                      key={item.id}
                      className={`rounded-2xl border p-4 ${
                        item.statusTone === "urgent"
                          ? "border-red-100 bg-red-50/60"
                          : "border-slate-100"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <SchoolStatusBadge tone={item.statusTone} label={item.statusLabel} />
                        <div className="text-right">
                          <p className="font-bold text-slate-800">{item.title}</p>
                          <p className="mt-1 text-xs text-slate-400">
                            {audienceText(t, item.audience, item.audienceLabel)}
                            {item.scheduledOrSentAt
                              ? ` • ${formatDate(item.scheduledOrSentAt, locale)}`
                              : ""}
                          </p>
                        </div>
                      </div>
                      {item.canView ? (
                        <div className="mt-3 flex justify-start">
                          <button
                            type="button"
                            onClick={() =>
                              router.push(ROUTES.USER.SCHOOL.ANNOUNCEMENTS.VIEW(item.id))
                            }
                            className="flex items-center gap-1 text-xs font-semibold text-[#2C4260]"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}

              <div className="pt-1 text-center">
                <Link
                  href={ROUTES.USER.SCHOOL.ANNOUNCEMENTS.LIST}
                  className="text-sm font-semibold text-[#2C4260]"
                >
                  {t("dashboardPage.activeAndScheduled.viewAll")}
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[1.75rem] border-white/80 bg-white shadow-[var(--dashboard-shadow-soft)]">
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center justify-between gap-2">
                <Download className="h-4 w-4 text-slate-400" />
                <h2 className="text-lg font-bold text-slate-800">
                  {t("dashboardPage.recentActivity.title")}
                </h2>
              </div>

              {data.recentActivity.length === 0 ? (
                <p className="text-sm text-slate-500">{t("dashboardPage.recentActivity.empty")}</p>
              ) : (
                <table className="w-full text-right text-sm">
                  <thead>
                    <tr className="text-xs text-slate-400">
                      <th className="py-2 font-medium">
                        {t("dashboardPage.recentActivity.columns.title")}
                      </th>
                      <th className="py-2 font-medium">
                        {t("dashboardPage.recentActivity.columns.type")}
                      </th>
                      <th className="py-2 font-medium">
                        {t("dashboardPage.recentActivity.columns.status")}
                      </th>
                      <th className="py-2 font-medium">
                        {t("dashboardPage.recentActivity.columns.date")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentActivity.map((item) => (
                      <tr key={item.id} className="border-t border-slate-50">
                        <td className="py-3 font-semibold text-slate-700">{item.title}</td>
                        <td className="py-3 text-slate-500">
                          {item.typeLabel || t(`type.${item.type === "Ad" ? "ad" : "urgentAlert"}`)}
                        </td>
                        <td className="py-3">
                          <SchoolStatusBadge tone={item.statusTone} label={item.statusLabel} />
                        </td>
                        <td className="py-3 text-slate-400">
                          {item.date ? formatDate(item.date, locale) : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
