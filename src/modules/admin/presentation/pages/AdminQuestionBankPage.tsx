"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import {
  DashboardPageHeader,
  DashboardStatCard,
  DashboardTableCard,
  DashboardBadge,
  DashboardDataTable,
  type DashboardDataTableColumn,
  DashboardTableFooterPagination,
  DashboardFilterSelect,
  DashboardFiltersPanel,
  DashboardSearchFilter,
} from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";
import { Skeleton } from "@/shared/presentation/components/ui/skeleton";
import { BookOpen, CheckCircle2, RotateCcw, FileQuestion, Trash2, Eye } from "lucide-react";
import { useQuestionBankPage } from "@/modules/admin/application/hooks/useQuestionBankPage";
import { useQuestionBankSubjects } from "@/modules/admin/application/hooks/useQuestionBankSubjects";
import { deleteQuestionBankQuestion, type QuestionBankEnumOption } from "@/modules/admin/infrastructure/api/questionBankApi";
import { ChatGroupDeleteModal } from "@/modules/admin/presentation/components/chat-groups";
import {
  QuestionBankAnimatedSection,
  QuestionBankDashboardSkeleton,
} from "@/modules/admin/presentation/components/question-bank";
import { notify } from "@/shared/application/lib/toast";

function getEnumLabel(option: QuestionBankEnumOption, locale: string): string {
  return locale.startsWith("ar") ? option.displayNameAr : option.displayNameEn;
}

