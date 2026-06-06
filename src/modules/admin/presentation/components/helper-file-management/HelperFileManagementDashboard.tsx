"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { Eye, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  deleteResourceFile,
  getResourceFiles,
  type ResourceFileListItem,
} from "@/modules/admin/infrastructure/api/resourceFileApi";
import { ContentFileDeleteModal } from "@/modules/admin/presentation/components/content-management/ContentFileDeleteModal";
import { HelperFileManagementAnimatedSection } from "./HelperFileManagementAnimatedSection";
import { HelperFileManagementDashboardSkeleton } from "./HelperFileManagementDashboardSkeleton";
import {
  HelperFileManagementFilterBar,
  type HelperFileManagementFilterState,
} from "./HelperFileManagementFilterBar";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { notify } from "@/shared/application/lib/toast";
import { ResourceFileType } from "@/shared/domain/enums/cms.enums";
import {
  DashboardBadge,
  DashboardDataTable,
  type DashboardDataTableColumn,
  DashboardPageHeader,
  DashboardPagination,
  DashboardTableCard,
} from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";
import { Skeleton } from "@/shared/presentation/components/ui/skeleton";

const PAGE_SIZE = 10;
const routeConfig = ROUTES.ADMIN.HELPER_FILE_MANAGEMENT;

const DEFAULT_FILTERS: HelperFileManagementFilterState = {
  stationId: "all",
  courseId: "all",
  resourceFileType: "all",
  keyword: "",
};

