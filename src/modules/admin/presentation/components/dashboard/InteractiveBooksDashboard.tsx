"use client";

import { useEffect, useMemo, useState } from "react";
import { Pencil, Plus, SlidersHorizontal, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useFormatter, useTranslations } from "next-intl";
import { interactiveBooksDashboardData } from "@/modules/admin/domain/data/interactiveBooksDashboardData";
import type { InteractiveBookTableRow } from "@/modules/admin/domain/data/interactiveBooksDashboardData";
import { getInteractiveBooks } from "@/modules/admin/infrastructure/api/interactiveBooksApi";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { notify } from "@/shared/application/lib/toast";
import { InteractiveBooksFilterModal } from "@/modules/admin/presentation/components/interactive-books";
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
function statusTone(statusId: "published" | "draft") {
  return statusId === "published" ? "success" : "warning";
}

export function InteractiveBooksDashboard() {
  const t = useTranslations("admin.dashboard");
  const formatter = useFormatter();
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const [rows, setRows] = useState<InteractiveBookTableRow[]>([]);
  const [loadState, setLoadState] = useState<"idle" | "loading" | "success" | "error">("idle");

  useEffect(() => {
    let alive = true;
    const load = async () => {
      setLoadState("loading");
      const result = await getInteractiveBooks();
      if (!alive) return;
      if (result.errorMessage) {
        setLoadState("error");
        setRows([]);
        notify.error(result.errorMessage ?? t("interactiveBooks.table.loadError"));
        return;
      }
      setRows(result.data ?? []);
      setLoadState("success");
      setCurrentPage(1);
    };
    void load();
    return () => {
      alive = false;
    };
  }, []);

  const computedStats = useMemo(() => {
    return interactiveBooksDashboardData.stats.map((stat) => {
      if (stat.id === "totalBooks" && loadState === "success") {
        return { ...stat, value: String(rows.length) };
      }
      return stat;
    });
  }, [loadState, rows.length]);

  const totalItems = rows.length;
  const visibleItems = rows.length;
  const totalPages = Math.max(1, totalItems > 0 ? 1 : 1);
  const pageNumbers = useMemo(() => Array.from({ length: totalPages }, (_, i) => i + 1), [totalPages]);

  const formatCreatedAt = (iso: string) => {
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return formatter.dateTime(d, { dateStyle: "medium", timeStyle: "short" });
  };

  const tableColumns = useMemo<Array<DashboardDataTableColumn<InteractiveBookTableRow>>>(
    () => [
      {
        id: "name",
        header: t("interactiveBooks.table.columns.name"),
        renderCell: (row) => (
          <div className="space-y-1 text-right">
            <p className="font-semibold text-slate-800">{row.title}</p>
            <p className="text-xs text-slate-400">ID: {row.id}</p>
          </div>
        ),
      },
      {
        id: "subject",
        header: t("interactiveBooks.table.columns.subject"),
        cellClassName: "max-w-[14rem] truncate",
        renderCell: (row) => (
          <span title={row.courseTitle}>{row.courseTitle}</span>
        ),
      },
      {
        id: "grade",
        header: t("interactiveBooks.table.columns.grade"),
        renderCell: (row) => row.gradeName,
      },
      {
        id: "pages",
        header: t("interactiveBooks.table.columns.pages"),
        cellClassName: "font-semibold text-slate-700",
        renderCell: (row) => row.pageCount,
      },
      {
        id: "hotspots",
        header: t("interactiveBooks.table.columns.hotspots"),
        renderCell: (row) => (
          <DashboardBadge tone="primary">
            {row.activeHotspotCount} / {row.hotspotCount}
          </DashboardBadge>
        ),
      },
      {
        id: "views",
        header: t("interactiveBooks.table.columns.views"),
        cellClassName: "font-semibold text-slate-400",
        renderCell: () => "—",
      },
      {
        id: "status",
        header: t("interactiveBooks.table.columns.status"),
        renderCell: (row) => (
          <DashboardBadge tone={statusTone(row.statusId)} withDot>
            {t(`interactiveBooks.table.status.${row.statusId}`)}
          </DashboardBadge>
        ),
      },
      {
        id: "createdAt",
        header: t("interactiveBooks.table.columns.createdAt"),
        cellClassName: "text-slate-500",
        renderCell: (row) => formatCreatedAt(row.createdAt),
      },
    ],
    [t, formatter],
  );

  return (
    <div className="space-y-8">
      <DashboardPageHeader
        title={t("interactiveBooks.page.title")}
        breadcrumbs={[
          { label: t("tabs.home.title"), href: ROUTES.ADMIN.HOME },
          { label: t("tabs.interactiveBooks.title") },
        ]}
        description={t("interactiveBooks.page.description")}
        action={
          <Button
            type="button"
            className="dashboard-raised-button h-14 cursor-pointer rounded-2xl bg-[var(--dashboard-primary)] px-6 text-base font-semibold text-white hover:bg-[var(--dashboard-primary)]"
            style={{ boxShadow: "var(--dashboard-shadow-button)" }}
            onClick={() => router.push(ROUTES.ADMIN.INTERACTIVE_BOOKS.MANAGE)}
          >
            <Plus className="h-5 w-5" aria-hidden />
            {t("interactiveBooks.page.addBook")}
          </Button>
        }
      />

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {computedStats.map((stat) => (
          <DashboardStatCard
            key={stat.id}
            label={t(stat.labelKey)}
            value={
              stat.id === "readingTime"
                ? t("interactiveBooks.stats.readingTime.value", {
                    value: stat.value,
                  })
                : stat.value
            }
            indicator={t(stat.indicatorKey)}
            indicatorClassName={stat.indicatorToneClassName}
            icon={stat.icon}
            iconTone={stat.iconTone}
          />
        ))}
      </section>

      <DashboardTableCard
        title={t("interactiveBooks.table.title")}
        actions={
          <Button
            type="button"
            variant="outline"
            className="rounded-2xl border-slate-200 px-5 text-slate-700"
            onClick={() => setFilterOpen(true)}
          >
            <SlidersHorizontal className="h-4 w-4" aria-hidden />
            {t("interactiveBooks.table.actions.openFilter")}
          </Button>
        }
        footer={
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <p className="text-right text-sm text-slate-400">
              {t("interactiveBooks.table.pagination.summary", {
                visible: loadState === "loading" ? 0 : visibleItems,
                total: loadState === "loading" ? 0 : totalItems,
              })}
            </p>
            <DashboardPagination
              pages={pageNumbers}
              currentPage={Math.min(currentPage, totalPages)}
              previousLabel={t("interactiveBooks.table.pagination.previous")}
              nextLabel={t("interactiveBooks.table.pagination.next")}
              onPageChange={setCurrentPage}
            />
          </div>
        }
      >
        {loadState === "loading" ? (
          <p className="px-6 py-12 text-center text-sm text-slate-500">{t("interactiveBooks.table.loading")}</p>
        ) : loadState === "error" ? (
          <p className="px-6 py-12 text-center text-sm text-red-600">{t("interactiveBooks.table.loadError")}</p>
        ) : (
          <DashboardDataTable
            rows={rows}
            columns={tableColumns}
            getRowKey={(row) => row.id}
            emptyMessage={t("interactiveBooks.table.empty")}
            rowClassName="hover:bg-slate-50/80"
            actionsHeader={t("interactiveBooks.table.columns.actions")}
            renderActions={(row) => (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="dashboard-icon-btn"
                  aria-label={t("interactiveBooks.table.actions.edit")}
                  onClick={() => {
                    if (!row.courseId) return;
                    router.push(ROUTES.ADMIN.INTERACTIVE_BOOKS.MANAGE_BY_COURSE(row.courseId));
                  }}
                  disabled={!row.courseId}
                >
                  <Pencil className="h-4 w-4" aria-hidden />
                </button>
                <button
                  type="button"
                  className="dashboard-icon-btn dashboard-icon-btn--danger"
                  aria-label={t("interactiveBooks.table.actions.delete")}
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                </button>
              </div>
            )}
          />
        )}
      </DashboardTableCard>

      <InteractiveBooksFilterModal open={filterOpen} onOpenChange={setFilterOpen} />
    </div>
  );
}
