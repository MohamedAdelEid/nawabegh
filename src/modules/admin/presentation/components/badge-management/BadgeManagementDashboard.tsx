"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Award,
  BadgeCheck,
  Eye,
  Medal,
  Pencil,
  Plus,
  RefreshCw,
  Star,
  Trash2,
  Users,
} from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import {
  ADMIN_ACHIEVEMENT_BADGES_TABLE_QUERY_KEY,
  useAchievementBadgesTable,
} from "@/modules/admin/application/hooks/useAchievementBadgesTable";
import type {
  AchievementBadgeAnalytics,
  AchievementBadgeRow,
} from "@/modules/admin/domain/types/achievementBadges.types";
import {
  createAchievementBadge,
  deleteAchievementBadge,
  getAchievementBadgeAnalytics,
  recalculateAchievementBadges,
  toggleAchievementBadge,
  updateAchievementBadge,
} from "@/modules/admin/infrastructure/api/achievementBadgesApi";
import {
  BadgeDeleteConfirmModal,
  BadgeDetailModal,
  BadgeFormModal,
  type BadgeFormValues,
  BadgeManagementDashboardSkeleton,
  BadgeManagementFilterBar,
} from "@/modules/admin/presentation/components/badge-management";
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
import { StatusSwitch } from "@/shared/presentation/components/ui/StatusSwitch";
import { Skeleton } from "@/shared/presentation/components/ui/skeleton";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { resolveFileUrl } from "@/shared/infrastructure/files/fileUrl";

const STAT_ICONS = {
  totalBadges: Award,
  activeBadges: BadgeCheck,
  totalEarners: Users,
  mostEarned: Medal,
  averagePoints: Star,
} as const;

const STAT_TONES = {
  totalBadges: "primary",
  activeBadges: "success",
  totalEarners: "info",
  mostEarned: "warning",
  averagePoints: "neutral",
} as const;

