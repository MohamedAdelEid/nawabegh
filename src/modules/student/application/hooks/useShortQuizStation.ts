"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { shortQuizQueryKeys } from "@/modules/student/application/constants/shortQuizQueryKeys";
import { progressQueryKeys } from "@/modules/student/application/constants/progressQueryKeys";
import {
  canRetryAttempt,
  isAttemptFinalized,
  resolveInitialQuestionIndex,
} from "@/modules/student/domain/short-quiz/short-quiz.utils";
import type {
  ShortQuizAttemptDto,
  ShortQuizStationResultDto,
} from "@/modules/student/domain/short-quiz/short-quiz.types";
import {
  getShortQuizAttempt,
  getShortQuizStationIntro,
  saveShortQuizAnswer,
  submitShortQuizAttempt,
} from "@/modules/student/infrastructure/api/shortQuiz.api";

const RESULT_STORAGE_KEY = (stationId: string) =>
  `nawabegh:short-quiz-result:${stationId}`;

function readStoredResult(stationId: string): ShortQuizStationResultDto | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(RESULT_STORAGE_KEY(stationId));
    if (!raw) return null;
    return JSON.parse(raw) as ShortQuizStationResultDto;
  } catch {
    return null;
  }
}

function writeStoredResult(stationId: string, result: ShortQuizStationResultDto) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(RESULT_STORAGE_KEY(stationId), JSON.stringify(result));
  } catch {
    // ignore quota
  }
}

type UseShortQuizIntroOptions = {
  stationId: string;
  enabled?: boolean;
};

export function useShortQuizIntro({
  stationId,
  enabled = true,
}: UseShortQuizIntroOptions) {
  return useQuery({
    queryKey: shortQuizQueryKeys.intro(stationId),
    queryFn: () => getShortQuizStationIntro(stationId),
    enabled: Boolean(stationId) && enabled,
    staleTime: 60_000,
  });
}

type UseShortQuizAttemptOptions = {
  stationId: string;
  enabled?: boolean;
};

