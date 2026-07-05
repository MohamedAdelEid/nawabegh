"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { friendChallengeQueryKeys } from "@/modules/student/application/constants/friendChallengeQueryKeys";
import type {
  CreateFriendChallengePayload,
  FriendChallengeHistoryTab,
  FriendChallengeSearchOpponent,
} from "@/modules/student/domain/friend-challenge/friend-challenge.types";
import { getHistoryBucket } from "@/modules/student/domain/friend-challenge/friend-challenge.utils";
import {
  acceptFriendChallenge,
  cancelFriendChallenge,
  createFriendChallenge,
  declineFriendChallenge,
  enterFriendChallenge,
  fetchActiveFriendChallengeSession,
  fetchFriendChallengeDetail,
  fetchFriendChallengeHub,
  searchFriendChallengeOpponents,
} from "@/modules/student/infrastructure/api/friendChallenge.api";

export function useFriendChallengeHub() {
  const queryClient = useQueryClient();

  const hubQuery = useQuery({
    queryKey: friendChallengeQueryKeys.hub(),
    queryFn: fetchFriendChallengeHub,
  });

  const activeSessionQuery = useQuery({
    queryKey: friendChallengeQueryKeys.activeSession(),
    queryFn: fetchActiveFriendChallengeSession,
  });

  const refreshAll = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: friendChallengeQueryKeys.hub() }),
      queryClient.invalidateQueries({ queryKey: friendChallengeQueryKeys.activeSession() }),
    ]);
  }, [queryClient]);

  return {
    hubQuery,
    activeSessionQuery,
    refreshAll,
    hub: hubQuery.data,
    isLoading: hubQuery.isLoading,
    errorMessage: hubQuery.error instanceof Error ? hubQuery.error.message : null,
  };
}

export function useFriendChallengeDetail(challengeId: string, enabled = true) {
  return useQuery({
    queryKey: friendChallengeQueryKeys.detail(challengeId),
    queryFn: () => fetchFriendChallengeDetail(challengeId),
    enabled: enabled && Boolean(challengeId),
    refetchInterval: 30_000,
  });
}

export function useFriendChallengeOpponentSearch(keyword: string) {
  const trimmed = keyword.trim();
  return useQuery({
    queryKey: friendChallengeQueryKeys.opponents(trimmed),
    queryFn: () => searchFriendChallengeOpponents(trimmed),
    enabled: trimmed.length >= 2,
  });
}

export function useFriendChallengeMutations() {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: friendChallengeQueryKeys.all });

  const acceptMutation = useMutation({
    mutationFn: acceptFriendChallenge,
    onSuccess: invalidate,
  });

  const declineMutation = useMutation({
    mutationFn: declineFriendChallenge,
    onSuccess: invalidate,
  });

  const cancelMutation = useMutation({
    mutationFn: cancelFriendChallenge,
    onSuccess: invalidate,
  });

  const createMutation = useMutation({
    mutationFn: createFriendChallenge,
    onSuccess: invalidate,
  });

  const enterMutation = useMutation({
    mutationFn: ({ challengeId }: { challengeId: string }) => enterFriendChallenge(challengeId),
    onSuccess: invalidate,
  });

  return {
    acceptMutation,
    declineMutation,
    cancelMutation,
    createMutation,
    enterMutation,
  };
}

export function useFriendChallengeHistory(tab: FriendChallengeHistoryTab) {
  const { hub, isLoading, errorMessage, refreshAll } = useFriendChallengeHub();
  const items = useMemo(() => (hub ? getHistoryBucket(hub, tab) : []), [hub, tab]);
  return { items, hub, isLoading, errorMessage, refreshAll };
}

export type CreateChallengeFormState = {
  opponent: FriendChallengeSearchOpponent | null;
  title: string;
  subjectId: number | null;
  difficulty: 0 | 1 | 2;
  questionCount: number;
  challengeDate: string;
  startTime: string;
};

export function useCreateChallengeForm() {
  const [form, setForm] = useState<CreateChallengeFormState>({
    opponent: null,
    title: "",
    subjectId: null,
    difficulty: 1,
    questionCount: 10,
    challengeDate: "",
    startTime: "12:00:00",
  });

  const buildPayload = useCallback((): CreateFriendChallengePayload | null => {
    if (!form.opponent || !form.subjectId || !form.title.trim() || !form.challengeDate) {
      return null;
    }
    return {
      inviteeStudentId: form.opponent.studentUserId,
      title: form.title.trim(),
      subjectId: form.subjectId,
      difficulty: form.difficulty,
      questionCount: form.questionCount,
      challengeDate: form.challengeDate,
      startTime: form.startTime,
      timeZoneId:
        typeof Intl !== "undefined"
          ? Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Amman"
          : "Asia/Amman",
    };
  }, [form]);

  return { form, setForm, buildPayload };
}