export function BadgeManagementDashboard() {
  const t = useTranslations("admin.dashboard.badgeManagement");
  const locale = useLocale();
  const queryClient = useQueryClient();
  const badgesTable = useAchievementBadgesTable();
  const page = badgesTable.page;
  const responseStatus = badgesTable.data?.status ?? "Success";

  const [analytics, setAnalytics] = useState<AchievementBadgeAnalytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AchievementBadgeRow | null>(null);
  const [viewTarget, setViewTarget] = useState<AchievementBadgeRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AchievementBadgeRow | null>(null);
  const [recalculateOpen, setRecalculateOpen] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const loadAnalytics = useCallback(async () => {
    setAnalyticsLoading(true);
    const result = await getAchievementBadgeAnalytics();
    if (result.data) setAnalytics(result.data);
    else if (result.errorMessage) notify.error(result.errorMessage);
    setAnalyticsLoading(false);
  }, []);

  useEffect(() => {
    void loadAnalytics();
  }, [loadAnalytics]);

  useEffect(() => {
    if (!hasLoadedOnce && !badgesTable.isLoading && badgesTable.page) {
      setHasLoadedOnce(true);
    }
  }, [badgesTable.isLoading, badgesTable.page, hasLoadedOnce]);

  const invalidateAll = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: [ADMIN_ACHIEVEMENT_BADGES_TABLE_QUERY_KEY] }),
      loadAnalytics(),
    ]);
  }, [loadAnalytics, queryClient]);

  const formatDate = useCallback(
    (iso: string) => {
      if (!iso) return "—";
      const date = new Date(iso);
      if (Number.isNaN(date.getTime())) return iso;
      return date.toLocaleDateString(locale, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    },
    [locale],
  );

  const mostEarnedBadge = useMemo(() => {
    if (!analytics?.byBadge.length) return null;
    return analytics.byBadge.reduce((best, current) =>
      current.earnedCount > best.earnedCount ? current : best,
    );
  }, [analytics]);

  const averagePoints = useMemo(() => {
    if (!analytics?.byBadge.length) return null;
    const sum = analytics.byBadge.reduce((acc, row) => acc + row.requiredPoints, 0);
    return Math.round(sum / analytics.byBadge.length);
  }, [analytics]);

  const totalBadgesCount = badgesTable.rawPage?.totalItems ?? analytics?.byBadge.length ?? 0;

  const statCards = useMemo(
    () =>
      (["totalBadges", "activeBadges", "totalEarners", "mostEarned", "averagePoints"] as const).map(
        (id) => {
          let value = "—";
          if (id === "totalBadges" && totalBadgesCount) {
            value = new Intl.NumberFormat(locale).format(totalBadgesCount);
          } else if (id === "activeBadges" && analytics) {
            value = new Intl.NumberFormat(locale).format(analytics.totalBadgesActive);
          } else if (id === "totalEarners" && analytics) {
            value = new Intl.NumberFormat(locale).format(analytics.totalBadgesAwarded);
          } else if (id === "mostEarned" && mostEarnedBadge) {
            value = mostEarnedBadge.name;
          } else if (id === "averagePoints" && averagePoints != null) {
            value = new Intl.NumberFormat(locale).format(averagePoints);
          }

          return {
            id,
            label: t(`stats.${id}.label`),
            value,
            indicator: t(`stats.${id}.indicatorStatic`),
            icon: STAT_ICONS[id],
            iconTone: STAT_TONES[id],
          };
        },
      ),
    [analytics, averagePoints, locale, mostEarnedBadge, t, totalBadgesCount],
  );

  const handleToggle = useCallback(
    async (row: AchievementBadgeRow) => {
      setTogglingId(row.id);
      const result = await toggleAchievementBadge(row.id);
      setTogglingId(null);

      if (result.errorMessage) {
        notify.error(result.errorMessage ?? t("toggle.error"));
        return;
      }

      notify.success(result.message ?? t("toggle.success"));
      await invalidateAll();
    },
    [invalidateAll, t],
  );

  const columns = useMemo<Array<DashboardDataTableColumn<AchievementBadgeRow>>>(
    () => [
      {
        id: "icon",
        header: t("table.columns.icon"),
        renderCell: (row) => {
          const iconUrl = row.iconUrl ? resolveFileUrl(row.iconUrl) : null;
          return (
            <div className="relative mx-auto flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-slate-100">
              {iconUrl ? (
                <Image src={iconUrl} alt="" fill unoptimized className="object-contain p-1.5" />
              ) : (
                <Award className="h-5 w-5 text-slate-300" aria-hidden />
              )}
            </div>
          );
        },
      },
      {
        id: "name",
        header: t("table.columns.name"),
        renderCell: (row) => (
          <div className="space-y-0.5 text-right">
            <p className="font-semibold text-slate-800">{row.name}</p>
            <p className="line-clamp-1 text-xs text-slate-400">{row.description}</p>
          </div>
        ),
      },
      {
        id: "status",
        header: t("table.columns.status"),
        renderCell: (row) => (
          <DashboardBadge tone={row.isActive ? "success" : "neutral"} withDot>
            {t(`table.statuses.${row.isActive ? "active" : "inactive"}`)}
          </DashboardBadge>
        ),
      },
      {
        id: "toggle",
        header: t("table.columns.toggle"),
        renderCell: (row) => (
          <StatusSwitch
            checked={row.isActive}
            onChange={() => void handleToggle(row)}
            activeLabel={t("table.statuses.active")}
            inactiveLabel={t("table.statuses.inactive")}
            disabled={togglingId === row.id}
            activeClassName="bg-emerald-500"
          />
        ),
      },
      {
        id: "points",
        header: t("table.columns.points"),
        cellClassName: "font-semibold text-slate-700",
        renderCell: (row) => new Intl.NumberFormat(locale).format(row.requiredPoints),
      },
      {
        id: "createdAt",
        header: t("table.columns.createdAt"),
        cellClassName: "text-slate-500",
        renderCell: (row) => formatDate(row.createdAt),
      },
    ],
    [formatDate, handleToggle, locale, t, togglingId],
  );

  const handleFormSubmit = async (values: BadgeFormValues): Promise<boolean> => {
    const name = values.name.trim();
    const description = values.description.trim();
    const requiredPoints = Number(values.requiredPoints.replace(/\D/g, ""));

    if (!name) {
      notify.error(t("form.validation.nameRequired"));
      return false;
    }
    if (!description) {
      notify.error(t("form.validation.descriptionRequired"));
      return false;
    }
    if (!values.iconUrl.trim()) {
      notify.error(t("form.validation.iconRequired"));
      return false;
    }
    if (!Number.isFinite(requiredPoints) || requiredPoints < 0) {
      notify.error(t("form.validation.pointsRequired"));
      return false;
    }

    setIsSaving(true);
    const payload = {
      name,
      description,
      iconUrl: values.iconUrl,
      requiredPoints,
    };

    const result =
      formMode === "create"
        ? await createAchievementBadge(payload)
        : await updateAchievementBadge(editTarget!.id, payload);

    if (result.errorMessage) {
      setIsSaving(false);
      notify.error(result.errorMessage);
      return false;
    }

    const badgeId = result.data?.id ?? editTarget?.id;
    const shouldBeActive = values.isActive;
    const wasActive = formMode === "edit" ? editTarget!.isActive : true;

    if (badgeId && shouldBeActive !== wasActive) {
      const toggleResult = await toggleAchievementBadge(badgeId);
      if (toggleResult.errorMessage) {
        setIsSaving(false);
        notify.error(toggleResult.errorMessage);
        return false;
      }
    }

    setIsSaving(false);

    notify.success(
      result.message ??
        (formMode === "create" ? t("form.createSuccess") : t("form.updateSuccess")),
    );
    setEditTarget(null);
    await invalidateAll();
    return true;
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const result = await deleteAchievementBadge(deleteTarget.id);
    setIsDeleting(false);
    setDeleteTarget(null);

    if (result.errorMessage) {
      notify.error(result.errorMessage);
      return;
    }

    notify.success(result.message ?? t("deleteModal.success"));
    await invalidateAll();
  };

  const handleRecalculate = async () => {
    setIsRecalculating(true);
    const result = await recalculateAchievementBadges();
    setIsRecalculating(false);
    setRecalculateOpen(false);

    if (result.errorMessage) {
      notify.error(result.errorMessage ?? t("recalculate.error"));
      return;
    }

    notify.success(result.message ?? t("recalculate.success"));
    await invalidateAll();
  };

  if (!hasLoadedOnce && badgesTable.isLoading) {
    return <BadgeManagementDashboardSkeleton />;
  }

  return (
    <div className="space-y-8">
      <DashboardPageHeader
        title={t("page.title")}
        description={t("page.description")}
        breadcrumbs={[
          { label: t("breadcrumbs.home"), href: ROUTES.ADMIN.HOME },
          { label: t("breadcrumbs.forum") },
          { label: t("breadcrumbs.community") },
          { label: t("page.title") },
        ]}
        action={
          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="outline"
              className="h-14 rounded-2xl border-slate-200 px-5"
              disabled={isRecalculating}
              onClick={() => setRecalculateOpen(true)}
            >
              <RefreshCw className="ms-2 h-5 w-5" aria-hidden />
              {t("page.recalculate")}
            </Button>
            <Button
              type="button"
              className="h-14 rounded-2xl bg-[#2C4260] px-6 text-base font-semibold text-white shadow-[var(--dashboard-shadow-button)] hover:bg-[#243751]"
              onClick={() => {
                setFormMode("create");
                setEditTarget(null);
                setFormOpen(true);
              }}
            >
              <Plus className="ms-2 h-5 w-5" aria-hidden />
              {t("page.createBadge")}
            </Button>
          </div>
        }
      />

      <section className="grid gap-5 lg:grid-cols-5">
        {statCards.map((stat) =>
          analyticsLoading && stat.id !== "totalBadges" ? (
            <Skeleton key={stat.id} className="h-32 rounded-[1.75rem]" />
          ) : (
            <DashboardStatCard
              key={stat.id}
              label={stat.label}
              value={stat.value}
              indicator={stat.indicator}
              icon={stat.icon}
              iconTone={stat.iconTone}
            />
          ),
        )}
      </section>

      <BadgeManagementFilterBar
        value={badgesTable.filters}
        onChange={badgesTable.setFilters}
        onApply={() => void badgesTable.refetch()}
      />

      <DashboardTableCard
        title={t("table.title")}
        className={badgesTable.isRefetching ? "opacity-60 transition-opacity" : undefined}
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
              pages={badgesTable.pages}
              currentPage={page?.currentPage ?? badgesTable.pageNumber}
              previousLabel={t("table.pagination.previous")}
              nextLabel={t("table.pagination.next")}
              onPageChange={badgesTable.setPageNumber}
            />
          </div>
        }
      >
        {badgesTable.isLoading && !page ? (
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
            <Button type="button" onClick={() => void badgesTable.refetch()}>
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
                  onClick={() => setViewTarget(row)}
                >
                  <Eye className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  aria-label={t("table.actions.edit")}
                  onClick={() => {
                    setFormMode("edit");
                    setEditTarget(row);
                    setFormOpen(true);
                  }}
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

      <BadgeFormModal
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditTarget(null);
        }}
        mode={formMode}
        initial={editTarget}
        onSubmit={handleFormSubmit}
        loading={isSaving}
      />

      <BadgeDetailModal
        open={viewTarget !== null}
        onOpenChange={(open) => {
          if (!open) setViewTarget(null);
        }}
        badge={viewTarget}
      />

      <BadgeDeleteConfirmModal
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        itemName={deleteTarget?.name}
        title={t("deleteModal.title")}
        description={t("deleteModal.description")}
        confirmLabel={t("deleteModal.confirm")}
        cancelLabel={t("deleteModal.cancel")}
        onConfirm={() => void handleConfirmDelete()}
        isConfirming={isDeleting}
      />

      <BadgeDeleteConfirmModal
        open={recalculateOpen}
        onOpenChange={setRecalculateOpen}
        title={t("recalculate.confirmTitle")}
        description={t("recalculate.confirmDescription")}
        confirmLabel={t("recalculate.confirm")}
        cancelLabel={t("recalculate.cancel")}
        onConfirm={() => void handleRecalculate()}
        isConfirming={isRecalculating}
      />
    </div>
  );
}
