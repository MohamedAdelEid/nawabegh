"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Eye, Lightbulb, Megaphone, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/shared/presentation/components/ui/button";
import {
  DashboardDataTable,
  DashboardFiltersPanel,
  DashboardInsightCard,
  DashboardPageHeader,
  DashboardPagination,
  DashboardSearchFilter,
  DashboardSegmentedControl,
  DashboardTableCard,
  type DashboardDataTableColumn,
} from "@/shared/presentation/components/dashboard";
import {
  ModalShell,
  ModalTitle,
} from "@/shared/presentation/components/ui/modal-shell";
import { formatDate, formatNumber } from "@/shared/application/lib/format";
import { notify } from "@/shared/application/lib/toast";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { useSchoolAnnouncementsKpis } from "@/modules/school/application/hooks/useSchoolAnnouncementsKpis";
import { useSchoolAnnouncementsList } from "@/modules/school/application/hooks/useSchoolAnnouncementsList";
import { useSchoolAnnouncementMutations } from "@/modules/school/application/hooks/useSchoolAnnouncementMutations";
import { useSchoolDashboard } from "@/modules/school/application/hooks/useSchoolDashboard";
import { SchoolKpiCards } from "@/modules/school/presentation/components/shared/SchoolKpiCards";
import { SchoolStatusBadge } from "@/modules/school/presentation/components/shared/SchoolStatusBadge";
import { audienceText } from "@/modules/school/presentation/lib/schoolAnnouncementLabels";
import { SchoolAnnouncementsListSkeleton } from "@/modules/school/presentation/components/announcements/SchoolAnnouncementsListSkeleton";
import type {
  SchoolAnnouncementListFilter,
  SchoolAnnouncementListItem,
} from "@/modules/school/domain/types/schoolAnnouncements.types";

const FILTER_TABS: SchoolAnnouncementListFilter[] = ["all", "Published", "Scheduled", "Draft"];

function buildPages(currentPage: number, totalPages: number): number[] {
  if (totalPages <= 0) return [1];
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, start + 4);
  const adjustedStart = Math.max(1, end - 4);
  return Array.from({ length: end - adjustedStart + 1 }, (_, index) => adjustedStart + index);
}

