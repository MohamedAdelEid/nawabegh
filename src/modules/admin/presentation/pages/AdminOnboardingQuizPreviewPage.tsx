"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { QuestionType } from "@/shared/domain/enums/question.enums";
import { notify } from "@/shared/application/lib/toast";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import {
  DashboardFiltersPanel,
  DashboardFilterSelect,
  DashboardPageHeader,
} from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";
import { useAdminOnboardingQuizPreview } from "@/modules/admin/application/hooks/useAdminOnboardingQuizPreview";
import type { AdminOnboardingQuizQuestion } from "@/modules/admin/domain/types/adminOnboardingQuiz.types";
import {
  OnboardingQuizEditQuestionModal,
  OnboardingQuizPreviewPageSkeleton,
  OnboardingQuizQuestionCard,
  OnboardingQuizQuestionCardSkeleton,
  QuestionBankAnimatedSection,
} from "@/modules/admin/presentation/components/question-bank";

export function AdminOnboardingQuizPreviewPage() {
  const t = useTranslations("admin.dashboard.questionBankOnboardingQuiz");
  const router = useRouter();
  const {
    filters,
    scope,
    draft,
    isDirty,
    isSaving,
    educationLevelOptions,
    gradeOptions,
    educationLevelsLoading,
    gradesLoading,
    quizQuery,
    setEducationLevelId,
    setGradeId,
    setTerm,
    applyQuestionEdit,
    saveAll,
  } = useAdminOnboardingQuizPreview();

  const [editingQuestion, setEditingQuestion] = useState<AdminOnboardingQuizQuestion | null>(
    null,
  );

  const educationLevelSelectOptions = [
    { id: "", label: t("filters.educationLevel.placeholder") },
    ...educationLevelOptions.map((option) => ({ id: option.value, label: option.label })),
  ];

  const gradeSelectOptions = [
    { id: "", label: t("filters.grade.placeholder") },
    ...gradeOptions.map((option) => ({ id: option.value, label: option.label })),
  ];

  const termSelectOptions = [
    { id: "1", label: t("filters.term.term1") },
    { id: "2", label: t("filters.term.term2") },
  ];

  const handleSave = async () => {
    if (!isDirty) {
      notify.info(t("saveDisabledHint"));
      return;
    }
    const result = await saveAll();
    if (!result.ok) {
      notify.error(result.message ?? t("saveError"));
      return;
    }
    notify.success(result.message ?? t("saveSuccess"));
  };

  const typeLabel = (type: QuestionType) =>
    type === QuestionType.TrueOrFalse ? t("types.trueOrFalse") : t("types.multipleChoice");

  const showInitialSkeleton =
    educationLevelsLoading || (Boolean(scope) && quizQuery.isLoading && !draft);

  if (showInitialSkeleton) {
    return <OnboardingQuizPreviewPageSkeleton />;
  }

  return (
    <div className="space-y-8">
      <DashboardPageHeader
        title={t("title")}
        description={t("description")}
        breadcrumbs={[
          { label: t("breadcrumbs.home"), href: ROUTES.ADMIN.HOME },
          { label: t("breadcrumbs.questionBank"), href: ROUTES.ADMIN.QUESTION_BANK.LIST },
          { label: t("breadcrumbs.current") },
        ]}
        action={
          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              className="h-14 rounded-2xl px-5 text-base font-semibold text-slate-500 hover:bg-slate-50 cursor-pointer"
              onClick={() => router.push(ROUTES.ADMIN.QUESTION_BANK.LIST)}
            >
              {t("actions.back")}
            </Button>
            <Button
              type="button"
              disabled={!draft || !isDirty || isSaving}
              className="dashboard-raised-button h-14 rounded-2xl bg-[#243B5A] px-6 text-base font-semibold text-white hover:bg-[#1D314B] disabled:opacity-50 cursor-pointer"
              style={{ boxShadow: "0px 4px 0px 0px #1E2E42" }}
              onClick={() => void handleSave()}
            >
              {t("actions.saveChanges")}
            </Button>
          </div>
        }
      />

      <QuestionBankAnimatedSection delay={0.02}>
        <DashboardFiltersPanel>
          <DashboardFilterSelect
            label={t("filters.educationLevel.label")}
            value={filters.educationLevelId}
            options={educationLevelSelectOptions}
            disabled={educationLevelsLoading}
            onChange={setEducationLevelId}
          />
          <DashboardFilterSelect
            label={t("filters.grade.label")}
            value={filters.gradeId}
            options={gradeSelectOptions}
            disabled={!filters.educationLevelId || gradesLoading}
            onChange={setGradeId}
          />
          <DashboardFilterSelect
            label={t("filters.term.label")}
            value={filters.term}
            options={termSelectOptions}
            onChange={setTerm}
          />
        </DashboardFiltersPanel>
      </QuestionBankAnimatedSection>

      {!scope ? (
        <QuestionBankAnimatedSection delay={0.06}>
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center text-sm font-medium text-slate-500">
            {t("emptyScope")}
          </div>
        </QuestionBankAnimatedSection>
      ) : quizQuery.isFetching && !draft ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <OnboardingQuizQuestionCardSkeleton key={index} />
          ))}
        </div>
      ) : quizQuery.isError ? (
        <QuestionBankAnimatedSection delay={0.06}>
          <div className="rounded-2xl border border-red-100 bg-red-50 px-6 py-12 text-center text-sm font-medium text-red-600">
            {quizQuery.error instanceof Error ? quizQuery.error.message : t("loadError")}
          </div>
        </QuestionBankAnimatedSection>
      ) : !draft?.questions.length ? (
        <QuestionBankAnimatedSection delay={0.06}>
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center text-sm font-medium text-slate-500">
            {t("empty")}
          </div>
        </QuestionBankAnimatedSection>
      ) : (
        <div className="space-y-4">
          {draft.questions.map((question, index) => (
            <QuestionBankAnimatedSection key={question.id ?? question.order} delay={0.04 + index * 0.04}>
              <OnboardingQuizQuestionCard
                question={question}
                typeLabel={typeLabel(question.type)}
                correctAnswerLabel={t("correctAnswer")}
                editLabel={t("actions.edit")}
                onEdit={() => setEditingQuestion(question)}
              />
            </QuestionBankAnimatedSection>
          ))}
        </div>
      )}

      <OnboardingQuizEditQuestionModal
        open={editingQuestion != null}
        question={editingQuestion}
        onClose={() => setEditingQuestion(null)}
        onApply={applyQuestionEdit}
      />
    </div>
  );
}
