"use client";

import { useState } from "react";
import {
  Download,
  Eye,
  LogIn,
  Pencil,
  Plus,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  liveBroadcastDashboardData,
  type LiveSessionRecordingId,
  type LiveSessionStatusId,
} from "@/modules/admin/domain/data/liveBroadcastDashboardData";
import {
  DashboardBadge,
  DashboardDataTable,
  type DashboardDataTableColumn,
  DashboardPageHeader,
  DashboardPagination,
  DashboardStatCard,
  DashboardTableCard,
} from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { cn } from "@/shared/application/lib/cn";

function sessionStatusTone(statusId: LiveSessionStatusId) {
  if (statusId === "live") return "danger" as const;
  if (statusId === "upcoming") return "info" as const;
  return "neutral" as const;
}

function teacherAvatarClass(seed: string) {
  const sum = Array.from(seed).reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const tones = [
    "bg-[#D9F2F7] text-[#127A9C]",
    "bg-[#FCE7D6] text-[#9A4B1D]",
    "bg-[#DBEEF6] text-[#255E8A]",
  ] as const;
  return tones[sum % tones.length] ?? tones[0];
}

export function LiveBroadcastDashboard() {
  const t = useTranslations("admin.dashboard");
  const router = useRouter();
  const data = liveBroadcastDashboardData;
  const [currentPage, setCurrentPage] = useState(1);
  const paginationPages = [1, 2, 3, 4, 5];
  const tableColumns: Array<DashboardDataTableColumn<(typeof data.rows)[number]>> = [
    {
      id: "session",
      header: t("liveBroadcast.list.table.columns.session"),
      renderCell: (row) => (
        <div className="min-w-[12rem] space-y-1 text-right">
          <p className="font-semibold text-slate-800">{t(row.titleKey)}</p>
          <p className="text-xs text-slate-400">{t(row.subtitleKey)}</p>
        </div>
      ),
    },
    {
      id: "course",
      header: t("liveBroadcast.list.table.columns.course"),
      renderCell: (row) => t(row.courseKey),
    },
    {
      id: "teacher",
      header: t("liveBroadcast.list.table.columns.teacher"),
      renderCell: (row) => (
        <div className="flex items-center justify-end gap-2">
          <span className="text-slate-700">{t(row.teacherNameKey)}</span>
          <div
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold",
              teacherAvatarClass(row.id),
            )}
          >
            {row.teacherInitials}
          </div>
        </div>
      ),
    },
    {
      id: "datetime",
      header: t("liveBroadcast.list.table.columns.datetime"),
      renderCell: (row) => (
        <div className="space-y-0.5 text-right">
          <p className="text-slate-700">{t(row.dateLabelKey)}</p>
          <p className="text-xs text-slate-400">{t(row.timeLabelKey)}</p>
        </div>
      ),
    },
    {
      id: "duration",
      header: t("liveBroadcast.list.table.columns.duration"),
      cellClassName: "font-medium",
      renderCell: (row) => t(row.durationKey),
    },
    {
      id: "status",
      header: t("liveBroadcast.list.table.columns.status"),
      renderCell: (row) => (
        <DashboardBadge tone={sessionStatusTone(row.statusId)} withDot={row.statusId === "live"}>
          {t(`liveBroadcast.list.table.status.${row.statusId}`)}
        </DashboardBadge>
      ),
    },
    {
      id: "recording",
      header: t("liveBroadcast.list.table.columns.recording"),
      renderCell: (row) => (
        <RecordingCell recordingId={row.recordingId} />
      ),
    },
  ];

  return (
    <div className="space-y-8">
      <DashboardPageHeader
        title={t("liveBroadcast.list.page.title")}
        description={t("liveBroadcast.list.page.description")}
        breadcrumbs={[
          { label: t("tabs.home.title"), href: ROUTES.ADMIN.HOME },
          { label: t("liveBroadcast.list.page.breadcrumb") },
        ]}
        action={
          <Button
            type="button"
            className="dashboard-raised-button h-14 rounded-2xl bg-[var(--dashboard-primary)] px-6 text-base font-semibold text-white hover:bg-[var(--dashboard-primary)] cursor-pointer"
            style={{ boxShadow: "var(--dashboard-shadow-button)" }}
            onClick={() => router.push(ROUTES.ADMIN.LIVE_BROADCAST.CREATE)}
          >
            <Plus className="h-5 w-5" aria-hidden />
            {t("liveBroadcast.list.page.scheduleNew")}
          </Button>
        }
      />

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {data.stats.map((stat) => (
          <DashboardStatCard
            key={stat.id}
            label={t(stat.labelKey)}
            value={stat.value}
            indicator={t(stat.indicatorKey)}
            indicatorClassName={stat.indicatorToneClassName}
            icon={stat.icon}
            iconTone={stat.iconTone}
          />
        ))}
      </section>

      <DashboardTableCard
        title={t("liveBroadcast.list.table.title")}
        actions={
          <>
            <Button
              type="button"
              variant="outline"
              className="rounded-2xl border-slate-200 px-4 text-slate-700"
              aria-label={t("liveBroadcast.list.table.actions.export")}
            >
              <Download className="h-4 w-4" aria-hidden />
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-2xl border-slate-200 px-4 text-slate-700"
              aria-label={t("liveBroadcast.list.table.actions.filter")}
            >
              <SlidersHorizontal className="h-4 w-4" aria-hidden />
            </Button>
          </>
        }
        footer={
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <p className="text-right text-sm text-slate-400">
              {t("liveBroadcast.list.table.pagination.summary", {
                visible: data.pagination.visibleItems,
                total: data.pagination.totalItems,
              })}
            </p>
            <DashboardPagination
              pages={paginationPages}
              currentPage={currentPage}
              previousLabel={t("liveBroadcast.list.table.pagination.previous")}
              nextLabel={t("liveBroadcast.list.table.pagination.next")}
              onPageChange={setCurrentPage}
            />
          </div>
        }
      >
        <DashboardDataTable
          rows={data.rows}
          columns={tableColumns}
          getRowKey={(row) => row.id}
          emptyMessage="—"
          rowClassName="hover:bg-slate-50/80"
          actionsHeader={t("liveBroadcast.list.table.columns.actions")}
          renderActions={(row) => (
            <div className="flex flex-wrap items-center justify-end gap-1">
              <button
                type="button"
                className="dashboard-icon-btn text-[var(--dashboard-primary)]"
                aria-label={t("liveBroadcast.list.table.actions.enter")}
                onClick={() => {
                  if (row.statusId === "ended" && row.recordingId === "uploaded") {
                    router.push(ROUTES.ADMIN.LIVE_BROADCAST.WATCH(row.id));
                    return;
                  }
                  if (row.statusId === "live" || row.statusId === "upcoming") {
                    router.push(ROUTES.ADMIN.LIVE_BROADCAST.CREATE);
                  }
                }}
              >
                <LogIn className="h-4 w-4" aria-hidden />
              </button>
              <button type="button" className="dashboard-icon-btn" aria-label={t("liveBroadcast.list.table.actions.edit")}>
                <Pencil className="h-4 w-4" aria-hidden />
              </button>
              <button type="button" className="dashboard-icon-btn" aria-label={t("liveBroadcast.list.table.actions.view")}>
                <Eye className="h-4 w-4" aria-hidden />
              </button>
              <button
                type="button"
                className="dashboard-icon-btn dashboard-icon-btn--danger"
                aria-label={t("liveBroadcast.list.table.actions.delete")}
              >
                <Trash2 className="h-4 w-4" aria-hidden />
              </button>
            </div>
          )}
        />
      </DashboardTableCard>
    </div>
  );
}

function RecordingCell({ recordingId }: { recordingId: LiveSessionRecordingId }) {
  const t = useTranslations("admin.dashboard");
  if (recordingId === "none") {
    return <span className="text-slate-400">—</span>;
  }
  return (
    <span className="inline-flex items-center gap-1 font-medium text-emerald-600">
      <span className="text-emerald-500">✓</span>
      {t("liveBroadcast.list.table.recording.uploaded")}
    </span>
  );
}
