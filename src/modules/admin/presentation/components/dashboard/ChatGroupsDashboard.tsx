"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import {
  DashboardFilterSelect,
  DashboardPageHeader,
  DashboardSearchFilter,
  DashboardStatCard,
  DashboardTableCard,
  type DashboardFilterOption,
} from "@/shared/presentation/components/dashboard";
import { Skeleton } from "@/shared/presentation/components/ui/skeleton";
import { chatGroupsDashboardData } from "@/modules/admin/domain/data/chatGroupsDashboardData";
import type {
  ChatGroupChatModeId,
  ChatGroupStatusId,
} from "@/modules/admin/domain/types/chatGroups.types";
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
import { ChatGroupTableRow, ChatGroupDeleteModal } from "../chat-groups";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: "easeOut" as const },
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

  const [filters, setFilters] = useState<ChatGroupsFilterState>(DEFAULT_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [gradeOptions, setGradeOptions] = useState<DashboardFilterOption<string>[]>([]);
  const [subjectOptions, setSubjectOptions] = useState<DashboardFilterOption<string>[]>([]);
  const [filterOptionsLoading, setFilterOptionsLoading] = useState(true);

  const { stats: statConfig, filters: staticFilters } = chatGroupsDashboardData;
  const { rows, page, listQuery, statsQuery, statistics } = useChatGroupsDashboard(
    filters,
    currentPage,
  );

  const selectedGroup = useMemo(
    () => rows.find((r) => r.id === selectedGroupId),
    [rows, selectedGroupId],
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

  const handleView = (id: string) => {
    router.push(ROUTES.ADMIN.CHAT_GROUPS.VIEW(id));
  };

  const handleEdit = (chatGroupId: string, courseId: string) => {
    router.push(ROUTES.ADMIN.CHAT_GROUPS.EDIT(courseId || chatGroupId));
  };

  const handleToggleStatus = (id: string) => {
    console.log("Toggle status for:", id);
  };

  const handleDelete = (id: string) => {
    setSelectedGroupId(id);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    console.log("Delete group:", selectedGroupId);
    setDeleteModalOpen(false);
    setSelectedGroupId(null);
  };

  const isLoading = listQuery.isLoading || listQuery.isFetching;
  const isStatsLoading = statsQuery.isLoading;

  const renderTableBody = useCallback(() => {
    if (isLoading) {
      return (
        <tr>
          <td colSpan={7} className="px-4 py-12">
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-14 w-full rounded-xl" />
              ))}
            </div>
          </td>
        </tr>
      );
    }

    if (rows.length === 0) {
      return (
        <tr>
          <td colSpan={7} className="px-4 py-12 text-center text-sm text-slate-500">
            {t("table.states.empty")}
          </td>
        </tr>
      );
    }

    return rows.map((row) => (
      <ChatGroupTableRow
        key={row.id}
        row={row}
        chatModeLabel={(modeId: ChatGroupChatModeId) => t(`chatModes.${modeId}`)}
        statusLabel={(statusId: ChatGroupStatusId) => t(`statuses.${statusId}`)}
        lastActivityLabel={(key: string) => (key ? t(key) : "—")}
        viewLabel={t("actions.view")}
        settingsLabel={t("actions.settings")}
        pauseLabel={t("actions.pause")}
        resumeLabel={t("actions.resume")}
        deleteLabel={t("actions.delete")}
        onView={handleView}
        onEdit={() => handleEdit(row.id, row.courseId)}
        onToggleStatus={handleToggleStatus}
        onDelete={handleDelete}
      />
    ));
  }, [
    handleDelete,
    handleEdit,
    handleToggleStatus,
    handleView,
    isLoading,
    rows,
    t,
  ]);

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
        variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
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
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        <DashboardTableCard
          title={t("table.title")}
          footer={
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">
                {t("table.pagination.showing", {
                  visible: rows.length,
                  total: totalItems,
                })}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentPage <= 1 || isLoading}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
                >
                  {t("table.pagination.prev")}
                </button>
                <span className="min-w-[4rem] text-center text-sm text-slate-700">
                  {t("table.pagination.page", {
                    current: currentPage,
                    total: totalPages,
                  })}
                </span>
                <button
                  type="button"
                  disabled={currentPage >= totalPages || isLoading}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
                >
                  {t("table.pagination.next")}
                </button>
              </div>
            </div>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-right">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="px-4 py-4">{t("table.columns.groupName")}</th>
                  <th className="px-4 py-4 text-center">{t("table.columns.studentCount")}</th>
                  <th className="px-4 py-4 text-center">{t("table.columns.chatMode")}</th>
                  <th className="px-4 py-4 text-center">{t("table.columns.attachments")}</th>
                  <th className="px-4 py-4 text-center">{t("table.columns.status")}</th>
                  <th className="px-4 py-4 text-center">{t("table.columns.lastActivity")}</th>
                  <th className="px-4 py-4 text-center">{t("table.columns.actions")}</th>
                </tr>
              </thead>
              <tbody>{renderTableBody()}</tbody>
            </table>
          </div>
        </DashboardTableCard>
      </motion.div>

      <ChatGroupDeleteModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        groupName={selectedGroup?.groupName}
        title={t("deleteModal.title")}
        description={t("deleteModal.description")}
        confirmLabel={t("deleteModal.confirm")}
        cancelLabel={t("deleteModal.cancel")}
        onConfirm={handleConfirmDelete}
      />
    </section>
  );
}