export function HelperFileManagementDashboard() {
  const t = useTranslations("admin.dashboard.contentManagement");
  const router = useRouter();
  const [rows, setRows] = useState<ResourceFileListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<HelperFileManagementFilterState>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<ResourceFileListItem | null>(null);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  const loadRows = useCallback(async () => {
    setLoading(true);
    const result = await getResourceFiles({
      ...(filters.stationId !== "all" ? { stationId: filters.stationId } : {}),
      ...(filters.courseId !== "all" ? { courseId: filters.courseId } : {}),
      ...(filters.resourceFileType !== "all"
        ? { resourceFileType: Number(filters.resourceFileType) as ResourceFileType }
        : {}),
      ...(filters.keyword.trim() ? { keyword: filters.keyword.trim() } : {}),
      pageNumber: page,
      pageSize: PAGE_SIZE,
    });

    if (result.errorMessage || !result.data) {
      notify.error(result.errorMessage ?? t("page.loadError"));
      setRows([]);
      setTotalItems(0);
      setTotalPages(1);
    } else {
      setRows(result.data.items);
      setTotalItems(result.data.totalItems);
      setTotalPages(result.data.totalPages);
    }
    setLoading(false);
    setHasLoadedOnce(true);
  }, [filters, page, t]);

  useEffect(() => {
    void loadRows();
  }, [loadRows]);

  useEffect(() => {
    setPage(1);
  }, [filters.stationId, filters.courseId, filters.resourceFileType, filters.keyword]);

  const pageCount = Math.max(1, totalPages);
  const currentPage = Math.min(page, pageCount);

  useEffect(() => {
    if (page > pageCount) {
      setPage(pageCount);
    }
  }, [page, pageCount]);
  const isInitialLoading = loading && !hasLoadedOnce;

  const resolveAccessPolicyLabel = (value: string) => {
    const normalized = value.trim().toLowerCase();
    if (normalized === "0" || normalized === "all" || normalized.includes("public")) {
      return t("policy.public");
    }
    if (normalized === "1" || normalized.includes("subscriber")) {
      return t("policy.subscribersOnly");
    }
    return value || "—";
  };

  const resolveResourceFileTypeLabel = (value: string) => {
    const normalized = value.trim();
    if (normalized === "0" || normalized.toLowerCase().includes("station")) {
      return t("filters.resourceFileType.station");
    }
    if (normalized === "1" || normalized.toLowerCase().includes("course")) {
      return t("filters.resourceFileType.course");
    }
    return value || "—";
  };

  const formatDate = (iso: string) => {
    if (!iso) return "—";
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return iso;
    return date.toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const tableColumns = useMemo<Array<DashboardDataTableColumn<ResourceFileListItem>>>(
    () => [
      {
        id: "fileName",
        header: t("table.columns.fileName"),
        renderCell: (row) => (
          <div className="space-y-1 text-right">
            <p className="font-semibold text-slate-800">{row.fileName}</p>
            <p className="text-xs text-slate-400">{row.fileType || "—"}</p>
          </div>
        ),
      },
      {
        id: "course",
        header: t("table.columns.course"),
        renderCell: (row) => row.courseTitle || "—",
      },
      {
        id: "station",
        header: t("table.columns.station"),
        renderCell: (row) => row.stationName || "—",
      },
      {
        id: "policy",
        header: t("table.columns.policy"),
        renderCell: (row) => (
          <DashboardBadge
            tone={
              resolveAccessPolicyLabel(row.accessPolicy).includes(t("policy.subscribersOnly"))
                ? "warning"
                : "success"
            }
          >
            {resolveAccessPolicyLabel(row.accessPolicy)}
          </DashboardBadge>
        ),
      },
      {
        id: "resourceFileType",
        header: t("table.columns.resourceFileType"),
        renderCell: (row) => resolveResourceFileTypeLabel(row.resourceFileType),
      },
      {
        id: "createdAt",
        header: t("table.columns.createdAt"),
        cellClassName: "text-sm text-slate-500",
        renderCell: (row) => formatDate(row.createdAt),
      },
    ],
    [t],
  );

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const result = await deleteResourceFile(deleteTarget.id);
    if (result.errorMessage) {
      notify.error(result.errorMessage);
      return;
    }
    notify.success(t("table.deleteSuccess"));
    setDeleteTarget(null);
    void loadRows();
  };

  const header = (
    <DashboardPageHeader
      title={t("page.title")}
      description={t("page.description")}
      breadcrumbs={[
        { label: t("breadcrumbs.home"), href: ROUTES.ADMIN.HOME },
        { label: t("breadcrumbs.content") },
      ]}
      action={
        <Button
          type="button"
          className="dashboard-raised-button h-14 rounded-2xl bg-[var(--dashboard-primary)] px-6 text-base font-semibold text-white hover:bg-[var(--dashboard-primary)]"
          style={{ boxShadow: "var(--dashboard-shadow-button)" }}
          onClick={() => router.push(routeConfig.ADD)}
        >
          <Plus className="h-5 w-5" aria-hidden />
          {t("page.addFile")}
        </Button>
      }
    />
  );

  if (isInitialLoading) {
    return (
      <section className="space-y-8">
        {header}
        <HelperFileManagementDashboardSkeleton />
      </section>
    );
  }

  return (
    <section className="space-y-8">
      {header}

      <HelperFileManagementAnimatedSection delay={0.06}>
        <HelperFileManagementFilterBar value={filters} onChange={setFilters} />
      </HelperFileManagementAnimatedSection>

      <HelperFileManagementAnimatedSection delay={0.14}>
        <DashboardTableCard
          title={t("table.title")}
          footer={
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <p className="text-right text-sm text-slate-400">
                {t("table.pagination.summary", {
                  visible: rows.length,
                  total: totalItems,
                })}
              </p>
              <DashboardPagination
                pages={Array.from({ length: pageCount }, (_, i) => i + 1)}
                currentPage={currentPage}
                previousLabel={t("table.pagination.previous")}
                nextLabel={t("table.pagination.next")}
                onPageChange={setPage}
              />
            </div>
          }
        >
          {loading ? (
            <div className="space-y-3 px-4 py-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={`helper-file-table-row-${index}`} className="h-14 w-full rounded-xl" />
              ))}
            </div>
          ) : (
            <DashboardDataTable
              rows={rows}
              columns={tableColumns}
              getRowKey={(row) => row.id}
              emptyMessage={t("table.empty")}
              // onRowClick={(row) => router.push(routeConfig.VIEW(row.id))}
              rowClassName="hover:bg-slate-50/80"
              actionsHeader={t("table.columns.actions")}
              renderActions={(row) => (
                <div className="flex items-center gap-2">
                  <IconActionButton
                    label={t("table.actions.view")}
                    onClick={() => router.push(routeConfig.VIEW(row.id))}
                  >
                    <Eye className="h-4 w-4" />
                  </IconActionButton>
                  <IconActionButton
                    label={t("table.actions.delete")}
                    danger
                    onClick={() => setDeleteTarget(row)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </IconActionButton>
                </div>
              )}
            />
          )}
        </DashboardTableCard>
      </HelperFileManagementAnimatedSection>

      <ContentFileDeleteModal
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title={t("deleteModal.title")}
        description={t("deleteModal.description", { fileName: deleteTarget?.fileName ?? "" })}
        confirmLabel={t("deleteModal.confirm")}
        cancelLabel={t("deleteModal.cancel")}
        onConfirm={handleDelete}
      />
    </section>
  );
}

interface IconActionButtonProps {
  children: ReactNode;
  label: string;
  danger?: boolean;
  onClick: () => void;
}

function IconActionButton({ children, label, danger = false, onClick }: IconActionButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      className={[
        "flex h-8 w-8 items-center justify-center rounded-lg border transition-colors",
        danger
          ? "border-red-100 text-[#FF4B4B] hover:bg-red-50"
          : "border-slate-200 text-slate-500 hover:bg-slate-100",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
