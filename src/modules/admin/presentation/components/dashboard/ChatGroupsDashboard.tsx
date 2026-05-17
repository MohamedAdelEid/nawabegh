"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import {
  DashboardFilterSelect,
  DashboardPageHeader,
  DashboardSearchFilter,
  DashboardStatCard,
  DashboardTableCard,
} from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";
import { chatGroupsDashboardData } from "@/modules/admin/domain/data/chatGroupsDashboardData";
import type {
  ChatGroupChatModeId,
  ChatGroupStatusId,
  ChatGroupGradeId,
  ChatGroupSubjectId,
} from "@/modules/admin/domain/types/chatGroups.types";
import { ChatGroupTableRow, ChatGroupDeleteModal } from "../chat-groups";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: "easeOut" as const },
  }),
};

export function ChatGroupsDashboard() {
  const t = useTranslations("admin.dashboard.chatGroups");
  const router = useRouter();

  const [statusFilter, setStatusFilter] = useState<ChatGroupStatusId | "all">("all");
  const [gradeFilter, setGradeFilter] = useState<ChatGroupGradeId>("all");
  const [subjectFilter, setSubjectFilter] = useState<ChatGroupSubjectId>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  const { stats, filters, rows, pagination } = chatGroupsDashboardData;

  const selectedGroup = useMemo(
    () => rows.find((r) => r.id === selectedGroupId),
    [rows, selectedGroupId],
  );

  const filteredRows = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const selectedGradeLabel =
      gradeFilter === "all"
        ? ""
        : t(filters.grades.find((item) => item.id === gradeFilter)?.labelKey ?? "")
            .toLowerCase()
            .trim();
    const selectedSubjectLabel =
      subjectFilter === "all"
        ? ""
        : t(filters.subjects.find((item) => item.id === subjectFilter)?.labelKey ?? "")
            .toLowerCase()
            .trim();

    return rows.filter((row) => {
      const statusMatches =
        statusFilter === "all" ||
        row.statusId === (statusFilter === "paused" ? "paused" : statusFilter);
      const rowText = `${row.groupName} ${row.courseSubtitle}`.toLowerCase();
      const gradeMatches = gradeFilter === "all" || (selectedGradeLabel && rowText.includes(selectedGradeLabel));
      const subjectMatches =
        subjectFilter === "all" || (selectedSubjectLabel && rowText.includes(selectedSubjectLabel));
      const queryMatches =
        !query ||
        row.groupName.toLowerCase().includes(query) ||
        row.courseSubtitle.toLowerCase().includes(query);

      return statusMatches && gradeMatches && subjectMatches && queryMatches;
    });
  }, [filters.grades, filters.subjects, gradeFilter, rows, searchQuery, statusFilter, subjectFilter, t]);

  const handleView = (id: string) => {
    router.push(ROUTES.ADMIN.CHAT_GROUPS.VIEW(id));
  };

  const handleEdit = (id: string) => {
    router.push(ROUTES.ADMIN.CHAT_GROUPS.EDIT(id));
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
        {stats.map((stat, idx) => (
          <motion.div key={stat.id} custom={idx} variants={fadeInUp}>
            <DashboardStatCard
              label={t(stat.labelKey)}
              value={stat.value}
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
            value={statusFilter}
            label={t("filters.statuses.label")}
            onChange={(value) => setStatusFilter(value as ChatGroupStatusId | "all")}
            options={filters.statuses.map((opt) => ({
              id: opt.id,
              label: t(opt.labelKey),
            }))}
          />
          <DashboardFilterSelect
            value={gradeFilter}
            label={t("filters.grades.label")}
            onChange={(value) => setGradeFilter(value as ChatGroupGradeId)}
            options={filters.grades.map((opt) => ({
              id: opt.id,
              label: t(opt.labelKey),
            }))}
          />
          <DashboardFilterSelect
            value={subjectFilter}
            label={t("filters.subjects.label")}
            onChange={(value) => setSubjectFilter(value as ChatGroupSubjectId)}
            options={filters.subjects.map((opt) => ({
              id: opt.id,
              label: t(opt.labelKey),
            }))}
          />
          <DashboardSearchFilter
            label={t("filters.search.label")}
            placeholder={t("table.searchPlaceholder")}
            value={searchQuery}
            onChange={setSearchQuery}
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
                  visible: filteredRows.length,
                  total: filteredRows.length,
                })}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
                >
                  {t("table.pagination.prev")}
                </button>
                <span className="min-w-[4rem] text-center text-sm text-slate-700">
                  {t("table.pagination.page", {
                    current: currentPage,
                    total: pagination.totalPages,
                  })}
                </span>
                <button
                  type="button"
                  disabled={currentPage >= pagination.totalPages}
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
              <tbody>
                {filteredRows.map((row) => (
                  <ChatGroupTableRow
                    key={row.id}
                    row={row}
                    chatModeLabel={(modeId: ChatGroupChatModeId) =>
                      t(`chatModes.${modeId}`)
                    }
                    statusLabel={(statusId: ChatGroupStatusId) =>
                      t(`statuses.${statusId}`)
                    }
                    lastActivityLabel={(key: string) => t(key)}
                    viewLabel={t("actions.view")}
                    settingsLabel={t("actions.settings")}
                    pauseLabel={t("actions.pause")}
                    resumeLabel={t("actions.resume")}
                    deleteLabel={t("actions.delete")}
                    onView={handleView}
                    onEdit={handleEdit}
                    onToggleStatus={handleToggleStatus}
                    onDelete={handleDelete}
                  />
                ))}
              </tbody>
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
