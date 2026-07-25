"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { schoolEventsQueryKeys } from "@/modules/student/application/constants/schoolEventsQueryKeys";
import type {
  SchoolEventLiveDashboard,
  SchoolEventLiveTab,
} from "@/modules/student/domain/types/schoolEvent.types";
import { isValidStudentSchoolEventId } from "@/modules/student/domain/utils/schoolEventId";
import {
  getStudentSchoolEventActivity,
  getStudentSchoolEventHonorBoard,
  getStudentSchoolEventLive,
  getStudentSchoolEventMatches,
  getStudentSchoolEventStandings,
  voteStudentSchoolEventPoll,
} from "@/modules/student/infrastructure/api/schoolEvents.api";

export type SchoolEventLiveInitialData = {
  dashboard: SchoolEventLiveDashboard;
};

type UseSchoolEventLiveOptions = {
  eventId: string;
  initial?: SchoolEventLiveInitialData;
  enabled?: boolean;
};

function formatTimer(totalSeconds: number, fallback = ""): string {
  if (fallback) return fallback;
  const safe = Math.max(0, totalSeconds);
  const minutes = Math.floor(safe / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (safe % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export function useSchoolEventLive({
  eventId,
  initial,
  enabled = true,
}: UseSchoolEventLiveOptions) {
  const queryClient = useQueryClient();
  const eventIdValid = isValidStudentSchoolEventId(eventId);
  const queriesEnabled = enabled && eventIdValid;
  const [activeTab, setActiveTab] = useState<SchoolEventLiveTab>("live");
  const [showFullStandings, setShowFullStandings] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(
    initial?.dashboard.score?.timerSeconds ?? 0,
  );

  const liveQuery = useQuery({
    queryKey: schoolEventsQueryKeys.live(eventId),
    queryFn: () => getStudentSchoolEventLive(eventId),
    enabled: queriesEnabled,
    initialData: queriesEnabled ? initial?.dashboard : undefined,
    staleTime: 5_000,
    refetchInterval: (query) => (query.state.data?.hero.isLive ? 8_000 : false),
  });

  const matchesQuery = useQuery({
    queryKey: schoolEventsQueryKeys.matches(eventId),
    queryFn: () => getStudentSchoolEventMatches(eventId),
    enabled: queriesEnabled && activeTab === "matches",
    staleTime: 15_000,
  });

  const honorQuery = useQuery({
    queryKey: schoolEventsQueryKeys.honorBoard(eventId),
    queryFn: () => getStudentSchoolEventHonorBoard(eventId),
    enabled: queriesEnabled && activeTab === "honorBoard",
    staleTime: 15_000,
  });

  const standingsQuery = useQuery({
    queryKey: schoolEventsQueryKeys.standings(eventId),
    queryFn: () => getStudentSchoolEventStandings(eventId),
    enabled: queriesEnabled && showFullStandings,
    staleTime: 15_000,
  });

  const activityQuery = useQuery({
    queryKey: schoolEventsQueryKeys.activity(eventId),
    queryFn: () => getStudentSchoolEventActivity(eventId),
    enabled: false,
  });

  const dashboard = liveQuery.data;
  const score = dashboard?.score ?? null;

  useEffect(() => {
    if (score?.timerSeconds != null) {
      setRemainingSeconds(score.timerSeconds);
    }
  }, [score?.timerSeconds, score?.matchId]);

  useEffect(() => {
    if (!dashboard?.hero.isLive) return;
    const id = window.setInterval(() => {
      setRemainingSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [dashboard?.hero.isLive, score?.matchId]);

  const voteMutation = useMutation({
    mutationFn: (optionId: string | number) => {
      if (!dashboard?.poll) {
        return Promise.reject(new Error("No active poll"));
      }
      return voteStudentSchoolEventPoll(eventId, dashboard.poll.id, optionId);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: schoolEventsQueryKeys.live(eventId),
      });
      await queryClient.invalidateQueries({
        queryKey: schoolEventsQueryKeys.poll(eventId),
      });
    },
  });

  const refreshFeed = async () => {
    const items = await activityQuery.refetch();
    if (items.data) {
      queryClient.setQueryData<SchoolEventLiveDashboard>(
        schoolEventsQueryKeys.live(eventId),
        (current) => (current ? { ...current, feed: items.data } : current),
      );
    } else {
      await liveQuery.refetch();
    }
  };

  return {
    liveQuery,
    matchesQuery,
    honorQuery,
    standingsQuery,
    dashboard,
    activeTab,
    setActiveTab,
    showFullStandings,
    setShowFullStandings,
    remainingSeconds,
    timerLabel: formatTimer(remainingSeconds, score?.timerLabel ?? ""),
    refreshFeed,
    isRefreshingFeed: activityQuery.isFetching || liveQuery.isFetching,
    votePoll: (optionId: string | number) => voteMutation.mutate(optionId),
    isVoting: voteMutation.isPending,
  };
}
