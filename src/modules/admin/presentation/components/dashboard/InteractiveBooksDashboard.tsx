"use client";

import { useEffect, useMemo, useState } from "react";
import { BookOpenText, Clock3, NotebookText, Pencil, Plus, SlidersHorizontal, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useFormatter, useLocale } from "next-intl";
import { motion } from "framer-motion";
import { interactiveBooksDashboardData } from "@/modules/admin/domain/data/interactiveBooksDashboardData";
import type { InteractiveBookTableRow } from "@/modules/admin/domain/data/interactiveBooksDashboardData";
import { getInteractiveBooks, deleteInteractiveBook } from "@/modules/admin/infrastructure/api/interactiveBooksApi";
import { useScopedDashboardRoutes } from "@/shared/application/hooks/useScopedDashboardRoutes";
import { useScopedDashboardTranslations } from "@/shared/application/hooks/useScopedDashboardTranslations";
import { notify } from "@/shared/application/lib/toast";
import { resolveGradeLabel } from "@/shared/domain/utils/grade.utils";
import {
  InteractiveBooksFilterBar,
  type InteractiveBooksApiFilterState,
  InteractiveBooksDashboardSkeleton,
  InteractiveBooksFilterModal,
} from "@/modules/admin/presentation/components/interactive-books";
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

type SummaryStatValue = number | null;
type SummaryStats = Record<string, SummaryStatValue>;

type StatPresentation = {
  labelKey: string;
  icon: typeof NotebookText;
  iconTone: "primary" | "success" | "warning" | "info";
  valueFormatter?: (value: SummaryStatValue) => string;
};

const interactiveBooksSummaryStatConfig: Record<string, StatPresentation> = {
  totalInteractiveBooks: {
    labelKey: "interactiveBooks.stats.totalInteractiveBooks.label",
    icon: NotebookText,
    iconTone: "primary",
  },
  activeReadersToday: {
    labelKey: "interactiveBooks.stats.activeReadersToday.label",
    icon: BookOpenText,
    iconTone: "warning",
  },
  averageReadingMinutesPerStudent: {
    labelKey: "interactiveBooks.stats.averageReadingMinutesPerStudent.label",
    icon: Clock3,
    iconTone: "success",
    valueFormatter: (value) => String(value ?? 0),
  },
};

const INTERACTIVE_BOOKS_PAGE_SIZE = 50;
const INTERACTIVE_BOOKS_PAGE_SIZE_OPTIONS = [
  { id: "10", label: "10" },
  { id: "25", label: "25" },
  { id: "50", label: "50" },
  { id: "100", label: "100" },
] as const;

const fadeInUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.35, ease: "easeOut" as const },
  }),
};

function statusTone(statusId: "published" | "draft") {
  return statusId === "published" ? "success" : "warning";
}

