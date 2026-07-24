"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import {
  getAdminOnboardingQuiz,
  toUpdateAdminOnboardingQuizPayload,
  updateAdminOnboardingQuiz,
} from "@/modules/admin/infrastructure/api/adminOnboardingQuizApi";
import { getEducationLevels } from "@/modules/admin/infrastructure/api/educationLevelsApi";
import { getGrades } from "@/modules/admin/infrastructure/api/gradesApi";
import type {
  AdminOnboardingQuiz,
  AdminOnboardingQuizQuestion,
} from "@/modules/admin/domain/types/adminOnboardingQuiz.types";

export type OnboardingQuizScopeFilters = {
  educationLevelId: string;
  gradeId: string;
  term: string;
};

const INITIAL_FILTERS: OnboardingQuizScopeFilters = {
  educationLevelId: "",
  gradeId: "",
  term: "1",
};

function parseScope(filters: OnboardingQuizScopeFilters) {
  const educationLevelId = Number(filters.educationLevelId);
  const gradeId = Number(filters.gradeId);
  const term = Number(filters.term);

  if (
    !filters.educationLevelId ||
    !filters.gradeId ||
    Number.isNaN(educationLevelId) ||
    Number.isNaN(gradeId) ||
    (term !== 1 && term !== 2)
  ) {
    return null;
  }

  return { educationLevelId, gradeId, term };
}

export function useAdminOnboardingQuizPreview() {
  const locale = useLocale();
  const [filters, setFilters] = useState<OnboardingQuizScopeFilters>(INITIAL_FILTERS);
  const [draft, setDraft] = useState<AdminOnboardingQuiz | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const scope = useMemo(() => parseScope(filters), [filters]);

  const educationLevelsQuery = useQuery({
    queryKey: ["admin", "onboarding-quiz", "education-levels", locale],
    queryFn: async () => {
      const result = await getEducationLevels({ pageNumber: 1, pageSize: 200 });
      if (result.errorMessage) throw new Error(result.errorMessage);
      return result.data?.rows ?? [];
    },
  });

  const gradesQuery = useQuery({
    queryKey: ["admin", "onboarding-quiz", "grades", filters.educationLevelId, locale],
    enabled: Boolean(filters.educationLevelId),
    queryFn: async () => {
      const educationLevelId = Number(filters.educationLevelId);
      const result = await getGrades({
        educationLevelId,
        pageNumber: 1,
        pageSize: 200,
      });
      if (result.errorMessage) throw new Error(result.errorMessage);
      return result.data?.rows ?? [];
    },
  });

  const quizQuery = useQuery({
    queryKey: [
      "admin",
      "onboarding-quiz",
      scope?.educationLevelId,
      scope?.gradeId,
      scope?.term,
      locale,
    ],
    enabled: scope != null,
    queryFn: async () => {
      if (!scope) return null;
      const result = await getAdminOnboardingQuiz(scope);
      if (result.errorMessage || !result.data) {
        throw new Error(result.errorMessage || "Failed to load onboarding quiz");
      }
      return result.data;
    },
  });

  useEffect(() => {
    if (!quizQuery.data) {
      if (!scope) {
        setDraft(null);
        setIsDirty(false);
      }
      return;
    }
    setDraft(quizQuery.data);
    setIsDirty(false);
  }, [quizQuery.data, scope]);

  const setEducationLevelId = useCallback((educationLevelId: string) => {
    setFilters((current) => ({
      ...current,
      educationLevelId,
      gradeId: "",
    }));
    setDraft(null);
    setIsDirty(false);
  }, []);

  const setGradeId = useCallback((gradeId: string) => {
    setFilters((current) => ({ ...current, gradeId }));
    setDraft(null);
    setIsDirty(false);
  }, []);

  const setTerm = useCallback((term: string) => {
    setFilters((current) => ({ ...current, term }));
    setDraft(null);
    setIsDirty(false);
  }, []);

  const applyQuestionEdit = useCallback((updated: AdminOnboardingQuizQuestion) => {
    setDraft((current) => {
      if (!current) return current;
      return {
        ...current,
        questions: current.questions.map((question) =>
          question.order === updated.order ? updated : question,
        ),
      };
    });
    setIsDirty(true);
  }, []);

  const saveAll = useCallback(async () => {
    if (!draft) {
      return { ok: false as const, message: undefined };
    }

    setIsSaving(true);
    const result = await updateAdminOnboardingQuiz(toUpdateAdminOnboardingQuizPayload(draft));
    setIsSaving(false);

    if (result.errorMessage || !result.data) {
      return { ok: false as const, message: result.errorMessage };
    }

    setDraft(result.data);
    setIsDirty(false);
    await quizQuery.refetch();
    return { ok: true as const, message: result.message };
  }, [draft, quizQuery]);

  const educationLevelOptions = useMemo(
    () =>
      (educationLevelsQuery.data ?? []).map((level) => ({
        value: String(level.id),
        label: locale.startsWith("ar") ? level.nameAr : level.nameEn,
      })),
    [educationLevelsQuery.data, locale],
  );

  const gradeOptions = useMemo(
    () =>
      (gradesQuery.data ?? []).map((grade) => ({
        value: String(grade.id),
        label: locale.startsWith("ar") ? grade.nameAr : grade.nameEn,
      })),
    [gradesQuery.data, locale],
  );

  return {
    filters,
    scope,
    draft,
    isDirty,
    isSaving,
    educationLevelOptions,
    gradeOptions,
    educationLevelsLoading: educationLevelsQuery.isLoading,
    gradesLoading: gradesQuery.isLoading,
    quizQuery,
    setEducationLevelId,
    setGradeId,
    setTerm,
    applyQuestionEdit,
    saveAll,
  };
}