export function SchoolAnnouncementsDashboard() {
  const t = useTranslations("school.dashboard");
  const locale = useLocale();
  const router = useRouter();

  const kpisQuery = useSchoolAnnouncementsKpis();
  const dashboardQuery = useSchoolDashboard();
  const list = useSchoolAnnouncementsList();
  const { remove } = useSchoolAnnouncementMutations();
  const [pendingDelete, setPendingDelete] = useState<SchoolAnnouncementListItem | null>(null);

  const page = list.page;
  const pages = useMemo(
    () => buildPages(list.pageNumber, page?.totalPages ?? 1),
    [list.pageNumber, page?.totalPages],
  );

  const summary = useMemo(() => {
    if (!page || page.totalCount === 0) return null;
    const from = (page.currentPage - 1) * page.pageSize + 1;
    const to = Math.min(page.currentPage * page.pageSize, page.totalCount);
    return { from, to, total: page.totalCount };
  }, [page]);

  const filterOptions = useMemo(
    () =>
      FILTER_TABS.map((tab) => ({
        id: tab,
        label: t(`listPage.filters.tabs.${tab === "all" ? "all" : tab.toLowerCase()}`),
      })),
    [t],
  );

  const columns = useMemo<DashboardDataTableColumn<SchoolAnnouncementListItem>[]>(
    () => [
      {
        id: "title",
        header: t("listPage.table.columns.title"),
        renderCell: (item) => (
          <div className="flex min-w-[14rem] items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#DCE6F5] text-[#2C4260]">
              <Megaphone className="h-4 w-4" />
            </span>
            <span className="font-bold text-slate-800">{item.title}</span>
          </div>
        ),
      },
      {
        id: "audience",
        header: t("listPage.table.columns.audience"),
        renderCell: (item) => (
          <span className="text-sm text-slate-600">
            {audienceText(t, item.audience, item.audienceLabel)}
          </span>
        ),
      },
      {
        id: "status",
        header: t("listPage.table.columns.status"),
        renderCell: (item) => (
          <SchoolStatusBadge tone={item.statusTone} label={item.statusLabel} />
        ),
      },
      {
        id: "date",
        header: t("listPage.table.columns.date"),
        renderCell: (item) => (
          <span className="text-sm text-slate-500">
            {item.date ? formatDate(item.date, locale) : "—"}
          </span>
        ),
      },
      {
        id: "reach",
        header: t("listPage.table.columns.reach"),
        renderCell: (item) => (
          <div className="flex min-w-[8rem] items-center gap-2">
            <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-100">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, item.reachPercentage)}%` }}
                transition={{ duration: 0.55, ease: "easeOut" }}
                className="h-full rounded-full bg-[#58CC02]"
              />
            </div>
            <span className="text-sm font-bold text-[#58CC02]">
              {formatNumber(item.reachPercentage, locale)}%
            </span>
          </div>
        ),
      },
    ],
    [locale, t],
  );

  const handleConfirmDelete = async () => {
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

  if ((kpisQuery.isLoading || list.isLoading) && !page) {
    return <SchoolAnnouncementsListSkeleton />;
  }

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title={t("listPage.title")}
        description={t("listPage.subtitle")}
        action={
          <Button
            asChild
            className="h-14 rounded-2xl bg-[#2C4260] px-6 text-base font-semibold text-white shadow-[var(--dashboard-shadow-button)] hover:bg-[#243751]"
          >
            <Link href={ROUTES.USER.SCHOOL.ANNOUNCEMENTS.CREATE}>
              <Plus className="h-5 w-5" />
              {t("listPage.createNew")}
            </Link>
          </Button>
        }
      />

      {kpisQuery.data ? <SchoolKpiCards kpis={kpisQuery.data} /> : null}

      <DashboardFiltersPanel isLoading={list.isFetching}>
        <DashboardSegmentedControl
          options={filterOptions}
          value={list.statusFilter}
          onChange={list.setStatusFilter}
        />
        <DashboardSearchFilter
          label={t("listPage.filters.openFilter")}
          value={list.search}
          onChange={list.setSearch}
          placeholder={t("listPage.filters.searchPlaceholder")}
        />
      </DashboardFiltersPanel>

      <DashboardTableCard
        className={list.isFetching ? "opacity-60 transition-opacity" : undefined}
        footer={
          summary ? (
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-slate-500">
                {t("listPage.pagination.summary", {
                  from: summary.from,
                  to: summary.to,
                  total: formatNumber(summary.total, locale),
                })}
              </p>
              <DashboardPagination
                pages={pages}
                currentPage={list.pageNumber}
                onPageChange={list.setPageNumber}
                previousLabel={t("listPage.pagination.previous")}
                nextLabel={t("listPage.pagination.next")}
              />
            </div>
          ) : null
        }
      >
        <DashboardDataTable
          rows={page?.items ?? []}
          columns={columns}
          getRowKey={(item) => item.id}
          emptyMessage={
            list.isError ? t("listPage.table.loadError") : t("listPage.table.empty")
          }
          actionsHeader={t("listPage.table.columns.actions")}
          renderActions={(item) => (
            <div className="flex items-center justify-end gap-1">
              {item.canView ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="rounded-xl text-slate-500"
                  onClick={() =>
                    router.push(ROUTES.USER.SCHOOL.ANNOUNCEMENTS.VIEW(item.id))
                  }
                  aria-label={t("listPage.table.actions.view")}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              ) : null}
              {item.canEdit ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="rounded-xl text-slate-500"
                  onClick={() =>
                    router.push(ROUTES.USER.SCHOOL.ANNOUNCEMENTS.EDIT(item.id))
                  }
                  aria-label={t("listPage.table.actions.edit")}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              ) : null}
              {item.canDelete ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="rounded-xl text-red-500 hover:text-red-600"
                  onClick={() => setPendingDelete(item)}
                  aria-label={t("listPage.table.actions.delete")}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              ) : null}
            </div>
          )}
        />
      </DashboardTableCard>

      {dashboardQuery.data?.tips || dashboardQuery.data?.smartRecommendations ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_1.6fr]">
          {dashboardQuery.data.tips ? (
            <DashboardInsightCard
              title={dashboardQuery.data.tips.title}
              description={dashboardQuery.data.tips.body}
              icon={Lightbulb}
              actionLabel={
                dashboardQuery.data.tips.actionUrl
                  ? dashboardQuery.data.tips.actionLabel
                  : undefined
              }
              onAction={
                dashboardQuery.data.tips.actionUrl
                  ? () => router.push(dashboardQuery.data!.tips!.actionUrl!)
                  : undefined
              }
            />
          ) : null}

          {dashboardQuery.data.smartRecommendations ? (
            <DashboardInsightCard
              variant="primary"
              title={dashboardQuery.data.smartRecommendations.title}
              description={dashboardQuery.data.smartRecommendations.body}
              icon={Megaphone}
              actionLabel={
                dashboardQuery.data.smartRecommendations.actionUrl
                  ? dashboardQuery.data.smartRecommendations.actionLabel
                  : undefined
              }
              onAction={
                dashboardQuery.data.smartRecommendations.actionUrl
                  ? () => router.push(dashboardQuery.data!.smartRecommendations!.actionUrl!)
                  : undefined
              }
            />
          ) : null}
        </div>
      ) : null}

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
              onClick={() => void handleConfirmDelete()}
              className="rounded-xl bg-red-600 text-white hover:bg-red-700"
            >
              {t("listPage.delete.confirm")}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={() => setPendingDelete(null)}
            >
              {t("listPage.delete.cancel")}
            </Button>
          </div>
        </div>
      </ModalShell>
    </div>
  );
}
