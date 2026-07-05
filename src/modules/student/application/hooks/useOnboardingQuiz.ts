"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { onboardingQuizQueryKeys } from "@/modules/student/application/constants/onboardingQuizQueryKeys";
import {
  buildSubmitAnswers,
  canSubmitQuiz,
  sortQuestions,
} from "@/modules/student/application/lib/onboardingQuiz.utils";
import type {
  OnboardingQuizSelections,
  SubmitOnboardingQuizResponse,
} from "@/modules/student/domain/types/onboarding-quiz.types";
import {
  fetchOnboardingQuiz,
  submitOnboardingQuiz,
} from "@/modules/student/infrastructure/api/onboardingQuizApi";

export function useOnboardingQuizQuery(enabled = true) {
  return useQuery({
    queryKey: onboardingQuizQueryKeys.quiz(),
    queryFn: fetchOnboardingQuiz,
    enabled,
    retry: false,
  });
}

export function useOnboardingQuizFlow() {
  const queryClient = useQueryClient();
  const quizQuery = useOnboardingQuizQuery();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selections, setSelections] = useState<OnboardingQuizSelections>({});
  const [submitResult, setSubmitResult] = useState<SubmitOnboardingQuizResponse | null>(null);
  const [showReview, setShowReview] = useState(false);

  const questions = useMemo(
    () => sortQuestions(quizQuery.data?.questions ?? []),
    [quizQuery.data?.questions],
  );

  const currentQuestion = questions[currentIndex] ?? null;
  const isLastQuestion = currentIndex >= questions.length - 1;
  const canGoNext = currentQuestion ? Boolean(selections[currentQuestion.id]) : false;
  const canSubmit = canSubmitQuiz(questions, selections);

  const submitMutation = useMutation({
    mutationFn: () => submitOnboardingQuiz(buildSubmitAnswers(questions, selections)),
    onSuccess: (result) => {
      setSubmitResult(result);
      void queryClient.invalidateQueries({ queryKey: onboardingQuizQueryKeys.all });
    },
  });

  const selectOption = useCallback((questionId: string, optionId: string) => {
    setSelections((current) => ({ ...current, [questionId]: optionId }));
  }, []);

  const goNext = useCallback(() => {
    if (!canGoNext) return;
    setCurrentIndex((index) => Math.min(index + 1, questions.length - 1));
  }, [canGoNext, questions.length]);

  const goPrevious = useCallback(() => {
    setCurrentIndex((index) => Math.max(index - 1, 0));
  }, []);

  const submitQuiz = useCallback(async () => {
    if (!canSubmit || submitMutation.isPending) return;
    await submitMutation.mutateAsync();
  }, [canSubmit, submitMutation]);

  return {
    quizQuery,
    questions,
    currentQuestion,
    currentIndex,
    selections,
    selectOption,
    goNext,
    goPrevious,
    isLastQuestion,
    canGoNext,
    canSubmit,
    submitQuiz,
    submitMutation,
    submitResult,
    showReview,
    setShowReview,
  };
}
