"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import {
  BookOpen,
  CheckCircle2,
  CheckSquare,
  HelpCircle,
  ListChecks,
  Save,
  Type as TypeIcon,
  WandSparkles,
} from "lucide-react";

import { ROUTES } from "@/shared/infrastructure/config/routes";
import {
  DashboardFilterSelect,
  DashboardFiltersPanel,
  DashboardPageHeader,
  DashboardSearchFilter,
  DashboardStatCard,
} from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";
import { notify } from "@/shared/application/lib/toast";
import { STATIC_SUBJECT_OPTIONS } from "@/modules/admin/application/hooks/useQuestionBankPage";
import { useQuestionBankInfiniteList } from "@/modules/admin/application/hooks/useQuestionBankInfiniteList";
import {
  deleteQuestionBankQuestion,
  type QuestionBankEnumOption,
  type QuestionBankQuestionDetail,
} from "@/modules/admin/infrastructure/api/questionBankApi";
import {
  QuestionBankAnimatedSection,
  QuestionBankDifficultyStatCard,
  QuestionBankPreviewAllPageSkeleton,
  QuestionBankQuestionPreviewCard,
  QuestionBankQuestionPreviewCardSkeleton,
} from "@/modules/admin/presentation/components/question-bank";
import { ChatGroupDeleteModal } from "@/modules/admin/presentation/components/chat-groups";
import { IconTone } from "@/shared/domain/types/common.types";

const PLACEHOLDER_VALUE = "—";
const CARD_SKELETON_COUNT = 5;

function getEnumLabel(option: QuestionBankEnumOption, locale: string): string {
  return locale.startsWith("ar") ? option.displayNameAr : option.displayNameEn;
}

function mapDifficultyTone(value: number | null): IconTone {
  if (value === null) return "primary";
  if (value <= 0) return "success";
  if (value === 1) return "warning";
  return "danger";
}

function pickQuestionTypeIcon(name: string | undefined) {
  const normalized = (name ?? "").toLowerCase();
  if (normalized.includes("true") || normalized.includes("false") || normalized.includes("tf")) {
    return CheckSquare;
  }
  if (normalized.includes("short") || normalized.includes("text") || normalized.includes("essay")) {
    return TypeIcon;
  }
  if (normalized.includes("multi") || normalized.includes("mcq") || normalized.includes("choice")) {
    return ListChecks;
  }
  return HelpCircle;
}

function deriveStandardAnswer(detail: QuestionBankQuestionDetail | null): string {
  if (!detail) return PLACEHOLDER_VALUE;
  const correctTexts = detail.choices
    .filter((choice) => choice.isCorrect)
    .sort((a, b) => a.order - b.order)
    .map((choice) => choice.text.trim())
    .filter((text) => text.length > 0);
  if (correctTexts.length === 0) return PLACEHOLDER_VALUE;
  return correctTexts.join("، ");
}

