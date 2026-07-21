"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Download, EllipsisVertical, FileSpreadsheet, KeyRound } from "lucide-react";
import AddSchoolIcon from "@/modules/admin/presentation/assets/icons/AddSchool.svg";
import { IconComp } from "@/modules/admin/presentation/assets/icons/IconComp";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {DashboardBadge,
  DashboardDataTable,
  type DashboardDataTableColumn,
  DashboardInsightCard,
  DashboardPageHeader,
  DashboardPagination,
  DashboardStatCard,
  DashboardTableCard,
  DashboardBreadcrumb,} from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";
import { Skeleton } from "@/shared/presentation/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/presentation/components/ui/tooltip";
import { useSchoolsTable } from "@/modules/admin/application/hooks/useSchoolsTable";
import { schoolManagementDashboardData } from "@/modules/admin/domain/data/schoolManagementDashboardData";
import {
  deleteSchool,
  exportSchools,
  getSchoolKpis,
  sendSchoolCredentials,
  updateSchoolStatus,
  type SchoolKpis,
  type SchoolTableRow,
} from "@/modules/admin/infrastructure/api/schoolApi";
import { ChatGroupDeleteModal } from "@/modules/admin/presentation/components/chat-groups";
import { SchoolManagementFilterBar } from "@/modules/admin/presentation/components/school-management";
import { notify } from "@/shared/application/lib/toast";
import { AUTH_ROUTES } from "@/modules/auth/config/routes";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { StatusSwitch } from "@/shared/presentation/components/ui/StatusSwitch";
import { cn } from "@/shared/application/lib/cn";

function performanceTone(
  status: "excellent" | "veryGood" | "good" | "neutral",
) {
  switch (status) {
    case "excellent":
      return "success" as const;
    case "veryGood":
      return "info" as const;
    case "good":
      return "primary" as const;
    default:
      return "neutral" as const;
  }
}

function TableState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center gap-3 px-6 py-12 text-center">
      <h3 className="text-xl font-semibold text-slate-800">{title}</h3>
      <p className="max-w-md text-sm leading-7 text-slate-500">{description}</p>
      {action}
    </div>
  );
}

