"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { motion, useReducedMotion } from "framer-motion";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import {
  DashboardFilterSelect,
  DashboardDataTable,
  type DashboardDataTableColumn,
  DashboardPageHeader,
  DashboardPagination,
  DashboardSearchFilter,
  DashboardStatCard,
  DashboardTableCard,
  type DashboardFilterOption,
} from "@/shared/presentation/components/dashboard";
import { Skeleton } from "@/shared/presentation/components/ui/skeleton";
import { chatGroupsDashboardData } from "@/modules/admin/domain/data/chatGroupsDashboardData";
import type { ChatGroupRow } from "@/modules/admin/domain/types/chatGroups.types";
import {
  formatChatGroupStatValue,
  useChatGroupsDashboard,
  type ChatGroupsFilterState,
} from "@/modules/admin/application/hooks/useChatGroupsDashboard";
import { getSubjectsPage } from "@/modules/admin/infrastructure/api/subjectApi";
import type { SubjectListItem } from "@/modules/admin/infrastructure/api/subjectApi";
import {
  getCountriesDropdown,
  getEducationLevelsDropdown,
  getUserManagementGradesDropdown,
} from "@/modules/admin/infrastructure/api/userManagementApi";
import { notify } from "@/shared/application/lib/toast";
import Earth from "../../assets/icons/Earth";
import SearchPerson from "../../assets/icons/SearchPerson";
import { ChatGroupsDashboardSkeleton } from "./ChatGroupsDashboardSkeleton";
import { Settings } from "lucide-react";

const fadeInUp = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.3, ease: "easeOut" as const },
  }),
};

const DEFAULT_FILTERS: ChatGroupsFilterState = {
  status: "all",
  gradeId: "all",
  subjectId: "all",
  keyword: "",
};

export function ChatGroupsDashboard() {
  const t = useTranslations("admin.dashboard.chatGroups");
  const locale = useLocale();
  const router = useRouter();
  const reduceMotion = useReducedMotion();

  const [filters, setFilters] = useState<ChatGroupsFilterState>(DEFAULT_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);
  const [gradeOptions, setGradeOptions] = useState<DashboardFilterOption<string>[]>([]);
  const [subjectOptions, setSubjectOptions] = useState<DashboardFilterOption<string>[]>([]);
  const [filterOptionsLoading, setFilterOptionsLoading] = useState(true);

  const { stats: statConfig, filters: staticFilters } = chatGroupsDashboardData;
  const { rows, page, listQuery, statsQuery, statistics } = useChatGroupsDashboard(
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
    if (listQuery.error) {
      notify.error(t("table.states.error"));
    }
  }, [listQuery.error, t]);

  useEffect(() => {
    if (statsQuery.error) {
      notify.error(t("table.states.error"));
    }
  }, [statsQuery.error, t]);

  useEffect(() => {
    let alive = true;

    const loadFilterOptions = async () => {
      setFilterOptionsLoading(true);
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
      } finally {
        if (alive) setFilterOptionsLoading(false);
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
        value: formatChatGroupStatValue(
          stat.id,
          statistics,
          locale,
          stat.value,
        ),
      })),
    [locale, statConfig, statistics],
  );

  const handleEdit = (chatGroupId: string, courseId: string) => {
    router.push(ROUTES.ADMIN.CHAT_GROUPS.EDIT(courseId || chatGroupId));
  };

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
            <div className="h-10 w-1.5 rounded-full" style={{ backgroundColor: row.colorIndicator }} />
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
          <span className="rounded-full bg-[#F1F5F9] p-2 px-5 font-semibold text-slate-700">
            {row.studentCount.toLocaleString("EG")}
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
          const isPaused = row.isLocked;
          return (
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                isPaused ? "bg-slate-100 text-slate-500" : "bg-emerald-100 text-emerald-700"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isPaused ? "bg-slate-400" : "animate-pulse bg-emerald-500"
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
        renderCell: (row) => row.lastActivityDisplay ?? (row.lastActivityKey ? t(row.lastActivityKey) : "—"),
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
              onClick={() => handleEdit(row.id, row.courseId)}
              title={t("actions.settings")}
              className="rounded-xl p-2.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
        ),
      },
    ],
    [handleEdit, t],
  );

  if (isInitialLoading) {
    return (
      <section className="space-y-8">
        <DashboardPageHeader
          title={t("title")}
          breadcrumbs={[
            { label: t("breadcrumbs.home"), href: ROUTES.ADMIN.HOME },
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
        breadcrumbs={[
          { label: t("breadcrumbs.home"), href: ROUTES.ADMIN.HOME },
          { label: t("breadcrumbs.chatGroups") },
        ]}
      />

      <motion.div
        className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: reduceMotion ? 0 : 0.07,
              delayChildren: reduceMotion ? 0 : 0.03,
            },
          },
        }}
      >
        {statCards.map((stat, idx) => (
          <motion.div key={stat.id} custom={idx} variants={fadeInUp}>
            <DashboardStatCard
              label={t(stat.labelKey)}
              value={isStatsLoading ? "…" : stat.value}
              indicator={stat.indicatorKey ? t(stat.indicatorKey) : undefined}
              icon={stat.icon!}
              iconTone={stat.iconToneClassName}
              className={stat.accentClassName}
            />
          </motion.div>
        ))}
      </motion.div>

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
                status: value as ChatGroupsFilterState["status"],
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
            options={filterOptionsLoading ? [{ id: "all", label: t("filters.grades.all") }] : gradeOptions}
            disabled={filterOptionsLoading}
          />
          <DashboardFilterSelect
            value={filters.subjectId}
            label={t("filters.subjects.label")}
            onChange={(value) => setFilters((prev) => ({ ...prev, subjectId: value }))}
            options={
              filterOptionsLoading
                ? [{ id: "all", label: t("filters.subjects.all") }]
                : subjectOptions
            }
            disabled={filterOptionsLoading}
          />
          <DashboardSearchFilter
            label={t("filters.search.label")}
            placeholder={t("table.searchPlaceholder")}
            value={filters.keyword}
            onChange={(keyword) => setFilters((prev) => ({ ...prev, keyword }))}
          />
        </div>
      </div>

      <motion.div
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: reduceMotion ? 0 : 0.18, duration: reduceMotion ? 0.18 : 0.32 }}
      >
        <DashboardTableCard
          title={t("table.title")}
          className={isTableRefetching ? "opacity-60 transition-opacity" : undefined}
          footer={
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <p className="text-right text-sm text-slate-400">
                {t("table.pagination.summary", {
                  visible: rows.length,
                  total: totalItems,
                })}
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
              tableClassName="w-full min-w-[900px] text-right"
            />
          )}
        </DashboardTableCard>
      </motion.div>
    </section>
  );
}
