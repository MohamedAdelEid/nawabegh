"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import { Eye, Pause, Play, Plus, Settings, Trash2 } from "lucide-react";
import { ChatGroupDeleteModal } from "@/modules/admin/presentation/components/chat-groups";
import { chatGroupsDashboardData } from "@/modules/admin/domain/data/chatGroupsDashboardData";
import {
  getChatGroupByCourseId,
  updateChatGroupByCourseId,
} from "@/modules/admin/infrastructure/api/chatGroupsApi";
import { mapChatGroupDetailToFormValues, mapChatGroupFormToUpdatePayload } from "@/modules/admin/domain/utils/chatGroupMappers";
import type { ChatGroupRow } from "@/modules/admin/domain/types/chatGroups.types";
import {
  formatChatGroupStatValue,
  useTeacherChatGroups,
  type TeacherChatGroupsFilterState,
} from "@/modules/teacher/application/hooks/useTeacherChatGroups";
import { ChatGroupsDashboardSkeleton } from "@/modules/admin/presentation/components/dashboard/ChatGroupsDashboardSkeleton";
import Earth from "@/modules/admin/presentation/assets/icons/Earth";
import SearchPerson from "@/modules/admin/presentation/assets/icons/SearchPerson";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { notify } from "@/shared/application/lib/toast";
import {
  DashboardDataTable,
  DashboardFilterSelect,
  DashboardPageHeader,
  DashboardPagination,
  DashboardSearchFilter,
  DashboardStatCard,
  DashboardTableCard,
  type DashboardDataTableColumn,
  type DashboardFilterOption,
} from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";
import { Skeleton } from "@/shared/presentation/components/ui/skeleton";

const DEFAULT_FILTERS: TeacherChatGroupsFilterState = {
  status: "all",
  gradeId: "all",
  subjectId: "all",
  keyword: "",
};

const attachmentColors: Record<string, string> = {
  pdf: "bg-red-100 text-red-600",
  doc: "bg-blue-100 text-blue-600",
  xls: "bg-emerald-100 text-emerald-600",
  img: "bg-amber-100 text-amber-600",
};

