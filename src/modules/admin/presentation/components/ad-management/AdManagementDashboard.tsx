"use client";

import { useCallback, useMemo, useState } from "react";
import { Eye, Megaphone, Pencil, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import {
  ADMIN_ADS_TABLE_QUERY_KEY,
  useAdsTable,
} from "@/modules/admin/application/hooks/useAdsTable";
import { adManagementDashboardData } from "@/modules/admin/domain/data/adManagementDashboardData";
import type { AdTableRow } from "@/modules/admin/domain/types/adManagement.types";
import { deleteAd, getAdKpis } from "@/modules/admin/infrastructure/api/adsApi";
import {
  AdDeleteConfirmModal,
  AdManagementFilterBar,
} from "@/modules/admin/presentation/components/ad-management";
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
import { notify } from "@/shared/application/lib/toast";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import type { AdKpis } from "@/modules/admin/domain/types/adManagement.types";

function statusTone(status: AdTableRow["status"]) {
  switch (status) {
    case "active":
      return "success" as const;
    case "scheduled":
      return "info" as const;
    case "expired":
      return "neutral" as const;
    case "paused":
      return "warning" as const;
    default:
      return "neutral" as const;
  }
}

function formatCompactNumber(value: number, locale: string): string {
  if (value >= 1000) {
    return new Intl.NumberFormat(locale, {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  }
  return new Intl.NumberFormat(locale).format(value);
}

export function AdManagementDashboard() {
  const t = useTranslations("admin.dashboard.adManagement");
  const locale = useLocale();
  const router = useRouter();
  const queryClient = useQueryClient();
  const adsTable = useAdsTable();
  const page = adsTable.page;
  const responseStatus = adsTable.data?.status ?? "Success";
  const [kpis, setKpis] = useState<AdKpis | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdTableRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // const loadKpis = useCallback(async () => {
  //   const result = await getAdKpis();
  //   if (result.data) setKpis(result.data);
  //   else if (result.errorMessage) notify.error(result.errorMessage);
  // }, []);

  // useEffect(() => {
  //   void loadKpis();
  // }, [loadKpis]);

  const formatKpi = useCallback(
    (statId: string) => {
      if (!kpis) return "—";
      switch (statId) {
        case "activeAds":
          return new Intl.NumberFormat(locale).format(kpis.activeAds);
        case "scheduledAds":
          return new Intl.NumberFormat(locale).format(kpis.scheduledAds);
        case "totalViews":
          return formatCompactNumber(kpis.totalViews, locale);
        case "engagementRate":
          return `${kpis.engagementRate.toFixed(1)}%`;
        default:
          return "—";
      }
    },
    [kpis, locale],
  );

  const formatIndicator = useCallback(
    (statId: string) => {
      if (!kpis) return t(`stats.${statId}.indicatorStatic`);
      if (statId === "activeAds" && kpis.activeAdsTrend != null) {
        return t("stats.activeAds.indicatorTrend", { value: kpis.activeAdsTrend });
      }
      if (statId === "totalViews" && kpis.totalViewsTrend != null) {
        return t("stats.totalViews.indicatorTrend", { value: kpis.totalViewsTrend });
      }
      if (statId === "engagementRate" && kpis.engagementRateTrend != null) {
        return t("stats.engagementRate.indicatorTrend", { value: kpis.engagementRateTrend });
      }
      return t(`stats.${statId}.indicatorStatic`);
    },
    [kpis, t],
  );

  // const statCards = useMemo(
  //   () =>
  //     adManagementDashboardData.stats.map((stat) => ({
  //       ...stat,
  //       value: formatKpi(stat.id),
  //       indicator: formatIndicator(stat.id),
  //     })),
  //   [formatIndicator, formatKpi],
  // );

  const columns = useMemo<Array<DashboardDataTableColumn<AdTableRow>>>(
    () => [
      {
        id: "ad",
        header: t("table.columns.ad"),
        renderCell: (row) => (
          <div className="flex min-w-[14rem] items-center gap-3">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-slate-100">
              {row.thumbnailUrl ? (
                <Image src={row.thumbnailUrl} alt="" fill className="object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-slate-300">
                  <Megaphone className="h-5 w-5" />
                </div>
              )}
            </div>
            <div className="space-y-0.5 text-right">
              <p className="font-semibold text-slate-800">{row.title}</p>
              <p className="text-xs text-slate-400">ID: {row.displayId}</p>
            </div>
          </div>
        ),
      },
      {
        id: "type",
        header: t("table.columns.type"),
        renderCell: (row) => (
          <span className="text-sm font-medium text-slate-600">{t(`types.${row.type}`)}</span>
        ),
      },
      {
        id: "audience",
        header: t("table.columns.audience"),
        renderCell: (row) => (
          <div className="flex flex-wrap justify-end gap-1">
            {row.audiences.map((audience) => (
              <DashboardBadge key={audience} tone="primary">
                {t(`audiences.${audience}`)}
              </DashboardBadge>
            ))}
          </div>
        ),
      },
      {
        id: "status",
        header: t("table.columns.status"),
        renderCell: (row) => (
          <DashboardBadge tone={statusTone(row.status)} withDot>
            {t(`statuses.${row.status}`)}
          </DashboardBadge>
        ),
      },
      {
        id: "date",
        header: t("table.columns.date"),
        cellClassName: "text-slate-500",
        renderCell: (row) => row.createdAt,
      },
      {
        id: "performance",
        header: t("table.columns.performance"),
        renderCell: (row) => (
          <div className="space-y-1 text-right text-sm">
            <p className="text-slate-500">
              {t("table.performance.views")}:{" "}
              <span className="font-semibold text-slate-700">
                {formatCompactNumber(row.views, locale)}
              </span>
            </p>
            <p className="text-slate-500">
              {t("table.performance.clicks")}:{" "}
              <span className="font-semibold text-slate-700">
                {formatCompactNumber(row.clicks, locale)}
              </span>
            </p>
          </div>
        ),
      },
    ],
    [locale, t],
  );

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const result = await deleteAd(deleteTarget.id);
    setIsDeleting(false);
    setDeleteTarget(null);

    if (result.errorMessage) {
      notify.error(result.errorMessage);
      return;
    }

    notify.success(result.message ?? t("deleteModal.success"));
    await queryClient.invalidateQueries({ queryKey: [ADMIN_ADS_TABLE_QUERY_KEY] });
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
            onClick={() => router.push(ROUTES.ADMIN.ADS.CREATE)}
          >
            <Plus className="ms-2 h-5 w-5" aria-hidden />
            {t("page.createAd")}
          </Button>
        }
      />

      {/* <section className="grid gap-5 lg:grid-cols-4">
        {statCards.map((stat) => (
          <DashboardStatCard
            key={stat.id}
            label={t(stat.labelKey)}
            value={stat.value}
            indicator={stat.indicator}
            indicatorClassName={stat.indicatorToneClassName}
            icon={stat.icon}
            iconTone={stat.iconTone}
          />
        ))}
      </section> */}

      <AdManagementFilterBar
        value={adsTable.filters}
        onChange={adsTable.setFilters}
        onApply={() => void adsTable.refetch()}
      />

      <DashboardTableCard
        title={t("table.title")}
        className={adsTable.isRefetching ? "opacity-60 transition-opacity" : undefined}
        footer={
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <p className="text-right text-sm text-slate-400">
              {t("table.pagination.summary", {
                from: page?.rows.length ? (page.currentPage - 1) * page.pageSize + 1 : 0,
                to: (page?.currentPage ?? 1) * (page?.pageSize ?? 10),
                total: page?.totalItems ?? 0,
              })}
            </p>
            <DashboardPagination
              pages={adsTable.pages}
              currentPage={page?.currentPage ?? adsTable.pageNumber}
              previousLabel={t("table.pagination.previous")}
              nextLabel={t("table.pagination.next")}
              onPageChange={adsTable.setPageNumber}
            />
          </div>
        }
      >
        {adsTable.isLoading && !page ? (
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
            <Button type="button" onClick={() => void adsTable.refetch()}>
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
              <div className="flex items-center justify-end gap-1">
                <button
                  type="button"
                  className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  aria-label={t("table.actions.view")}
                  onClick={() => router.push(ROUTES.ADMIN.ADS.VIEW(row.id))}
                >
                  <Eye className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  aria-label={t("table.actions.edit")}
                  onClick={() => router.push(ROUTES.ADMIN.ADS.EDIT(row.id))}
                >
                  <Pencil className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  className="rounded-xl p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                  aria-label={t("table.actions.delete")}
                  onClick={() => setDeleteTarget(row)}
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            )}
          />
        )}
      </DashboardTableCard>

      <AdDeleteConfirmModal
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        ad={deleteTarget}
        title={t("deleteModal.title")}
        description={t("deleteModal.description")}
        confirmLabel={t("deleteModal.confirm")}
        cancelLabel={t("deleteModal.cancel")}
        typeLabel={deleteTarget ? t(`types.${deleteTarget.type}`) : ""}
        audienceLabel={t("deleteModal.audienceLabel")}
        createdLabel={t("deleteModal.createdLabel")}
        onConfirm={() => void handleConfirmDelete()}
        isConfirming={isDeleting}
      />
    </div>
  );
}