function TableLoadingState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-4 p-6">
      <div className="space-y-1 text-right">
        <h3 className="text-lg font-semibold text-slate-700">{title}</h3>
        <p className="text-sm text-slate-400">{description}</p>
      </div>
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="grid grid-cols-8 gap-4">
          {Array.from({ length: 8 }).map((__, cellIndex) => (
            <Skeleton key={cellIndex} className="h-12 rounded-xl" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SchoolManagementDashboard() {
  const t = useTranslations("admin.dashboard");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const refreshKey = searchParams.get("refresh");
  const data = schoolManagementDashboardData;
  const schoolsTable = useSchoolsTable();
  const responseStatus = schoolsTable.data?.status ?? "Success";
  const page = schoolsTable.page;
  const [kpis, setKpis] = useState<SchoolKpis | null>(null);
  const [menuOpenSchoolId, setMenuOpenSchoolId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SchoolTableRow | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [pendingStatusId, setPendingStatusId] = useState<string | null>(null);
  const [pendingCredentialsId, setPendingCredentialsId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleToggleStatus = useCallback(
    async (row: SchoolTableRow, isActive: boolean) => {
      setPendingStatusId(row.id);
      const result = await updateSchoolStatus(row.id, isActive);
      setPendingStatusId(null);
      if (result.errorMessage) {
        notify.error(result.errorMessage);
        return;
      }
      notify.success(
        result.message ?? t("schoolManagement.table.statusUpdateSuccess"),
      );
      await schoolsTable.refetch();
      const kpiResult = await getSchoolKpis();
      if (kpiResult.data) setKpis(kpiResult.data);
    },
    [schoolsTable.refetch, t],
  );
  const schoolTableColumns = useMemo<Array<DashboardDataTableColumn<any>>>(
    () => [
      {
        id: "school",
        header: t("schoolManagement.table.columns.school"),
        renderCell: (row) => (
          <div className="flex min-w-[15rem] items-center justify-start gap-3">
            {row.logoUrl ? (
              <img
                src={row.logoUrl}
                alt=""
                className="h-11 w-11 rounded-xl object-cover"
              />
            ) : (
              <div className="text-3xl" aria-hidden>{row.flag}</div>
            )}
            <div className="space-y-1 text-right">
              <p className="font-semibold text-slate-800">{row.schoolName}</p>
              <p className="text-xs text-slate-400">
                {[row.city, row.address, row.country].filter(Boolean).join(" · ")}
              </p>
            </div>
          </div>
        ),
      },
      {
        id: "coordinator",
        header: t("schoolManagement.table.columns.coordinator"),
        cellClassName: "font-medium text-slate-600",
        renderCell: (row) => row.coordinatorName || "—",
      },
      {
        id: "students",
        header: t("schoolManagement.table.columns.students"),
        cellClassName: "font-medium text-slate-600",
        renderCell: (row) => row.studentCount,
      },
      {
        id: "points",
        header: t("schoolManagement.table.columns.points"),
        cellClassName: "font-bold text-slate-700",
        renderCell: (row) => row.totalPoints,
      },
      {
        id: "rank",
        header: t("schoolManagement.table.columns.rank"),
        renderCell: (row) => (
          row.ranking ? (
            <DashboardBadge tone={row.ranking === 1 ? "gold" : "primary"}>
              {row.ranking}
            </DashboardBadge>
          ) : (
            <span className="text-slate-400">—</span>
          )
        ),
      },
      {
        id: "performance",
        header: t("schoolManagement.table.columns.performance"),
        renderCell: (row) => (
          <DashboardBadge tone={performanceTone(row.performanceStatus)}>
            {row.performance}
          </DashboardBadge>
        ),
      },
      {
        id: "foundedAt",
        header: t("schoolManagement.table.columns.foundedAt"),
        cellClassName: "text-slate-500",
        renderCell: (row) => row.foundedAt,
      },
      {
        id: "status",
        header: t("schoolManagement.table.columns.status"),
        renderCell: (row) => (
          <StatusSwitch
            checked={row.isActive}
            disabled={pendingStatusId === row.id}
            activeLabel={t("schoolManagement.status.active")}
            inactiveLabel={t("schoolManagement.status.inactive")}
            activeClassName="bg-emerald-500"
            onChange={(isActive) => void handleToggleStatus(row, isActive)}
          />
        ),
      },
    ],
    [handleToggleStatus, pendingStatusId, t],
  );

  const formatKpiValue = useCallback(
    (statId: string) => {
      if (!kpis) {
        return data.stats.find((s) => s.id === statId)?.value ?? "—";
      }
      const n =
        statId === "totalSchools"
          ? kpis.totalSchools
          : statId === "activeSchools"
            ? kpis.activeSchools
            : statId === "totalTeachers"
              ? kpis.totalTeachers
              : statId === "totalStudents"
                ? kpis.totalStudents
                : null;
      if (n === null) return "—";
      return new Intl.NumberFormat(locale).format(n);
    },
    [data.stats, kpis, locale],
  );

  const statCards = useMemo(
    () =>
      data.stats.map((stat) => ({
        ...stat,
        value: formatKpiValue(stat.id),
      })),
    [data.stats, formatKpiValue],
  );

  const loadKpis = useCallback(async () => {
    const result = await getSchoolKpis();
    if (result.data) {
      setKpis(result.data);
    } else if (result.errorMessage) {
      notify.error(result.errorMessage);
    }
  }, []);

  useEffect(() => {
    void loadKpis();
  }, [loadKpis, refreshKey]);

  useEffect(() => {
    if (!refreshKey) return;
    schoolsTable.setPageNumber(1);
    void schoolsTable.refetch();
  }, [refreshKey, schoolsTable.refetch, schoolsTable.setPageNumber]);

  useEffect(() => {
    if (!menuOpenSchoolId) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest("[data-school-row-menu]")) return;
      setMenuOpenSchoolId(null);
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [menuOpenSchoolId]);

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    const schoolId = deleteTarget.id;
    setDeleteTarget(null);
    setPendingDeleteId(schoolId);

    const result = await deleteSchool(schoolId);
    setPendingDeleteId(null);

    if (result.errorMessage) {
      notify.error(result.errorMessage);
      return;
    }

    notify.success(result.message ?? t("schoolManagement.deleteModal.success"));
    setMenuOpenSchoolId(null);
    await Promise.all([schoolsTable.refetch(), loadKpis()]);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportSchools({
        keyword: schoolsTable.queryParams.keyword,
        city: schoolsTable.queryParams.city,
        country: schoolsTable.queryParams.country,
        performanceLevel: schoolsTable.queryParams.performanceLevel,
        status: schoolsTable.queryParams.status,
      });
    } catch (error) {
      notify.error(
        error instanceof Error
          ? error.message
          : t("schoolManagement.table.exportError"),
      );
    } finally {
      setIsExporting(false);
    }
  };

  const handleSendCredentials = async (row: SchoolTableRow) => {
    setPendingCredentialsId(row.id);
    const result = await sendSchoolCredentials(row.id);
    setPendingCredentialsId(null);
    if (result.errorMessage) {
      notify.error(result.errorMessage);
      return;
    }
    notify.success(
      result.message ?? t("schoolManagement.table.credentialsSuccess"),
    );
    setMenuOpenSchoolId(null);
  };

  return (
    <div className="space-y-8">
            <div className="space-y-2">
        <DashboardBreadcrumb items={[
          { label: t("tabs.home.title") },
          { label: t("schoolManagement.page.title") },
        ]} />
        <DashboardPageHeader
        title={t("schoolManagement.page.title")}
        description={t("schoolManagement.page.description")}
        action={
          <Button
            type="button"
            className="h-14 rounded-2xl bg-[#2C4260] px-6 text-base font-semibold text-white hover:bg-[#243751] cursor-pointer shadow-[var(--dashboard-shadow-button)]"
            onClick={() => {
              router.push(ROUTES.ADMIN.SCHOOL_MANAGEMENT.ADD);
            }}
          >
            <IconComp src={AddSchoolIcon} alt="Add School" width={22} height={22} aria-hidden />
            {t("schoolManagement.page.addSchool")}
          </Button>
        }
      />
      </div>

      <section className="grid gap-5 lg:grid-cols-4">
        {statCards.map((stat) => (
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

      <SchoolManagementFilterBar
        value={schoolsTable.filters}
        onChange={schoolsTable.setFilters}
      />

      <DashboardTableCard
        title={t("schoolManagement.table.title")}
        actions={
          <>
            <Button
              type="button"
              variant="outline"
              disabled={isExporting}
              onClick={() => void handleExport()}
            >
              <Download className="h-4 w-4" aria-hidden />
              {t("schoolManagement.table.actions.export")}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(ROUTES.ADMIN.SCHOOL_MANAGEMENT.IMPORT)}
            >
              <FileSpreadsheet className="h-4 w-4" aria-hidden />
              {t("schoolManagement.table.actions.import")}
            </Button>
          </>
        }
        className={schoolsTable.isRefetching ? "opacity-60 transition-opacity" : undefined}
        footer={
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <p className="text-right text-sm text-slate-400">
              {t("schoolManagement.table.pagination.summary", {
                visible: page?.rows.length ?? 0,
                total: page?.totalItems ?? 0,
              })}
            </p>
            <DashboardPagination
              pages={schoolsTable.pages}
              currentPage={page?.currentPage ?? schoolsTable.pageNumber}
              previousLabel={t("schoolManagement.table.pagination.previous")}
              nextLabel={t("schoolManagement.table.pagination.next")}
              onPageChange={schoolsTable.setPageNumber}
            />
          </div>
        }
      >
        {schoolsTable.isLoading && !page ? (
          <TableLoadingState
            title={t("schoolManagement.table.states.loading.title")}
            description={t("schoolManagement.table.states.loading.description")}
          />
        ) : responseStatus === "Unauthorized" ? (
          <TableState
            title={t("schoolManagement.table.states.unauthorized.title")}
            description={t("schoolManagement.table.states.unauthorized.description")}
            action={
              <Button type="button" onClick={() => router.push(AUTH_ROUTES.LOGIN)}>
                {t("schoolManagement.table.states.actions.goToLogin")}
              </Button>
            }
          />
        ) : responseStatus === "Forbidden" ? (
          <TableState
            title={t("schoolManagement.table.states.forbidden.title")}
            description={t("schoolManagement.table.states.forbidden.description")}
          />
        ) : responseStatus === "NotFound" || (responseStatus === "Success" && (page?.rows.length ?? 0) === 0) ? (
          <TableState
            title={t("schoolManagement.table.states.empty.title")}
            description={t("schoolManagement.table.states.empty.description")}
          />
        ) : responseStatus === "BadRequest" || responseStatus === "Conflict" || responseStatus === "Error" || !page ? (
          <TableState
            title={t("schoolManagement.table.states.error.title")}
            description={
              schoolsTable.data?.errorMessage ||
              t("schoolManagement.table.states.error.description")
            }
            action={
              <Button type="button" onClick={() => void schoolsTable.refetch()}>
                {t("schoolManagement.table.states.actions.retry")}
              </Button>
            }
          />
        ) : (
          <DashboardDataTable
            rows={page.rows}
            columns={schoolTableColumns}
            getRowKey={(row) => row.id}
            emptyMessage="—"
            rowClassName="hover:bg-slate-50/80"
            actionsHeader={t("schoolManagement.table.columns.actions")}
            renderActions={(row) => (
              <div className="relative flex items-center justify-end gap-1" data-school-row-menu>
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        disabled={pendingCredentialsId === row.id}
                        className={cn(
                          "rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700",
                          pendingCredentialsId === row.id && "opacity-50",
                        )}
                        aria-label={t("schoolManagement.table.actions.sendCredentials")}
                        onClick={(event) => {
                          event.stopPropagation();
                          void handleSendCredentials(row);
                        }}
                      >
                        <KeyRound className="h-5 w-5" aria-hidden />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      {t("schoolManagement.table.actions.sendCredentialsTooltip")}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <button
                  type="button"
                  className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                  aria-label={t("schoolManagement.table.actions.more")}
                  onClick={(event) => {
                    event.stopPropagation();
                    setMenuOpenSchoolId((current) => (current === row.id ? null : row.id));
                  }}
                >
                  <EllipsisVertical className="h-5 w-5" aria-hidden />
                </button>
                {menuOpenSchoolId === row.id ? (
                  <div
                    className="absolute z-[9999] left-0 top-10 min-w-[9rem] rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_14px_36px_rgba(15,23,42,0.12)]"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <button
                      type="button"
                      className="w-full rounded-xl px-3 py-2 text-right text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                      onClick={() => {
                        setMenuOpenSchoolId(null);
                        router.push(ROUTES.ADMIN.SCHOOL_MANAGEMENT.EDIT(row.id));
                      }}
                    >
                      {t("schoolManagement.table.actions.edit")}
                    </button>
                    <button
                      type="button"
                      disabled={pendingDeleteId === row.id}
                      className="w-full rounded-xl px-3 py-2 text-right text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50"
                      onClick={() => {
                        setMenuOpenSchoolId(null);
                        setDeleteTarget(row);
                      }}
                    >
                      {t("schoolManagement.table.actions.delete")}
                    </button>
                  </div>
                ) : null}
              </div>
            )}
          />
        )}
      </DashboardTableCard>

      <ChatGroupDeleteModal
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        groupName={deleteTarget?.schoolName}
        title={t("schoolManagement.deleteModal.title")}
        description={t("schoolManagement.deleteModal.description")}
        confirmLabel={t("schoolManagement.deleteModal.confirm")}
        cancelLabel={t("schoolManagement.deleteModal.cancel")}
        onConfirm={() => void handleConfirmDelete()}
      />

      {/* <section className="grid gap-6 xl:grid-cols-2">
        <DashboardInsightCard
          title={t(data.insights.updates.titleKey)}
          description={t(data.insights.updates.descriptionKey)}
          actionLabel={t(data.insights.updates.actionLabelKey)}
          variant={data.insights.updates.variant}
          floatingIcon={data.insights.updates.floatingIcon}
        />
        <DashboardInsightCard
          title={t(data.insights.supervisorTip.titleKey)}
          description={t(data.insights.supervisorTip.descriptionKey)}
          actionLabel={t(data.insights.supervisorTip.actionLabelKey)}
          icon={data.insights.supervisorTip.icon}
          variant={data.insights.supervisorTip.variant}
        />
      </section> */}
    </div>
  );
}