export function InteractiveBooksDashboard() {
  const t = useScopedDashboardTranslations();
  const formatter = useFormatter();
  const locale = useLocale();
  const router = useRouter();
  const routes = useScopedDashboardRoutes();
  const isTeacherScope = routes.scope === "teacher";
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(INTERACTIVE_BOOKS_PAGE_SIZE);
  const [filterOpen, setFilterOpen] = useState(false);
  const [rows, setRows] = useState<InteractiveBookTableRow[]>([]);
  const [summaryStats, setSummaryStats] = useState<SummaryStats>({});
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });
  const [loadState, setLoadState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [deletingBookId, setDeletingBookId] = useState<string | null>(null);
  const [apiFilters, setApiFilters] = useState<InteractiveBooksApiFilterState>({
    courseId: "",
    gradeId: "",
    status: "all",
    hasHotspots: "all",
    fromDate: "",
    toDate: "",
    keyword: "",
    pageNumber: "1",
    pageSize: String(INTERACTIVE_BOOKS_PAGE_SIZE),
    acceptLanguage: "ar",
  });
  const [debouncedKeyword, setDebouncedKeyword] = useState("");

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedKeyword(apiFilters.keyword.trim());
    }, 300);
    return () => window.clearTimeout(timeoutId);
  }, [apiFilters.keyword]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    apiFilters.courseId,
    apiFilters.gradeId,
    apiFilters.status,
    apiFilters.hasHotspots,
    apiFilters.fromDate,
    apiFilters.toDate,
    debouncedKeyword,
  ]);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      setLoadState("loading");
      const result = await getInteractiveBooks({
        pageNumber: currentPage,
        pageSize,
        ...(apiFilters.courseId.trim() ? { courseId: apiFilters.courseId.trim() } : {}),
        ...(apiFilters.gradeId.trim() && !Number.isNaN(Number(apiFilters.gradeId))
          ? { gradeId: Number(apiFilters.gradeId) }
          : {}),
        ...(apiFilters.status !== "all" ? { status: Number(apiFilters.status) } : {}),
        ...(apiFilters.hasHotspots === "true"
          ? { hasHotspots: true }
          : apiFilters.hasHotspots === "false"
            ? { hasHotspots: false }
            : {}),
        ...(apiFilters.fromDate.trim() ? { fromDate: apiFilters.fromDate.trim() } : {}),
        ...(apiFilters.toDate.trim() ? { toDate: apiFilters.toDate.trim() } : {}),
        ...(debouncedKeyword ? { keyword: debouncedKeyword } : {}),
        ...(apiFilters.acceptLanguage.trim()
          ? { acceptLanguage: apiFilters.acceptLanguage.trim() }
          : {}),
      });
      if (!alive) return;
      if (result.errorMessage) {
        setLoadState("error");
        setRows([]);
        setSummaryStats({});
        notify.error(result.errorMessage ?? t("interactiveBooks.table.loadError"));
        return;
      }
      setRows(result.data?.rows ?? []);
      setSummaryStats(result.data?.summary ?? {});
      setPagination({
        currentPage: result.data?.currentPage ?? currentPage,
        totalPages: result.data?.totalPages ?? 1,
        totalItems: result.data?.totalItems ?? 0,
      });
      if (typeof result.data?.currentPage === "number" && result.data.currentPage !== currentPage) {
        setCurrentPage(result.data.currentPage);
      }
      setHasLoadedOnce(true);
      setLoadState("success");
    };
    void load();
    return () => {
      alive = false;
    };
  }, [
    currentPage,
    pageSize,
    apiFilters.courseId,
    apiFilters.gradeId,
    apiFilters.status,
    apiFilters.hasHotspots,
    apiFilters.fromDate,
    apiFilters.toDate,
    apiFilters.acceptLanguage,
    debouncedKeyword,
    t,
  ]);

  const computedStats = useMemo(() => {
    const fallbackStats = interactiveBooksDashboardData.stats;
    const summaryEntries = Object.entries(summaryStats).filter(
      ([key]) => !key.endsWith("TrendPercent"),
    );

    if (summaryEntries.length === 0) {
      return fallbackStats.map((stat) => {
        if (stat.id === "totalBooks" && loadState === "success") {
          return { ...stat, value: String(rows.length) };
        }
        return stat;
      });
    }

    return summaryEntries.map(([summaryKey, value]) => {
      const config = interactiveBooksSummaryStatConfig[summaryKey];
      const trendValue = summaryStats[`${summaryKey}TrendPercent`];
      const indicator =
        trendValue === null || typeof trendValue === "undefined"
          ? undefined
          : t("interactiveBooks.stats.trendPercent", { value: trendValue });

      if (config) {
        const formattedValue = config.valueFormatter ? config.valueFormatter(value) : String(value ?? 0);
        return {
          id: summaryKey,
          label: t(config.labelKey),
          value:
            summaryKey === "averageReadingMinutesPerStudent"
              ? t("interactiveBooks.stats.averageReadingMinutesPerStudent.value", {
                  value: formattedValue,
                })
              : formattedValue,
          indicator,
          indicatorToneClassName:
            typeof trendValue === "number" && trendValue >= 0 ? "text-emerald-500" : "text-rose-500",
          icon: config.icon,
          iconTone: config.iconTone,
        };
      }

      const fallbackLabel = summaryKey
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (char) => char.toUpperCase())
        .trim();

      return {
        id: summaryKey,
        label: fallbackLabel,
        value: String(value ?? 0),
        indicator,
        indicatorToneClassName:
          typeof trendValue === "number" && trendValue >= 0 ? "text-emerald-500" : "text-rose-500",
        icon: NotebookText,
        iconTone: "primary" as const,
      };
    });
  }, [loadState, rows.length, summaryStats, t]);

  const totalItems = pagination.totalItems;
  const visibleItems = rows.length;
  const totalPages = Math.max(1, pagination.totalPages);
  const pageNumbers = useMemo(() => Array.from({ length: totalPages }, (_, i) => i + 1), [totalPages]);

  const formatCreatedAt = (iso: string) => {
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return formatter.dateTime(d, { dateStyle: "medium", timeStyle: "short" });
  };

  const handleDeleteBook = async (row: InteractiveBookTableRow) => {
    if (deletingBookId) return;
    const confirmed = window.confirm(
      t("interactiveBooks.table.deleteConfirm", { title: row.title }),
    );
    if (!confirmed) return;

    setDeletingBookId(row.id);
    const result = await deleteInteractiveBook(row.id);
    setDeletingBookId(null);

    if (result.errorMessage || !result.data) {
      notify.error(result.errorMessage ?? t("interactiveBooks.table.deleteError"));
      return;
    }

    notify.success(result.message ?? t("interactiveBooks.table.deleteSuccess"));
    setRows((current) => current.filter((book) => book.id !== row.id));
    setPagination((current) => ({
      ...current,
      totalItems: Math.max(0, current.totalItems - 1),
    }));
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
        renderCell: (row) => resolveGradeLabel(locale, row, row.gradeName),
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
        renderCell: (row) => row.viewCount,
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
    [t, formatter, locale],
  );

  return (
    <div className="space-y-8">
      <DashboardPageHeader
        title={t("interactiveBooks.page.title")}
        breadcrumbs={[
          {
            label: isTeacherScope ? t("sidebar.nav.home") : t("tabs.home.title"),
            href: routes.home,
          },
          {
            label: isTeacherScope
              ? t("sidebar.nav.interactiveBooks")
              : t("tabs.interactiveBooks.title"),
          },
        ]}
        description={t("interactiveBooks.page.description")}
        action={
          <Button
            type="button"
            className="dashboard-raised-button h-14 cursor-pointer rounded-2xl bg-[var(--dashboard-primary)] px-6 text-base font-semibold text-white hover:bg-[var(--dashboard-primary)]"
            style={{ boxShadow: "var(--dashboard-shadow-button)" }}
            onClick={() => router.push(routes.interactiveBooks.MANAGE)}
          >
            <Plus className="h-5 w-5" aria-hidden />
            {t("interactiveBooks.page.addBook")}
          </Button>
        }
      />

      {loadState === "loading" && !hasLoadedOnce ? (
        <InteractiveBooksDashboardSkeleton />
      ) : (
        <>
          <motion.section
            className="grid gap-5 md:grid-cols-2 xl:grid-cols-3"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
          >
            {computedStats.map((stat, idx) => (
              <motion.div key={stat.id} custom={idx} variants={fadeInUp}>
                <DashboardStatCard
                  label={"label" in stat ? stat.label : t(stat.labelKey)}
                  value={stat.value}
                  indicator={"indicator" in stat ? stat.indicator : t(stat.indicatorKey)}
                  indicatorClassName={stat.indicatorToneClassName}
                  icon={stat.icon}
                  iconTone={stat.iconTone}
                />
              </motion.div>
            ))}
          </motion.section>
          <InteractiveBooksFilterBar value={apiFilters} onChange={setApiFilters} />

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className={loadState === "loading" ? "pointer-events-none opacity-60" : undefined}
          >
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
                      visible: visibleItems,
                      total: totalItems,
                    })}
                  </p>
                  <DashboardPagination
                    pages={pageNumbers}
                    currentPage={Math.min(pagination.currentPage, totalPages)}
                    previousLabel={t("interactiveBooks.table.pagination.previous")}
                    nextLabel={t("interactiveBooks.table.pagination.next")}
                    onPageChange={setCurrentPage}
                  />
                </div>
              }
            >
              {loadState === "error" ? (
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
                          router.push(routes.interactiveBooks.MANAGE_BY_COURSE(row.courseId));
                        }}
                        disabled={!row.courseId}
                      >
                        <Pencil className="h-4 w-4" aria-hidden />
                      </button>
                      <button
                        type="button"
                        className="dashboard-icon-btn dashboard-icon-btn--danger"
                        aria-label={t("interactiveBooks.table.actions.delete")}
                        disabled={deletingBookId === row.id}
                        onClick={() => void handleDeleteBook(row)}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden />
                      </button>
                    </div>
                  )}
                />
              )}
            </DashboardTableCard>
          </motion.div>
        </>
      )}

      <InteractiveBooksFilterModal open={filterOpen} onOpenChange={setFilterOpen} />
    </div>
  );
}