export function useShortQuizAttemptSession({
  stationId,
  enabled = true,
}: UseShortQuizAttemptOptions) {
  const queryClient = useQueryClient();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [result, setResult] = useState<ShortQuizStationResultDto | null>(() =>
    readStoredResult(stationId),
  );
  const initializedRef = useRef(false);
  const submittingRef = useRef(false);

  const attemptQuery = useQuery({
    queryKey: shortQuizQueryKeys.attempt(stationId),
    queryFn: () => getShortQuizAttempt(stationId),
    enabled: Boolean(stationId) && enabled,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });

  const applyAttempt = useCallback(
    (attempt: ShortQuizAttemptDto) => {
      queryClient.setQueryData(shortQuizQueryKeys.attempt(stationId), attempt);
      setRemainingSeconds(attempt.remainingSeconds);
      if (isAttemptFinalized(attempt)) {
        const stored: ShortQuizStationResultDto = {
          attempt,
          pointsReward: 0,
          stationRank: null,
          stationRankTotal: null,
          completion: null,
        };
        setResult((prev) => prev ?? stored);
      }
    },
    [queryClient, stationId],
  );

  useEffect(() => {
    if (!attemptQuery.data || initializedRef.current) return;
    initializedRef.current = true;
    setCurrentIndex(resolveInitialQuestionIndex(attemptQuery.data));
    setRemainingSeconds(attemptQuery.data.remainingSeconds);
    if (isAttemptFinalized(attemptQuery.data)) {
      const stored = readStoredResult(stationId);
      if (stored) setResult(stored);
      else {
        setResult({
          attempt: attemptQuery.data,
          pointsReward: 0,
          stationRank: null,
          stationRankTotal: null,
          completion: null,
        });
      }
      return;
    }
    // Active draft — ignore any stale finalized result from a previous attempt.
    setResult(null);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(RESULT_STORAGE_KEY(stationId));
    }
  }, [attemptQuery.data, stationId]);

  const saveMutation = useMutation({
    mutationFn: (payload: { questionId: string; selectedOptionId: string }) =>
      saveShortQuizAnswer(stationId, payload),
    onSuccess: (attempt) => {
      applyAttempt(attempt);
    },
  });

  const submitMutation = useMutation({
    mutationFn: () => submitShortQuizAttempt(stationId),
    onSuccess: (payload) => {
      writeStoredResult(stationId, payload);
      setResult(payload);
      applyAttempt(payload.attempt);
      setSubmitOpen(false);
      void queryClient.invalidateQueries({ queryKey: progressQueryKeys.dashboard() });
      void queryClient.invalidateQueries({ queryKey: ["student-path-stations"] });
      void queryClient.invalidateQueries({ queryKey: ["student-course-progress"] });
    },
  });

  const selectOption = useCallback(
    (questionId: string, selectedOptionId: string) => {
      const previous = queryClient.getQueryData<ShortQuizAttemptDto>(
        shortQuizQueryKeys.attempt(stationId),
      );
      if (previous) {
        const optimistic: ShortQuizAttemptDto = {
          ...previous,
          questions: previous.questions.map((question) =>
            question.id === questionId
              ? { ...question, selectedOptionId }
              : question,
          ),
          answeredQuestionsCount: previous.questions.filter((question) =>
            question.id === questionId
              ? true
              : Boolean(question.selectedOptionId),
          ).length,
        };
        queryClient.setQueryData(shortQuizQueryKeys.attempt(stationId), optimistic);
      }
      saveMutation.mutate({ questionId, selectedOptionId });
    },
    [queryClient, saveMutation, stationId],
  );

  const submit = useCallback(async () => {
    if (submittingRef.current || submitMutation.isPending) return;
    submittingRef.current = true;
    try {
      await submitMutation.mutateAsync();
    } finally {
      submittingRef.current = false;
    }
  }, [submitMutation]);

  useEffect(() => {
    if (!enabled || !attemptQuery.data) return;
    if (isAttemptFinalized(attemptQuery.data)) return;

    const timer = window.setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [attemptQuery.data, enabled]);

  useEffect(() => {
    if (!enabled || !attemptQuery.data) return;
    if (isAttemptFinalized(attemptQuery.data)) return;
    if (remainingSeconds === 0 && attemptQuery.data.remainingSeconds > 0) {
      void submit();
    }
  }, [attemptQuery.data, enabled, remainingSeconds, submit]);

  const attempt = attemptQuery.data ?? null;
  const questions = attempt?.questions ?? [];
  const currentQuestion = questions[currentIndex] ?? null;

  const goToQuestion = (index: number) => {
    if (index < 0 || index >= questions.length) return;
    setCurrentIndex(index);
  };

  const goNext = () => {
    if (currentIndex >= questions.length - 1) {
      setSubmitOpen(true);
      return;
    }
    setCurrentIndex((prev) => Math.min(prev + 1, questions.length - 1));
  };

  const goPrev = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const retry = async () => {
    initializedRef.current = false;
    setResult(null);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(RESULT_STORAGE_KEY(stationId));
    }
    await queryClient.invalidateQueries({
      queryKey: shortQuizQueryKeys.attempt(stationId),
    });
  };

  return {
    attemptQuery,
    attempt,
    questions,
    currentIndex,
    currentQuestion,
    remainingSeconds,
    submitOpen,
    setSubmitOpen,
    result,
    selectOption,
    goToQuestion,
    goNext,
    goPrev,
    submit,
    retry,
    canRetry: result ? canRetryAttempt(result.attempt) : false,
    isSaving: saveMutation.isPending,
    isSubmitting: submitMutation.isPending,
    saveError:
      saveMutation.error instanceof Error ? saveMutation.error.message : null,
    submitError:
      submitMutation.error instanceof Error ? submitMutation.error.message : null,
  };
}

export function useShortQuizResult(stationId: string) {
  const [result, setResult] = useState<ShortQuizStationResultDto | null>(() =>
    readStoredResult(stationId),
  );

  const attemptQuery = useQuery({
    queryKey: shortQuizQueryKeys.attempt(stationId),
    queryFn: () => getShortQuizAttempt(stationId),
    enabled: Boolean(stationId) && !result,
    staleTime: 30_000,
  });

  useEffect(() => {
    if (result) return;
    const stored = readStoredResult(stationId);
    if (stored) {
      setResult(stored);
      return;
    }
    if (attemptQuery.data && isAttemptFinalized(attemptQuery.data)) {
      setResult({
        attempt: attemptQuery.data,
        pointsReward: 0,
        stationRank: null,
        stationRankTotal: null,
        completion: null,
      });
    }
  }, [attemptQuery.data, result, stationId]);

  return {
    result,
    isLoading: !result && attemptQuery.isLoading,
    error:
      attemptQuery.error instanceof Error ? attemptQuery.error.message : null,
    refetch: attemptQuery.refetch,
  };
}