export function AdminQuestionBankPreviewAllPage() {
  const t = useTranslations("admin.dashboard");
  const locale = useLocale();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{ id: string; snippet: string } | null>(null);
  const [hasLoadedShell, setHasLoadedShell] = useState(false);

  const {
    filters,
    setFilters,
    enumsQuery,
    summaryQuery,
    listQuery,
    items,
    isInitialLoading,
    isListError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
  } = useQuestionBankInfiniteList({ pageSize: 5 });

  const summary = summaryQuery.data?.data;
  const enums = enumsQuery.data?.data;

  useEffect(() => {
    if (summaryQuery.data && enumsQuery.data) {
      setHasLoadedShell(true);
    }
  }, [summaryQuery.data, enumsQuery.data]);

  const difficultyMap = useMemo(() => {
    const map = new Map<number, string>();
    for (const item of enums?.difficultyLevels ?? []) {
      map.set(item.value, getEnumLabel(item, locale));
    }
    return map;
  }, [enums?.difficultyLevels, locale]);

  const questionTypeMap = useMemo(() => {
    const map = new Map<number, { label: string; name: string }>();
    for (const item of enums?.questionTypes ?? []) {
      map.set(item.value, { label: getEnumLabel(item, locale), name: item.name });
    }
    return map;
  }, [enums?.questionTypes, locale]);

  const subjectOptions = useMemo(
    () =>
      STATIC_SUBJECT_OPTIONS.map((item) => ({
        id: item.id,
        label: t(item.translationKey),
      })),
    [t],
  );

  const difficultyOptions = useMemo(
    () => [
      { id: "all", label: t("questionBank.filters.difficultyLevel.all") },
      ...(enums?.difficultyLevels ?? []).map((item) => ({
        id: String(item.value),
        label: getEnumLabel(item, locale),
      })),
    ],
    [enums?.difficultyLevels, locale, t],
  );

  const questionTypeOptions = useMemo(
    () => [
      { id: "all", label: t("questionBank.filters.questionType.all") },
      ...(enums?.questionTypes ?? []).map((item) => ({
        id: String(item.value),
        label: getEnumLabel(item, locale),
      })),
    ],
    [enums?.questionTypes, locale, t],
  );

  const numberFormatter = new Intl.NumberFormat(locale.startsWith("ar") ? "ar" : "en-US");

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          void fetchNextPage();
        }
      },
      { rootMargin: "200px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleViewQuestion = (id: string) => {
    router.push(`${ROUTES.ADMIN.QUESTION_BANK.PREVIEW}?id=${encodeURIComponent(id)}`);
  };

  const handleEditQuestion = (id: string) => {
    router.push(`${ROUTES.ADMIN.QUESTION_BANK.PREVIEW}?id=${encodeURIComponent(id)}`);
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    const id = pendingDelete.id;
    setPendingDelete(null);

    setDeletingId(id);
    const result = await deleteQuestionBankQuestion(id);
    setDeletingId(null);

    if (result.errorMessage) {
      notify.error(result.errorMessage);
      return;
    }

    notify.success(result.message ?? t("questionBank.table.actions.deleteSuccess"));
    queryClient.removeQueries({ queryKey: ["admin-question-bank-detail", id] });
    await Promise.all([refetch(), summaryQuery.refetch()]);
  };

  const showFullPageSkeleton =
    !hasLoadedShell &&
    (summaryQuery.isPending || enumsQuery.isPending || listQuery.isPending);
  const showListSkeletons =
    isInitialLoading || (items.length === 0 && hasNextPage && listQuery.isFetching);
  const showLoadMoreSkeletons = isFetchingNextPage;

  const header = (
    <DashboardPageHeader
      title={t("questionBankPreviewAll.title")}
      description={t("questionBankPreviewAll.description")}
      breadcrumbs={[
        { label: t("questionBank.title"), href: ROUTES.ADMIN.QUESTION_BANK.LIST },
        { label: t("questionBankPreviewAll.breadcrumbs.addNewQuestion") },
      ]}
      action={
        <Button
          type="button"
          className="dashboard-raised-button h-14 rounded-2xl bg-[#243B5A] px-6 text-base font-semibold text-white hover:bg-[#1D314B] cursor-pointer"
          style={{ boxShadow: "0px 4px 0px 0px #1E2E42" }}
          onClick={() => router.push(ROUTES.ADMIN.QUESTION_BANK.ADD)}
        >
          <Save className="h-4 w-4" aria-hidden />
          {t("questionBankPreviewAll.actions.addNewQuestion")}
        </Button>
      }
    />
  );

  const listSection = (
    <section className="space-y-4" aria-busy={showListSkeletons || showLoadMoreSkeletons}>
      {isListError ? (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-10 text-center text-red-500">
          {t("questionBankPreviewAll.list.loadError")}
        </div>
      ) : showListSkeletons ? (
        Array.from({ length: CARD_SKELETON_COUNT }).map((_, index) => (
          <QuestionBankQuestionPreviewCardSkeleton key={`list-skeleton-${index}`} />
        ))
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-slate-100 bg-white p-10 text-center text-slate-500">
          {t("questionBankPreviewAll.list.empty")}
        </div>
      ) : (
        items.map((item) => {
          if (item.isDetailLoading || !item.detail) {
            return <QuestionBankQuestionPreviewCardSkeleton key={item.id} />;
          }

          const detail = item.detail;
          const typeMeta =
            detail.questionType !== null ? questionTypeMap.get(detail.questionType) : undefined;
          const TypeIconComp = pickQuestionTypeIcon(typeMeta?.name);
          const difficultyTone = mapDifficultyTone(detail.difficultyLevel);

          return (
            <QuestionBankQuestionPreviewCard
              key={item.id}
              questionTypeLabel={typeMeta?.label ?? PLACEHOLDER_VALUE}
              questionTypeIcon={TypeIconComp}
              subjectName={detail.subjectName}
              difficultyLabel={
                detail.difficultyLevel !== null
                  ? (difficultyMap.get(detail.difficultyLevel) ?? String(detail.difficultyLevel))
                  : PLACEHOLDER_VALUE
              }
              difficultyTone={difficultyTone}
              questionText={detail.questionText}
              standardAnswerLabel={t("questionBankPreviewAll.card.standardAnswer")}
              standardAnswerValue={deriveStandardAnswer(detail)}
              standardAnswerIcon={TypeIconComp}
              approvalLabel={t("questionBankPreviewAll.card.approved")}
              detailsLabel={t("questionBankPreviewAll.card.actions.details")}
              editLabel={t("questionBankPreviewAll.card.actions.edit")}
              deleteLabel={t("questionBankPreviewAll.card.actions.delete")}
              onDetails={() => handleViewQuestion(item.id)}
              onEdit={() => handleEditQuestion(item.id)}
              onDelete={() =>
                setPendingDelete({ id: item.id, snippet: detail.questionText })
              }
              isDeleting={deletingId === item.id}
            />
          );
        })
      )}

      {showLoadMoreSkeletons
        ? Array.from({ length: CARD_SKELETON_COUNT }).map((_, index) => (
            <QuestionBankQuestionPreviewCardSkeleton key={`next-skeleton-${index}`} />
          ))
        : null}

      {hasNextPage && !isInitialLoading ? (
        <div ref={sentinelRef} aria-hidden className="h-1 w-full" />
      ) : null}
    </section>
  );

  return (
    <div className="space-y-8">
      {header}

      {showFullPageSkeleton ? (
        <QuestionBankPreviewAllPageSkeleton />
      ) : (
        <>
          <QuestionBankAnimatedSection delay={0.02}>
            <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              <DashboardStatCard
                label={t("questionBankPreviewAll.stats.total")}
                value={numberFormatter.format(summary?.totalQuestions ?? 0)}
                indicator=""
                icon={BookOpen}
                iconTone="info"
              />
              <DashboardStatCard
                label={t("questionBankPreviewAll.stats.mcq")}
                value={PLACEHOLDER_VALUE}
                indicator=""
                icon={ListChecks}
                iconTone="success"
              />
              <DashboardStatCard
                label={t("questionBankPreviewAll.stats.trueFalse")}
                value={PLACEHOLDER_VALUE}
                indicator=""
                icon={CheckCircle2}
                iconTone="warning"
                className="[&]:cursor-help"
              />
              <QuestionBankDifficultyStatCard
                label={t("questionBankPreviewAll.stats.difficulty.label")}
                indicator={t("questionBankPreviewAll.stats.difficulty.indicator")}
                easyLabel={t("questionBankPreviewAll.stats.difficulty.easy")}
                mediumLabel={t("questionBankPreviewAll.stats.difficulty.medium")}
                hardLabel={t("questionBankPreviewAll.stats.difficulty.hard")}
                tooltip={t("questionBankPreviewAll.stats.difficulty.tooltip")}
                distribution={{ easy: 20, medium: 80, hard: 100 }}
              />
            </section>
          </QuestionBankAnimatedSection>

          <QuestionBankAnimatedSection delay={0.06}>
            <DashboardFiltersPanel>
              <div className="flex w-full flex-col gap-8">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#243B5A]">
                  <WandSparkles className="h-4 w-4" aria-hidden />
                  {t("questionBankPreviewAll.actions.filterResults")}
                </div>
                <div className="flex flex-1 flex-wrap gap-3">
                  <DashboardFilterSelect
                    label={t("questionBank.filters.subject.label")}
                    value={filters.subject}
                    options={subjectOptions}
                    onChange={(value) =>
                      setFilters((current) => ({ ...current, subject: value }))
                    }
                  />
                  <DashboardFilterSelect
                    label={t("questionBank.filters.difficultyLevel.label")}
                    value={filters.difficultyLevel}
                    options={difficultyOptions}
                    disabled={enumsQuery.isLoading}
                    onChange={(value) =>
                      setFilters((current) => ({ ...current, difficultyLevel: value }))
                    }
                  />
                  <DashboardFilterSelect
                    label={t("questionBank.filters.questionType.label")}
                    value={filters.status}
                    options={questionTypeOptions}
                    disabled={enumsQuery.isLoading}
                    onChange={(value) =>
                      setFilters((current) => ({ ...current, status: value }))
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
                </div>
              </div>
            </DashboardFiltersPanel>
          </QuestionBankAnimatedSection>

          <QuestionBankAnimatedSection delay={0.14}>{listSection}</QuestionBankAnimatedSection>
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
