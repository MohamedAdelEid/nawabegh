"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  ClipboardList,
  Eye,
  Hourglass,
  MoreHorizontal,
  Plus,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import {
  ADMIN_SUPPORT_TICKETS_TABLE_QUERY_KEY,
  useSupportTicketsTable,
} from "@/modules/admin/application/hooks/useSupportTicketsTable";
import type { SupportTicketRow } from "@/modules/admin/domain/types/supportTickets.types";
import type { SupportTicketStats } from "@/modules/admin/domain/types/supportTickets.types";
import { getSupportTicketStats } from "@/modules/admin/infrastructure/api/supportTicketsApi";
import {
  SupportTicketCreateModal,
  SupportTicketDetailSheet,
  SupportTicketsFilterBar,
} from "@/modules/admin/presentation/components/support-tickets";
import {
  formatSupportTicketDate,
  getInitials,
  supportTicketPriorityTone,
  supportTicketStatusTone,
} from "@/modules/admin/presentation/components/support-tickets/supportTicketDisplay";
import { notify } from "@/shared/application/lib/toast";
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
import { Skeleton } from "@/shared/presentation/components/ui/skeleton";
import { ROUTES } from "@/shared/infrastructure/config/routes";

const STAT_ICONS = {
  open: ClipboardList,
  inProgress: Hourglass,
  closed: CheckCircle2,
  total: MoreHorizontal,
} as const;

const STAT_TONES = {
  open: "danger",
  inProgress: "warning",
  closed: "success",
  total: "info",
} as const;