export function TeacherChatGroupsDashboard() {
  const t = useTranslations("teacher.dashboard.chatGroups");
  const locale = useLocale();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState<TeacherChatGroupsFilterState>(DEFAULT_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<ChatGroupRow | null>(null);
  const [subjectOptions] = useState<DashboardFilterOption<string>[]>([
    { id: "all", label: t("filters.subjects.all") },
  ]);
  const [gradeOptions] = useState<DashboardFilterOption<string>[]>([
    { id: "all", label: t("filters.grades.all") },
  ]);

  const { stats: statConfig, filters: staticFilters } = chatGroupsDashboardData;
  const { rows, page, listQuery, statsQuery, statistics } = useTeacherChatGroups(
    filters,
    currentPage,
  );

  const totalPages = page?.totalPages ?? 1;
  const totalItems = page?.totalItems ?? 0;

  useEffect(() => {
    setCurrentPage(1);
  }, [filters.status, filters.gradeId, filters.subjectId, filters.keyword]);

  useEffect(() => {
    if (page && currentPage > totalPages) {
      setCurrentPage(Math.max(1, totalPages));
    }
  }, [currentPage, page, totalPages]);

  useEffect(() => {
    if (listQuery.error || statsQuery.error) {
      notify.error(t("table.states.error"));
    }
  }, [listQuery.error, statsQuery.error, t]);

  const statCards = useMemo(
    () =>
      statConfig.map((stat) => ({
        ...stat,
        value: formatChatGroupStatValue(stat.id, statistics, locale, stat.value),
      })),
    [locale, statConfig, statistics],
  );

  const invalidateChatQueries = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["admin-chat-groups"] }),
      queryClient.invalidateQueries({ queryKey: ["admin-chat-groups-statistics"] }),
    ]);
  }, [queryClient]);

  const handleTogglePause = useCallback(
    async (row: ChatGroupRow) => {
      const detailResult = await getChatGroupByCourseId(row.courseId || row.id);
      if (!detailResult.data) {
        notify.error(detailResult.errorMessage ?? t("table.states.error"));
        return;
      }

      const form = mapChatGroupDetailToFormValues(detailResult.data);
      const payload = mapChatGroupFormToUpdatePayload({ ...form, isLocked: !row.isLocked });
      const result = await updateChatGroupByCourseId(row.courseId || row.id, payload);

      if (!result.data) {
        notify.error(result.errorMessage ?? t("table.states.error"));
        return;
      }

      notify.success(t(row.isLocked ? "actions.resumed" : "actions.paused"));
      await invalidateChatQueries();
    },
    [invalidateChatQueries, t],
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    notify.success(t("delete.success"));
    setDeleteTarget(null);
    await invalidateChatQueries();
  }, [deleteTarget, invalidateChatQueries, t]);

  const isLoading = listQuery.isLoading || listQuery.isFetching;
  const isInitialLoading = listQuery.isLoading && !page;
  const isStatsLoading = statsQuery.isLoading;

  const columns = useMemo<DashboardDataTableColumn<ChatGroupRow>[]>(
    () => [
      {
        id: "groupName",
        header: t("table.columns.groupName"),
        headerClassName: "px-4 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500",
        cellClassName: "px-4 py-5",
        renderCell: (row) => (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 shrink-0 rounded-xl bg-slate-100" />
            <div className="space-y-0.5 text-right">
              <p className="font-semibold text-slate-800">{row.groupName}</p>
              <p className="text-xs text-slate-400">{row.courseSubtitle}</p>
            </div>
          </div>
        ),
      },
      {
        id: "studentCount",
        header: t("table.columns.studentCount"),
        headerClassName:
          "px-4 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500",
        cellClassName: "px-4 py-5 text-center",
        renderCell: (row) => (
          <span className="rounded-full bg-[#F1F5F9] px-5 py-2 font-semibold text-slate-700">
            {row.studentCount.toLocaleString(locale)}
          </span>
        ),
      },
      {
        id: "chatMode",
        header: t("table.columns.chatMode"),
        headerClassName:
          "px-4 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500",
        cellClassName: "px-4 py-5 text-center",
        renderCell: (row) => (
          <span className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium">
            {t(`chatModes.${row.chatModeId}` as const)}
            {row.chatModeId === "everyone" ? <Earth /> : <SearchPerson />}
          </span>
        ),
      },
      {
        id: "attachments",
        header: t("table.columns.attachments"),
        headerClassName:
          "px-4 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500",
        cellClassName: "px-4 py-5 text-center",
        renderCell: (row) => (
          <div className="flex flex-wrap justify-center gap-1">
            {row.attachments.length > 0 ? (
              row.attachments.map((att, idx) => (
                <span
                  key={`${att.type}-${idx}`}
                  className={`inline-flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-[10px] font-semibold ${attachmentColors[att.type] ?? "bg-slate-100 text-slate-600"}`}
                >
                  {att.type.toUpperCase()}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400">—</span>
            )}
          </div>
        ),
      },
      {
        id: "status",
        header: t("table.columns.status"),
        headerClassName:
          "px-4 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500",
        cellClassName: "px-4 py-5 text-center",
        renderCell: (row) => {
          const isPaused = row.isLocked;
          return (
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                isPaused ? "bg-sky-100 text-sky-700" : "bg-emerald-100 text-emerald-700"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isPaused ? "bg-sky-400" : "animate-pulse bg-emerald-500"
                }`}
              />
              {t(`statuses.${isPaused ? "paused" : "active"}`)}
            </span>
          );
        },
      },
      {
        id: "lastActivity",
        header: t("table.columns.lastActivity"),
        headerClassName:
          "px-4 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500",
        cellClassName: "px-4 py-5 text-center text-sm text-slate-500",
        renderCell: (row) => row.lastActivityDisplay ?? "—",
      },
      {
        id: "actions",
        header: t("table.columns.actions"),
        headerClassName:
          "px-4 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500",
        cellClassName: "px-4 py-5",
        renderCell: (row) => (
          <div className="flex items-center justify-center gap-1">
            <button
              type="button"
              onClick={() =>
                router.push(ROUTES.USER.TEACHER.CHAT_GROUPS.VIEW(row.courseId || row.id))
              }
              title={t("actions.view")}
              className="rounded-xl bg-sky-50 p-2.5 text-sky-600 transition-colors hover:bg-sky-100"
            >
              <Eye className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() =>
                router.push(ROUTES.USER.TEACHER.CHAT_GROUPS.EDIT(row.courseId || row.id))
              }
              title={t("actions.settings")}
              className="rounded-xl p-2.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            >
              <Settings className="h-4 w-4" />
            </button>
            {!row.isLocked ? (
              <button
                type="button"
                onClick={() => void handleTogglePause(row)}
                title={t("actions.pause")}
                className="rounded-xl p-2.5 text-red-400 transition-colors hover:bg-red-50 hover:text-red-600"
              >
                <Pause className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void handleTogglePause(row)}
                title={t("actions.resume")}
                className="rounded-xl p-2.5 text-emerald-500 transition-colors hover:bg-emerald-50"
              >
                <Play className="h-4 w-4" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setDeleteTarget(row)}
              title={t("delete.title")}
              className="rounded-xl p-2.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ),
      },
    ],
    [handleTogglePause, locale, router, t],
  );

  if (isInitialLoading) {
    return (
      <section className="space-y-8">
        <DashboardPageHeader
          title={t("title")}
          description={t("description")}
          breadcrumbs={[
            { label: t("breadcrumbs.home"), href: ROUTES.USER.TEACHER.HOME },
            { label: t("breadcrumbs.chatGroups") },
          ]}
        />
        <ChatGroupsDashboardSkeleton />
      </section>
    );
  }

  return (
    <section className="space-y-8">
      <DashboardPageHeader
        title={t("title")}
        description={t("description")}
        breadcrumbs={[
          { label: t("breadcrumbs.home"), href: ROUTES.USER.TEACHER.HOME },
          { label: t("breadcrumbs.chatGroups") },
        ]}
        action={
          <Button className="h-12 rounded-2xl bg-[#243B5A] px-6" asChild>
            <Link href={ROUTES.USER.TEACHER.CHAT_GROUPS.CREATE}>
              <Plus className="ml-2 h-4 w-4" />
              {t("table.addButton")}
            </Link>
          </Button>
        }
      />

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat) => (
          <DashboardStatCard
            key={stat.id}
            label={t(stat.labelKey)}
            value={isStatsLoading ? "…" : stat.value}
            indicator={stat.indicatorKey ? t(stat.indicatorKey) : undefined}
            icon={stat.icon!}
            iconTone={stat.iconToneClassName}
            className={stat.accentClassName}
          />
        ))}
      </div>

      <div
        className="rounded-[1.75rem] border border-white/80 bg-white p-5"
        style={{ boxShadow: "0px 8px 0px 0px #0000000D" }}
      >
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end">
          <DashboardFilterSelect
            value={filters.status}
            label={t("filters.statuses.label")}
            onChange={(value) =>
              setFilters((prev) => ({
                ...prev,
                status: value as TeacherChatGroupsFilterState["status"],
              }))
            }
            options={staticFilters.statuses.map((opt) => ({
              id: opt.id,
              label: t(opt.labelKey),
            }))}
          />
          <DashboardFilterSelect
            value={filters.gradeId}
            label={t("filters.grades.label")}
            onChange={(value) => setFilters((prev) => ({ ...prev, gradeId: value }))}
            options={gradeOptions}
          />
          <DashboardFilterSelect
            value={filters.subjectId}
            label={t("filters.subjects.label")}
            onChange={(value) => setFilters((prev) => ({ ...prev, subjectId: value }))}
            options={subjectOptions}
          />
          <DashboardSearchFilter
            label={t("filters.search.label")}
            placeholder={t("table.searchPlaceholder")}
            value={filters.keyword}
            onChange={(keyword) => setFilters((prev) => ({ ...prev, keyword }))}
          />
        </div>
      </div>

      <DashboardTableCard
        title={t("table.title")}
        footer={
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <p className="text-right text-sm text-slate-400">
              {t("table.pagination.summary", { visible: rows.length, total: totalItems })}
            </p>
            <DashboardPagination
              pages={Array.from({ length: totalPages }, (_, i) => i + 1)}
              currentPage={currentPage}
              previousLabel={t("table.pagination.previous")}
              nextLabel={t("table.pagination.next")}
              onPageChange={setCurrentPage}
            />
          </div>
        }
      >
        {isLoading ? (
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
            tableClassName="w-full min-w-[900px] text-right"
          />
        )}
      </DashboardTableCard>

      <ChatGroupDeleteModal
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        groupName={deleteTarget?.groupName}
        title={t("delete.title")}
        description={t("delete.description")}
        confirmLabel={t("delete.confirm")}
        cancelLabel={t("delete.cancel")}
        onConfirm={() => void handleDeleteConfirm()}
      />
    </section>
  );
}
