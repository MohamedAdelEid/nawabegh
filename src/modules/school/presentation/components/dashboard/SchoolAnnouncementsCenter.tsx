"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Activity, Eye, FileDown, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/shared/presentation/components/ui/button";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import { ModalShell, ModalTitle } from "@/shared/presentation/components/ui/modal-shell";
import {
  DashboardBadge,
  DashboardDataTable,
  DashboardPageHeader,
  DashboardTableCard,
  type DashboardDataTableColumn,
} from "@/shared/presentation/components/dashboard";
import { formatDate, formatNumber } from "@/shared/application/lib/format";
import { notify } from "@/shared/application/lib/toast";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { useSchoolDashboard } from "@/modules/school/application/hooks/useSchoolDashboard";
import { useSchoolAnnouncementMutations } from "@/modules/school/application/hooks/useSchoolAnnouncementMutations";
import { exportSchoolAnnouncements } from "@/modules/school/infrastructure/api/schoolAnnouncementsApi";
import { SchoolKpiCards } from "@/modules/school/presentation/components/shared/SchoolKpiCards";
import { SchoolStatusBadge } from "@/modules/school/presentation/components/shared/SchoolStatusBadge";
import { audienceText } from "@/modules/school/presentation/lib/schoolAnnouncementLabels";
import { SchoolAnnouncementComposer } from "@/modules/school/presentation/components/dashboard/SchoolAnnouncementComposer";
import { SchoolDashboardSkeleton } from "@/modules/school/presentation/components/dashboard/SchoolDashboardSkeleton";
import type {
  SchoolDashboardActivityItem,
  SchoolDashboardSidebarItem,
} from "@/modules/school/domain/types/schoolAnnouncements.types";

export function SchoolAnnouncementsCenter() {
  const t = useTranslations("school.dashboard");
  const locale = useLocale();
  const router = useRouter();
  const { data, isLoading, isError } = useSchoolDashboard();
  const { remove } = useSchoolAnnouncementMutations();
  const [isExporting, setIsExporting] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<SchoolDashboardSidebarItem | null>(null);

  const activityColumns = useMemo<DashboardDataTableColumn<SchoolDashboardActivityItem>[]>(
    () => [
      {
        id: "title",
        header: t("dashboardPage.recentActivity.columns.title"),
        renderCell: (item) => <span className="font-semibold text-slate-700">{item.title}</span>,
      },
      {
        id: "type",
        header: t("dashboardPage.recentActivity.columns.type"),
        renderCell: (item) => (
          <span className="text-slate-500">
            {item.typeLabel || t(`type.${item.type === "Ad" ? "ad" : "urgentAlert"}`)}
          </span>
        ),
      },
      {
        id: "status",
        header: t("dashboardPage.recentActivity.columns.status"),
        renderCell: (item) => (
          <SchoolStatusBadge tone={item.statusTone} label={item.statusLabel} />
        ),
      },
      {
        id: "date",
        header: t("dashboardPage.recentActivity.columns.date"),
        renderCell: (item) => (
          <span className="text-slate-400">
            {item.date ? formatDate(item.date, locale) : "—"}
          </span>
        ),
      },
    ],
    [locale, t],
  );

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportSchoolAnnouncements();
    } catch (error) {
      notify.error(error instanceof Error ? error.message : t("common.error"));
    } finally {
      setIsExporting(false);
    }
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    try {
      await remove.mutateAsync(pendingDelete.id);
      notify.success(t("listPage.delete.success"));
    } catch (error) {
      notify.error(error instanceof Error ? error.message : t("listPage.delete.error"));
    } finally {
      setPendingDelete(null);
    }
  };

  if (isLoading) return <SchoolDashboardSkeleton />;
  if (isError || !data) {
    return <p className="text-sm text-red-600">{t("common.error")}</p>;
  }

  const tracking = data.realtimeTracking;

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title={t("dashboardPage.title")}
        description={t("dashboardPage.subtitle")}
        action={
          <Button
            type="button"
            variant="outline"
            disabled={isExporting}
            onClick={() => void handleExport()}
            className="h-14 rounded-2xl border-slate-200 px-6"
          >
            <FileDown className="h-4 w-4" />
            {t("dashboardPage.exportReport")}
          </Button>
        }
      />

      <SchoolKpiCards kpis={data.kpis} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_30rem]">
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
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, tracking.progressPercentage)}%` }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                        className="h-full rounded-full bg-[#C9A227]"
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
                <h2 className="text-lg font-bold text-slate-800">
                  <Link
                    href={ROUTES.USER.SCHOOL.ANNOUNCEMENTS.LIST}
                    className="rounded-md transition-colors hover:text-[#2C4260] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2C4260]/30"
                  >
                    {t("dashboardPage.activeAndScheduled.title")}
                  </Link>
                </h2>
                <DashboardBadge tone="primary">
                  {t("dashboardPage.activeAndScheduled.latestBadge")}
                </DashboardBadge>
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
                        <div className="text-right">
                          <p className="font-bold text-slate-800">{item.title}</p>
                          <p className="mt-1 text-xs text-slate-400">
                            {audienceText(t, item.audience, item.audienceLabel)}
                            {item.scheduledOrSentAt
                              ? ` • ${formatDate(item.scheduledOrSentAt, locale)}`
                              : item.timeLabel
                                ? ` • ${item.timeLabel}`
                              : ""}
                          </p>
                        </div>
                        <SchoolStatusBadge tone={item.statusTone} label={item.statusLabel} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              <Button
                variant="outline"
                className="pt-1 text-center border w-full"
                onClick={() => router.push(ROUTES.USER.SCHOOL.ANNOUNCEMENTS.LIST)}
              >
                {t("dashboardPage.activeAndScheduled.viewAll")}
              </Button>
            </CardContent>
          </Card>

          <DashboardTableCard title={t("dashboardPage.recentActivity.title")}>
            <DashboardDataTable
              rows={data.recentActivity}
              columns={activityColumns}
              getRowKey={(item) => item.id}
              emptyMessage={t("dashboardPage.recentActivity.empty")}
              // tableClassName="min-w-[34rem]"
            />
          </DashboardTableCard>
        </div>
      </div>

      <ModalShell open={pendingDelete !== null} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <div className="space-y-5 text-right">
          <ModalTitle className="text-xl font-bold text-slate-800">
            {t("listPage.delete.title")}
          </ModalTitle>
          <p className="text-sm text-slate-500">
            {t("listPage.delete.description", { title: pendingDelete?.title ?? "" })}
          </p>
          <div className="flex justify-start gap-3">
            <Button
              type="button"
              disabled={remove.isPending}
              onClick={() => void handleDelete()}
              className="rounded-xl bg-red-600 text-white hover:bg-red-700"
            >
              {t("listPage.delete.confirm")}
            </Button>
            <Button type="button" variant="outline" onClick={() => setPendingDelete(null)}>
              {t("listPage.delete.cancel")}
            </Button>
          </div>
        </div>
      </ModalShell>
    </div>
  );
}
