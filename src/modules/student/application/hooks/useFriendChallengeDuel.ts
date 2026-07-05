"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { friendChallengeQueryKeys } from "@/modules/student/application/constants/friendChallengeQueryKeys";
import type { FriendChallengeQuestion } from "@/modules/student/domain/friend-challenge/friend-challenge.types";
import {
  fetchFriendChallengeQuestions,
  fetchFriendChallengeSession,
  fetchFriendChallengeSessionResult,
  finishFriendChallengeSession,
  forfeitFriendChallengeSession,
  submitFriendChallengeAnswer,
} from "@/modules/student/infrastructure/api/friendChallenge.api";

export function useFriendChallengeSession(sessionId: string, pollMs = 4000) {
  return useQuery({
    queryKey: friendChallengeQueryKeys.session(sessionId),
    queryFn: () => fetchFriendChallengeSession(sessionId),
    enabled: Boolean(sessionId),
    refetchInterval: pollMs,
  });
}

export function useFriendChallengeQuestions(sessionId: string, enabled = true) {
  return useQuery({
    queryKey: friendChallengeQueryKeys.questions(sessionId),
    queryFn: () => fetchFriendChallengeQuestions(sessionId),
    enabled: enabled && Boolean(sessionId),
    staleTime: Infinity,
  });
}

export function useFriendChallengeResult(sessionId: string, enabled = true) {
  return useQuery({
    queryKey: friendChallengeQueryKeys.result(sessionId),
    queryFn: () => fetchFriendChallengeSessionResult(sessionId),
    enabled: enabled && Boolean(sessionId),
  });
}

export function useFriendChallengeDuel(sessionId: string, currentUserId?: string) {
  const queryClient = useQueryClient();
  const sessionQuery = useFriendChallengeSession(sessionId);
  const questionsQuery = useFriendChallengeQuestions(
    sessionId,
    sessionQuery.data?.phase === "InProgress",
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [myScore, setMyScore] = useState(0);
  const [answeredIds, setAnsweredIds] = useState<Set<string>>(new Set());
  const questionStartedAt = useRef<number>(Date.now());
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);

  const questions: FriendChallengeQuestion[] = useMemo(
    () => questionsQuery.data?.questions ?? [],
    [questionsQuery.data?.questions],
  );

  const currentQuestion = questions[currentIndex] ?? null;

  useEffect(() => {
    questionStartedAt.current = Date.now();
  }, [currentQuestion?.questionId]);

  const answerMutation = useMutation({
    mutationFn: ({ questionId, optionId }: { questionId: string; optionId: string }) =>
      submitFriendChallengeAnswer(sessionId, questionId, optionId),
    onSuccess: (result, variables) => {
      setMyScore(result.totalScore);
      setAnsweredIds((prev) => new Set(prev).add(variables.questionId));
      if (result.allQuestionsAnswered) {
        void finishMutation.mutateAsync();
        return;
      }
      setCurrentIndex((index) => Math.min(index + 1, questions.length - 1));
    },
  });

  const finishMutation = useMutation({
    mutationFn: () => finishFriendChallengeSession(sessionId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: friendChallengeQueryKeys.session(sessionId) });
    },
  });

  const forfeitMutation = useMutation({
    mutationFn: () => forfeitFriendChallengeSession(sessionId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: friendChallengeQueryKeys.all });
    },
  });

  const selectOption = useCallback(
    async (optionId: string) => {
      if (!currentQuestion || isSubmittingAnswer || answeredIds.has(currentQuestion.questionId)) {
        return;
      }
      setIsSubmittingAnswer(true);
      try {
        await answerMutation.mutateAsync({
          questionId: currentQuestion.questionId,
          optionId,
        });
      } finally {
        setIsSubmittingAnswer(false);
      }
    },
    [answerMutation, answeredIds, currentQuestion, isSubmittingAnswer],
  );

  const myParticipant = sessionQuery.data?.participants.find(
    (participant) => participant.studentId === currentUserId,
  );
  const opponentParticipant = sessionQuery.data?.participants.find(
    (participant) => participant.studentId !== currentUserId,
  );

  const displayMyScore = myParticipant?.totalScore ?? myScore;
  const displayOpponentScore = opponentParticipant?.totalScore ?? 0;

  return {
    sessionQuery,
    questionsQuery,
    questions,
    currentQuestion,
    currentIndex,
    totalQuestions: questions.length,
    selectOption,
    isSubmittingAnswer,
    finishMutation,
    forfeitMutation,
    displayMyScore,
    displayOpponentScore,
    myParticipant,
    opponentParticipant,
    phase: sessionQuery.data?.phase,
  };
}