export function AdminQuestionBankPage() {
  const t = useTranslations("admin.dashboard");
  const locale = useLocale();
  const router = useRouter();
  const {
    filters,
    setFilters,
    pages,
    pageNumber,
    summaryQuery,
    enumsQuery,
    listQuery,
    page,
    setPageNumber,
  } = useQuestionBankPage();
  const subjectsQuery = useQuestionBankSubjects();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{ id: string; snippet: string } | null>(null);
  const summary = summaryQuery.data?.data;
  const enums = enumsQuery.data?.data;
  const rows = page?.rows ?? [];

  const statusMap = useMemo(() => {
    const map = new Map<number, string>();
    for (const item of enums?.statuses ?? []) {
      map.set(item.value, getEnumLabel(item, locale));
    }
    return map;
  }, [enums?.statuses, locale]);

  const difficultyMap = useMemo(() => {
    const map = new Map<number, string>();
    for (const item of enums?.difficultyLevels ?? []) {
      map.set(item.value, getEnumLabel(item, locale));
    }
    return map;
  }, [enums?.difficultyLevels, locale]);

  const questionTypeMap = useMemo(() => {
    const map = new Map<number, string>();
    for (const item of enums?.questionTypes ?? []) {
      map.set(item.value, getEnumLabel(item, locale));
    }
    return map;
  }, [enums?.questionTypes, locale]);

  const statusOptions = useMemo(
    () => [
      { id: "all", label: t("questionBank.filters.questionType.all") },
      ...(enums?.statuses ?? []).map((item) => ({
        id: String(item.value),
        label: getEnumLabel(item, locale),
      })),
    ],
    [enums?.statuses, locale, t],
  );

  const difficultyLevelOptions = useMemo(
    () => [
      { id: "all", label: t("questionBank.filters.difficultyLevel.all") },
      ...(enums?.difficultyLevels ?? []).map((item) => ({
        id: String(item.value),
        label: getEnumLabel(item, locale),
      })),
    ],
    [enums?.difficultyLevels, locale, t],
  );

  const subjectOptions = useMemo(
    () => [
      { id: "all", label: t("questionBank.filters.subject.all") },
      ...(subjectsQuery.data?.data?.rows ?? []).map((subject) => ({
        id: String(subject.id),
        label: locale.startsWith("ar")
          ? subject.nameAr || subject.nameEn
          : subject.nameEn || subject.nameAr,
      })),
    ],
    [locale, subjectsQuery.data?.data?.rows, t],
  );

  const columns: Array<DashboardDataTableColumn<(typeof rows)[number]>> = [
    {
      id: "question",
      header: t("questionBank.table.columns.question"),
      cellClassName: "font-semibold",
      renderCell: (row) => row.questionSnippet,
    },
    {
      id: "type",
      header: t("questionBank.table.columns.type"),
      renderCell: (row) => (
        <DashboardBadge tone={row.questionType === 0 ? "warning" : "info"}>
          {row.questionTypeLabel
            ?? (row.questionType !== null
              ? (questionTypeMap.get(row.questionType) ?? String(row.questionType))
              : "—")}
        </DashboardBadge>
      ),
    },
    {
      id: "subject",
      header: t("questionBank.table.columns.subject"),
      renderCell: (row) => row.subjectName,
    },
    {
      id: "difficulty",
      header: t("questionBank.table.columns.difficulty"),
      renderCell: (row) => (
        <DashboardBadge tone="success">
          {row.difficultyLabel
            ?? (row.difficultyLevel !== null
              ? (difficultyMap.get(row.difficultyLevel) ?? String(row.difficultyLevel))
              : "—")}
        </DashboardBadge>
      ),
    },
  ];

  const isInitialLoading =
    summaryQuery.isPending || enumsQuery.isPending || listQuery.isPending;
  const isTableRefetching = listQuery.isFetching && !listQuery.isPending;
  const isError = Boolean(summaryQuery.error || enumsQuery.error || listQuery.error);

  const statsNumberFormatter = new Intl.NumberFormat(locale.startsWith("ar") ? "ar" : "en-US");

  const handleViewQuestion = (questionId: string) => {
    router.push(`${ROUTES.ADMIN.QUESTION_BANK.PREVIEW}?id=${encodeURIComponent(questionId)}`);
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    const questionId = pendingDelete.id;
    setPendingDelete(null);

    setDeletingId(questionId);
    const result = await deleteQuestionBankQuestion(questionId);
    setDeletingId(null);

    if (result.errorMessage) {
      notify.error(result.errorMessage);
      return;
    }

    notify.success(result.message ?? t("questionBank.table.actions.deleteSuccess"));
    await Promise.all([listQuery.refetch(), summaryQuery.refetch()]);
  };

  const header = (
    <DashboardPageHeader
      title={t("questionBank.title")}
      description={t("questionBank.description")}
      breadcrumbs={[{ label: t("tabs.home.title"), href: ROUTES.ADMIN.HOME }, { label: t("questionBank.title") }]}
      action={
        <Button
          type="button"
          className="dashboard-raised-button h-14 rounded-2xl bg-[#243B5A] px-6 text-base font-semibold text-white hover:bg-[#1D314B] cursor-pointer"
          style={{
            boxShadow: "0px 4px 0px 0px #1E2E42",
          }}
          onClick={() => router.push(ROUTES.ADMIN.QUESTION_BANK.PREVIEW_All)}
        >
          {t("questionBank.actions.openManage")}
        </Button>
      }
    />
  );

  return (
    <div className="space-y-8">
      {header}

      {isInitialLoading ? (
        <QuestionBankDashboardSkeleton />
      ) : (
        <>
          <QuestionBankAnimatedSection delay={0.02}>
            <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              <DashboardStatCard
                label={t("questionBank.stats.total")}
                value={statsNumberFormatter.format(summary?.totalQuestions ?? 0)}
                indicator=""
                icon={BookOpen}
                iconTone="info"
              />
              <DashboardStatCard
                label={t("questionBank.stats.approved")}
                value={statsNumberFormatter.format(summary?.approved ?? 0)}
                indicator=""
                icon={CheckCircle2}
                iconTone="success"
              />
              <DashboardStatCard
                label={t("questionBank.stats.pendingApproval")}
                value={statsNumberFormatter.format(summary?.pendingApproval ?? 0)}
                indicator=""
                icon={RotateCcw}
                iconTone="warning"
              />
              <DashboardStatCard
                label={t("questionBank.stats.draft")}
                value={statsNumberFormatter.format(summary?.draft ?? 0)}
                indicator=""
                icon={FileQuestion}
                iconTone="danger"
              />
            </section>
          </QuestionBankAnimatedSection>

          <QuestionBankAnimatedSection delay={0.06}>
            <DashboardFiltersPanel>
              <DashboardFilterSelect
                label={t("questionBank.filters.questionType.label")}
                value={filters.status}
                options={statusOptions}
                disabled={enumsQuery.isLoading}
                onChange={(value) =>
                  setFilters((current) => ({ ...current, status: value }))
                }
              />
              <DashboardFilterSelect
                label={t("questionBank.filters.difficultyLevel.label")}
                value={filters.difficultyLevel}
                options={difficultyLevelOptions}
                disabled={enumsQuery.isLoading}
                onChange={(value) =>
                  setFilters((current) => ({ ...current, difficultyLevel: value }))
                }
              />
              <DashboardFilterSelect
                label={t("questionBank.filters.subject.label")}
                value={filters.subject}
                options={subjectOptions}
                disabled={subjectsQuery.isLoading}
                onChange={(value) =>
                  setFilters((current) => ({ ...current, subject: value }))
                }
              />
              <DashboardSearchFilter
                label={t("questionBank.filters.search.label")}
                placeholder={t("questionBank.filters.search.placeholder")}
                value={filters.titleQuery}
                onChange={(value) =>
                  setFilters((current) => ({ ...current, titleQuery: value }))
                }
              />
            </DashboardFiltersPanel>
          </QuestionBankAnimatedSection>

          <QuestionBankAnimatedSection delay={0.14}>
            <DashboardTableCard
              title={t("questionBank.table.title")}
              footer={
                <DashboardTableFooterPagination
            summary={t("questionBank.table.pagination.summary", {
              visible: rows.length,
              total: page?.totalItems ?? rows.length,
            })}
            pages={pages}
            currentPage={page?.currentPage ?? pageNumber}
            previousLabel={t("questionBank.table.pagination.previous")}
            nextLabel={t("questionBank.table.pagination.next")}
            onPageChange={setPageNumber}
                />
              }
            >
              {isTableRefetching ? (
                <div className="space-y-3 px-4 py-6" aria-busy="true" aria-label={t("questionBank.table.loading")}>
                  {Array.from({ length: 8 }).map((_, index) => (
                    <Skeleton key={`question-bank-table-row-${index}`} className="h-14 w-full rounded-xl" />
                  ))}
                </div>
              ) : (
                <DashboardDataTable
                  rows={rows}
                  columns={columns}
                  getRowKey={(row) => row.id}
                  emptyMessage={
                    isError ? t("questionBank.table.loadError") : t("questionBank.table.empty")
                  }
                  actionsHeader={t("questionBank.table.columns.actions")}
                  renderActions={(row) => (
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        className="dashboard-icon-btn"
                        aria-label={t("questionBank.table.actions.preview")}
                        onClick={(event) => {
                          event.stopPropagation();
                          handleViewQuestion(row.id);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="dashboard-icon-btn dashboard-icon-btn--danger"
                        aria-label={t("questionBank.table.actions.delete")}
                        disabled={deletingId === row.id}
                        onClick={(event) => {
                          event.stopPropagation();
                          setPendingDelete({ id: row.id, snippet: row.questionSnippet });
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                />
              )}
            </DashboardTableCard>
          </QuestionBankAnimatedSection>
        </>
      )}

      <ChatGroupDeleteModal
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
        groupName={pendingDelete?.snippet}
        title={t("questionBankManage.deleteModal.title")}
        description={t("questionBankManage.deleteModal.description")}
        confirmLabel={t("questionBankManage.deleteModal.confirm")}
        cancelLabel={t("questionBankManage.deleteModal.cancel")}
        onConfirm={() => void handleConfirmDelete()}
      />
    </div>
  );
}
