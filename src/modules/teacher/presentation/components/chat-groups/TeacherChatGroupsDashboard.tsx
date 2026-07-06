"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import { Eye, Pause, Play, Settings } from "lucide-react";
import { teacherChatGroupsDashboardData } from "@/modules/teacher/domain/data/teacherChatGroupsDashboardData";
import {
  mapChatGroupDetailToFormValues,
  mapChatGroupFormToUpdatePayload,
} from "@/modules/admin/domain/utils/chatGroupMappers";
import type { ChatGroupRow } from "@/modules/admin/domain/types/chatGroups.types";
import {
  formatChatGroupStatValue,
  useTeacherChatGroups,
  type TeacherChatGroupsFilterState,
} from "@/modules/teacher/application/hooks/useTeacherChatGroups";
import {
  getTeacherChatGroupByCourseId,
  updateTeacherChatGroupByCourseId,
} from "@/modules/teacher/infrastructure/api/teacherChatGroupsApi";
import { getSubjectsPage } from "@/modules/admin/infrastructure/api/subjectApi";
import type { SubjectListItem } from "@/modules/admin/infrastructure/api/subjectApi";
import {
  getCountriesDropdown,
  getEducationLevelsDropdown,
  getUserManagementGradesDropdown,
} from "@/modules/admin/infrastructure/api/userManagementApi";
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

function resolveRowStatusKey(row: ChatGroupRow): "activeNow" | "locked" | "inactive" {
  const normalized = (row.apiStatus ?? "").trim().toLowerCase();
  if (row.isLocked || normalized === "locked") return "locked";
  if (normalized === "activenow" || normalized === "active_now") return "activeNow";
  return "inactive";
}

export function TeacherChatGroupsDashboard() {
  const t = useTranslations("teacher.dashboard.chatGroups");
  const locale = useLocale();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState<TeacherChatGroupsFilterState>(DEFAULT_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);
  const [gradeOptions, setGradeOptions] = useState<DashboardFilterOption<string>[]>([
    { id: "all", label: t("filters.grades.all") },
  ]);
  const [subjectOptions, setSubjectOptions] = useState<DashboardFilterOption<string>[]>([
    { id: "all", label: t("filters.subjects.all") },
  ]);

  const { stats: statConfig, filters: staticFilters } = teacherChatGroupsDashboardData;
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

  useEffect(() => {
    let alive = true;

    const loadFilterOptions = async () => {
      try {
        const [subjectsResult, countriesResult] = await Promise.all([
          getSubjectsPage({ pageNumber: 1, pageSize: 240 }),
          getCountriesDropdown(),
        ]);
        if (!alive) return;

        const subjectRows: SubjectListItem[] = subjectsResult.data?.rows ?? [];
        const nextSubjectOptions: DashboardFilterOption<string>[] = [
          { id: "all", label: t("filters.subjects.all") },
          ...subjectRows.map((subject) => ({
            id: String(subject.id),
            label: subject.nameAr || subject.nameEn,
          })),
        ];

        const gradeById = new Map<number, string>();
        const country = countriesResult.data?.[0];
        if (country) {
          const levelsResult = await getEducationLevelsDropdown(country.id);
          if (!alive) return;
          const levels = levelsResult.data ?? [];
          const gradeBatches = await Promise.all(
            levels.map((level) => getUserManagementGradesDropdown(level.id)),
          );
          gradeBatches.forEach((batch, index) => {
            const levelName = levels[index]?.name ?? "";
            const prefix = levelName.trim() ? `${levelName.trim()} — ` : "";
            (batch.data ?? []).forEach((grade) => {
              const gradeId = typeof grade.id === "number" ? grade.id : Number(grade.id);
              if (!Number.isNaN(gradeId) && !gradeById.has(gradeId)) {
                gradeById.set(gradeId, `${prefix}${grade.name}`);
              }
            });
          });
        }

        if (!alive) return;
        setSubjectOptions(nextSubjectOptions);
        setGradeOptions([
          { id: "all", label: t("filters.grades.all") },
          ...Array.from(gradeById.entries()).map(([id, label]) => ({
            id: String(id),
            label,
          })),
        ]);
      } catch {
        // Keep default "all" options when dropdowns fail.
      }
    };

    void loadFilterOptions();
    return () => {
      alive = false;
    };
  }, [t]);

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
      queryClient.invalidateQueries({ queryKey: ["teacher-chat-groups"] }),
      queryClient.invalidateQueries({ queryKey: ["teacher-chat-groups-statistics"] }),
    ]);
  }, [queryClient]);

  const handleTogglePause = useCallback(
    async (row: ChatGroupRow) => {
      const detailResult = await getTeacherChatGroupByCourseId(row.courseId || row.id);
      if (!detailResult.data) {
        notify.error(detailResult.errorMessage ?? t("table.states.error"));
        return;
      }

      const form = mapChatGroupDetailToFormValues(detailResult.data);
      const payload = mapChatGroupFormToUpdatePayload({ ...form, isLocked: !row.isLocked });
      const result = await updateTeacherChatGroupByCourseId(row.courseId || row.id, payload);

      if (!result.data) {
        notify.error(result.errorMessage ?? t("table.states.error"));
        return;
      }

      notify.success(t(row.isLocked ? "actions.resumed" : "actions.paused"));
      await invalidateChatQueries();
    },
    [invalidateChatQueries, t],
  );

  const isTableRefetching = listQuery.isFetching && !listQuery.isPending;
  const isInitialLoading = listQuery.isPending && !page;
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
            <div
              className="h-10 w-1.5 shrink-0 rounded-full"
              style={{ backgroundColor: row.colorIndicator }}
            />
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
        id: "status",
        header: t("table.columns.status"),
        headerClassName:
          "px-4 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500",
        cellClassName: "px-4 py-5 text-center",
        renderCell: (row) => {
          const statusKey = resolveRowStatusKey(row);
          const statusStyles = {
            activeNow: "bg-emerald-100 text-emerald-700",
            locked: "bg-sky-100 text-sky-700",
            inactive: "bg-slate-100 text-slate-600",
          } as const;
          const dotStyles = {
            activeNow: "animate-pulse bg-emerald-500",
            locked: "bg-sky-400",
            inactive: "bg-slate-400",
          } as const;

          return (
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${statusStyles[statusKey]}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${dotStyles[statusKey]}`} />
              {t(`statuses.${statusKey}`)}
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
        className={isTableRefetching ? "opacity-60 transition-opacity" : undefined}
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
        {isInitialLoading && !page ? (
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
            tableClassName="w-full min-w-[720px] text-right"
          />
        )}
      </DashboardTableCard>
    </section>
  );
}
