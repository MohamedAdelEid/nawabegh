"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Layers, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { bundlesDashboardStats } from "@/modules/admin/domain/data/bundlesDashboardData";
import {
  DEFAULT_BUNDLE_MANAGEMENT_FILTERS,
  type BundleManagementFilterState,
} from "@/modules/admin/domain/types/bundleManagement.types";
import {
  deleteBundle,
  getBundleStats,
  getBundlesPage,
  publishBundle,
  unpublishBundle,
  updateBundleStatus,
  type BundleAdminListItem,
  type BundleAdminStats,
} from "@/modules/admin/infrastructure/api/bundlesApi";
import { ContentFileDeleteModal } from "@/modules/admin/presentation/components/content-management/ContentFileDeleteModal";
import { BundleManagementFilterBar } from "./BundleManagementFilterBar";
import { BundleManagementRowActions } from "./BundleManagementRowActions";
import { notify } from "@/shared/application/lib/toast";
import { formatAccessDuration } from "@/shared/application/lib/accessDuration";
import { ROUTES } from "@/shared/infrastructure/config/routes";
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

const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;

function toUtcStartOfDay(dateStr: string): string | undefined {
  if (!dateStr.trim()) return undefined;
  const date = new Date(`${dateStr}T00:00:00`);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function toUtcEndOfDay(dateStr: string): string | undefined {
  if (!dateStr.trim()) return undefined;
  const date = new Date(`${dateStr}T23:59:59.999`);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function parseOptionalPrice(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function hasActiveFilters(filters: BundleManagementFilterState): boolean {
  return (
    filters.keyword.trim() !== "" ||
    filters.status !== "all" ||
    filters.createdFrom !== "" ||
    filters.createdTo !== "" ||
    filters.minPrice !== DEFAULT_BUNDLE_MANAGEMENT_FILTERS.minPrice ||
    filters.maxPrice !== DEFAULT_BUNDLE_MANAGEMENT_FILTERS.maxPrice
  );
}

function formatBundleDate(value: string | null, locale: string): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatPrice(value: number): string {
  return value.toFixed(2);
}

export function BundleManagementDashboard() {
  const t = useTranslations("admin.dashboard.bundleManagement");
  const tAccess = useTranslations("admin.dashboard.bundleManagement.accessDuration");
  const locale = useLocale();
  const router = useRouter();

  const [stats, setStats] = useState<BundleAdminStats | null>(null);
  const [rows, setRows] = useState<BundleAdminListItem[]>([]);
  const [filters, setFilters] = useState<BundleManagementFilterState>(DEFAULT_BUNDLE_MANAGEMENT_FILTERS);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZE_OPTIONS)[number]>(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingRows, setLoadingRows] = useState(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<BundleAdminListItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadStats = useCallback(async () => {
    setLoadingStats(true);
    const result = await getBundleStats();
    if (result.data) {
      setStats(result.data);
    } else if (result.errorMessage) {
      notify.error(result.errorMessage);
    }
    setLoadingStats(false);
  }, []);

  const loadRows = useCallback(async () => {
    setLoadingRows(true);
    const filtersActive = hasActiveFilters(filters);
    const result = await getBundlesPage(
      {
        keyword: filters.keyword,
        ...(filters.status !== "all" ? { status: Number(filters.status) as 0 | 1 } : {}),
        createdFromUtc: toUtcStartOfDay(filters.createdFrom),
        createdToUtc: toUtcEndOfDay(filters.createdTo),
        minPrice: parseOptionalPrice(filters.minPrice),
        maxPrice: parseOptionalPrice(filters.maxPrice),
        pageNumber: page,
        pageSize,
      },
      { fallbackTotalItems: filtersActive ? undefined : stats?.totalBundles },
    );

    if (result.errorMessage || !result.data) {
      notify.error(result.errorMessage ?? t("table.states.error"));
      setRows([]);
      setTotalItems(0);
      setTotalPages(1);
    } else {
      setRows(result.data.items);
      setTotalItems(result.data.totalItems);
      setTotalPages(Math.max(1, result.data.totalPages));
    }
    setLoadingRows(false);
    setHasLoadedOnce(true);
  }, [filters, page, pageSize, stats?.totalBundles, t]);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  useEffect(() => {
    void loadRows();
  }, [loadRows]);

  useEffect(() => {
    setPage(1);
  }, [filters, pageSize]);

  const refreshAll = useCallback(async () => {
    await Promise.all([loadStats(), loadRows()]);
  }, [loadStats, loadRows]);

  const statCards = useMemo(
    () =>
      bundlesDashboardStats.map((stat) => {
        let value = "—";
        if (stats) {
          switch (stat.id) {
            case "totalBundles":
              value = new Intl.NumberFormat(locale).format(stats.totalBundles);
              break;
            case "activeBundles":
              value = new Intl.NumberFormat(locale).format(stats.activeBundles);
              break;
            case "inactiveBundles":
              value = new Intl.NumberFormat(locale).format(stats.inactiveBundles);
              break;
            case "averageCompletion":
              value = `${Math.round(stats.averageCompletionPercent)}%`;
              break;
          }
        }

        return {
          ...stat,
          value,
          indicator: "indicatorKey" in stat && stat.indicatorKey ? t(stat.indicatorKey) : undefined,
          indicatorClassName: "indicatorClassName" in stat ? stat.indicatorClassName : undefined,
        };
      }),
    [locale, stats, t],
  );

  const handleRowAction = useCallback(
    async (action: () => Promise<{ errorMessage?: string }>, successMessage: string) => {
      const result = await action();
      if (result.errorMessage) {
        notify.error(result.errorMessage);
        return;
      }
      notify.success(successMessage);
      await refreshAll();
    },
    [refreshAll],
  );

  const handleDelete = async () => {
    if (!deleteTarget || isDeleting) return;
    setIsDeleting(true);
    try {
      const result = await deleteBundle(deleteTarget.id);
      if (result.errorMessage || !result.data) {
        notify.error(result.errorMessage ?? t("deleteModal.error"));
        return;
      }
      notify.success(t("deleteModal.success"));
      setDeleteTarget(null);
      await refreshAll();
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = useMemo<Array<DashboardDataTableColumn<BundleAdminListItem>>>(
    () => [
      {
        id: "name",
        header: t("table.columns.name"),
        renderCell: (row) => (
          <div className="flex min-w-[14rem] items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EEF2FF] text-[#2C4260]">
              <Layers className="h-5 w-5" aria-hidden />
            </div>
            <p className="font-semibold text-slate-800">{row.name}</p>
          </div>
        ),
      },
      {
        id: "courses",
        header: t("table.columns.courses"),
        cellClassName: "text-slate-600",
        renderCell: (row) => t("table.coursesCount", { count: row.courseCount }),
      },
      {
        id: "price",
        header: t("table.columns.price"),
        renderCell: (row) => (
          <span className="font-semibold text-slate-700">
            {t("table.priceValue", { price: formatPrice(row.bundlePrice) })}
          </span>
        ),
      },
      {
        id: "accessDuration",
        header: t("table.columns.accessDuration"),
        cellClassName: "text-slate-600",
        renderCell: (row) =>
          formatAccessDuration(row.accessDurationDays, {
            lifetime: () => tAccess("lifetime"),
            oneYear: () => tAccess("oneYear"),
            years: (count) => tAccess("years", { count }),
            thirtyDays: () => tAccess("thirtyDays"),
            days: (count) => tAccess("days", { count }),
          }),
      },
      {
        id: "status",
        header: t("table.columns.status"),
        renderCell: (row) => (
          <DashboardBadge tone={row.status === 0 ? "success" : "danger"} withDot>
            {t(`statuses.${row.status === 0 ? "active" : "inactive"}`)}
          </DashboardBadge>
        ),
      },
      {
        id: "published",
        header: t("table.columns.published"),
        renderCell: (row) => (
          <DashboardBadge tone={row.isPublished ? "info" : "neutral"}>
            {t(`publishedStatuses.${row.isPublished ? "published" : "draft"}`)}
          </DashboardBadge>
        ),
      },
      {
        id: "createdAt",
        header: t("table.columns.createdAt"),
        cellClassName: "text-slate-500",
        renderCell: (row) => formatBundleDate(row.createdAt, locale),
      },
      {
        id: "actions",
        header: t("table.columns.actions"),
        renderCell: (row) => (
          <BundleManagementRowActions
            row={row}
            labels={{
              edit: t("actions.edit"),
              publish: t("actions.publish"),
              unpublish: t("actions.unpublish"),
              activate: t("actions.activate"),
              deactivate: t("actions.deactivate"),
              delete: t("actions.delete"),
              more: t("actions.more"),
            }}
            onEdit={(bundleId) => router.push(ROUTES.ADMIN.BUNDLES.EDIT(bundleId))}
            onPublish={(bundleId) =>
              void handleRowAction(() => publishBundle(bundleId), t("messages.publishSuccess"))
            }
            onUnpublish={(bundleId) =>
              void handleRowAction(() => unpublishBundle(bundleId), t("messages.unpublishSuccess"))
            }
            onActivate={(bundleId) =>
              void handleRowAction(
                () => updateBundleStatus(bundleId, 0),
                t("messages.activateSuccess"),
              )
            }
            onDeactivate={(bundleId) =>
              void handleRowAction(
                () => updateBundleStatus(bundleId, 1),
                t("messages.deactivateSuccess"),
              )
            }
            onDelete={setDeleteTarget}
          />
        ),
      },
    ],
    [handleRowAction, locale, router, t],
  );

  const from = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalItems);
  const isInitialLoading = loadingRows && !hasLoadedOnce;

  return (
    <section className="space-y-8">
      <DashboardPageHeader
        title={t("page.title")}
        description={t("page.description")}
        breadcrumbs={[
          { label: t("breadcrumbs.home"), href: ROUTES.ADMIN.HOME },
          { label: t("breadcrumbs.bundles") },
        ]}
        action={
          <Button
            type="button"
            className="h-12 gap-2 rounded-2xl bg-[#C7AF6E] px-5 text-base font-bold text-white shadow-[0px_4px_0px_0px_#A89354] hover:bg-[#B9A064]"
            onClick={() => router.push(ROUTES.ADMIN.BUNDLES.CREATE)}
          >
            <Plus className="h-5 w-5" aria-hidden />
            {t("page.createBundle")}
          </Button>
        }
      />

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat) => (
          <div key={stat.id} className="flex h-full flex-col gap-3">
            <DashboardStatCard
              className="h-full flex-1"
              label={t(stat.labelKey)}
              value={loadingStats ? "…" : stat.value}
              indicator={stat.indicator}
              indicatorClassName={stat.indicatorClassName}
              icon={stat.icon}
              iconTone={stat.iconTone}
            />
            <div className="h-2 shrink-0 overflow-hidden rounded-full bg-slate-100">
              {"showProgress" in stat && stat.showProgress && stats ? (
                <div
                  className="h-full rounded-full bg-[#C7AF6E] transition-all"
                  style={{ width: `${Math.min(100, Math.max(0, stats.averageCompletionPercent))}%` }}
                />
              ) : null}
            </div>
          </div>
        ))}
      </div>

      <BundleManagementFilterBar
        value={filters}
        onChange={setFilters}
        onReset={() => setPage(1)}
      />

      <DashboardTableCard
        title={t("table.title")}
        footer={
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-2 text-right sm:flex-row sm:items-center sm:gap-4">
              <p className="text-sm text-slate-400">
                {t("table.pagination.summary", { from, to, total: totalItems })}
              </p>
              <label className="flex items-center gap-2 text-sm text-slate-500">
                <select
                  value={pageSize}
                  onChange={(event) =>
                    setPageSize(Number(event.target.value) as (typeof PAGE_SIZE_OPTIONS)[number])
                  }
                  className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm"
                >
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <option key={size} value={size}>
                      {t("table.pagination.pageSize", { size })}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <DashboardPagination
              pages={Array.from({ length: totalPages }, (_, index) => index + 1)}
              currentPage={page}
              previousLabel={t("table.pagination.previous")}
              nextLabel={t("table.pagination.next")}
              onPageChange={setPage}
            />
          </div>
        }
      >
        {isInitialLoading ? (
          <div className="space-y-3 px-4 py-12">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        ) : (
          <DashboardDataTable
            rows={rows}
            columns={columns}
            getRowKey={(row) => row.id}
            emptyMessage={t("table.states.empty")}
            tableClassName="w-full min-w-[980px] text-right"
          />
        )}
      </DashboardTableCard>

      <ContentFileDeleteModal
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title={t("deleteModal.title")}
        description={t("deleteModal.description", { name: deleteTarget?.name ?? "" })}
        confirmLabel={t("deleteModal.confirm")}
        cancelLabel={t("deleteModal.cancel")}
        onConfirm={handleDelete}
      />
    </section>
  );
}