export function SupportTicketsDashboard() {
  const t = useTranslations("admin.dashboard.supportTickets");
  const locale = useLocale();
  const queryClient = useQueryClient();
  const ticketsTable = useSupportTicketsTable();
  const page = ticketsTable.page;
  const responseStatus = ticketsTable.data?.status ?? "Success";

  const [stats, setStats] = useState<SupportTicketStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    const result = await getSupportTicketStats();
    if (result.data) setStats(result.data);
    else if (result.errorMessage) notify.error(result.errorMessage);
    setStatsLoading(false);
  }, []);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  const invalidateAll = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: [ADMIN_SUPPORT_TICKETS_TABLE_QUERY_KEY] }),
      loadStats(),
    ]);
  }, [loadStats, queryClient]);

  const statCards = useMemo(
    () => [
      {
        id: "open" as const,
        label: t("stats.open.label"),
        value: stats ? new Intl.NumberFormat(locale).format(stats.open) : "—",
        indicator: t("stats.open.indicator"),
        indicatorClassName: "text-rose-500",
      },
      {
        id: "inProgress" as const,
        label: t("stats.inProgress.label"),
        value: stats ? new Intl.NumberFormat(locale).format(stats.inProgress) : "—",
        indicator: t("stats.inProgress.indicator"),
      },
      {
        id: "closed" as const,
        label: t("stats.closed.label"),
        value: stats ? new Intl.NumberFormat(locale).format(stats.closed) : "—",
        indicator: t("stats.closed.indicator"),
        indicatorClassName: "text-emerald-600",
      },
      {
        id: "total" as const,
        label: t("stats.total.label"),
        value: stats ? new Intl.NumberFormat(locale).format(stats.total) : "—",
        indicator: t("stats.total.indicator"),
      },
    ],
    [locale, stats, t],
  );

  const columns = useMemo<Array<DashboardDataTableColumn<SupportTicketRow>>>(
    () => [
      {
        id: "ticketNumber",
        header: t("table.columns.ticketNumber"),
        renderCell: (row) => (
          <span className="font-semibold text-[#2C4260]">#{row.ticketNumber}</span>
        ),
      },
      {
        id: "user",
        header: t("table.columns.user"),
        renderCell: (row) => (
          <div className="flex min-w-[12rem] items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#DCE6F5] text-sm font-bold text-[#2C4260]">
              {getInitials(row.createdByName)}
            </div>
            <div className="space-y-0.5 text-right">
              <p className="font-semibold text-slate-800">{row.createdByName}</p>
              {row.assignedAdminName && row.assignedAdminName !== "—" ? (
                <p className="text-xs text-slate-400">
                  {t("table.assignedTo", { name: row.assignedAdminName })}
                </p>
              ) : null}
            </div>
          </div>
        ),
      },
      {
        id: "priority",
        header: t("table.columns.priority"),
        renderCell: (row) => (
          <DashboardBadge tone={supportTicketPriorityTone(row.priority)}>
            {t(`table.priorities.${row.priority}`)}
          </DashboardBadge>
        ),
      },
      {
        id: "subject",
        header: t("table.columns.subject"),
        renderCell: (row) => (
          <p className="max-w-[16rem] truncate text-sm text-slate-600">{row.subject}</p>
        ),
      },
      {
        id: "status",
        header: t("table.columns.status"),
        renderCell: (row) => (
          <DashboardBadge tone={supportTicketStatusTone(row.status)} withDot>
            {t(`table.statuses.${row.status}`)}
          </DashboardBadge>
        ),
      },
      {
        id: "date",
        header: t("table.columns.date"),
        cellClassName: "text-slate-500",
        renderCell: (row) => formatSupportTicketDate(row.lastMessageAt || row.createdAt, locale),
      },
    ],
    [locale, t],
  );

  const openTicketDetail = (ticketId: string) => {
    setSelectedTicketId(ticketId);
    setDetailOpen(true);
  };

  return (
    <div className="space-y-8">
      <DashboardPageHeader
        title={t("page.title")}
        description={t("page.description")}
        breadcrumbs={[
          { label: t("breadcrumbs.home"), href: ROUTES.ADMIN.HOME },
          { label: t("page.title") },
        ]}
        action={
          <Button
            type="button"
            className="h-14 rounded-2xl bg-[#2C4260] px-6 text-base font-semibold text-white shadow-[var(--dashboard-shadow-button)] hover:bg-[#243751]"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="ms-2 h-5 w-5" aria-hidden />
            {t("page.createTicket")}
          </Button>
        }
      />

      <section className="grid gap-5 lg:grid-cols-4">
        {statCards.map((stat) =>
          statsLoading ? (
            <Skeleton key={stat.id} className="h-32 rounded-[1.75rem]" />
          ) : (
            <DashboardStatCard
              key={stat.id}
              label={stat.label}
              value={stat.value}
              indicator={stat.indicator}
              indicatorClassName={stat.indicatorClassName}
              icon={STAT_ICONS[stat.id]}
              iconTone={STAT_TONES[stat.id]}
            />
          ),
        )}
      </section>

      <SupportTicketsFilterBar
        filters={ticketsTable.filters}
        onChange={(patch) => ticketsTable.setFilters({ ...ticketsTable.filters, ...patch })}
        onApply={() => void ticketsTable.refetch()}
      />

      <DashboardTableCard
        title={t("table.title")}
        footer={
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <p className="text-right text-sm text-slate-400">
              {t("table.pagination.summary", {
                from: page?.rows.length ? (page.currentPage - 1) * page.pageSize + 1 : 0,
                to: Math.min(
                  (page?.currentPage ?? 1) * (page?.pageSize ?? 20),
                  page?.totalItems ?? 0,
                ),
                total: page?.totalItems ?? 0,
              })}
            </p>
            <DashboardPagination
              pages={ticketsTable.pages}
              currentPage={page?.currentPage ?? ticketsTable.pageNumber}
              previousLabel={t("table.pagination.previous")}
              nextLabel={t("table.pagination.next")}
              onPageChange={ticketsTable.setPageNumber}
            />
          </div>
        }
      >
        {ticketsTable.isLoading ? (
          <div className="space-y-4 p-6">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : responseStatus === "Success" && (page?.rows.length ?? 0) === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-2 p-8 text-center">
            <p className="text-lg font-semibold text-slate-700">{t("table.states.empty.title")}</p>
            <p className="text-sm text-slate-500">{t("table.states.empty.description")}</p>
          </div>
        ) : !page ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3 p-8 text-center">
            <p className="text-lg font-semibold text-slate-700">{t("table.states.error.title")}</p>
            <Button type="button" onClick={() => void ticketsTable.refetch()}>
              {t("table.states.error.retry")}
            </Button>
          </div>
        ) : (
          <DashboardDataTable
            rows={page.rows}
            columns={columns}
            getRowKey={(row) => row.id}
            emptyMessage="—"
            actionsHeader={t("table.columns.actions")}
            renderActions={(row) => (
              <button
                type="button"
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label={t("table.actions.view")}
                onClick={() => openTicketDetail(row.id)}
              >
                <Eye className="h-5 w-5" />
              </button>
            )}
          />
        )}
      </DashboardTableCard>

      <SupportTicketCreateModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={() => void invalidateAll()}
      />

      <SupportTicketDetailSheet
        ticketId={selectedTicketId}
        open={detailOpen}
        onOpenChange={(open) => {
          setDetailOpen(open);
          if (!open) setSelectedTicketId(null);
        }}
        onUpdated={() => void invalidateAll()}
      />
    </div>
  );
}
