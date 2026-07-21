"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { schoolEventsQueryKeys } from "@/modules/student/application/constants/schoolEventsQueryKeys";
import type {
  SchoolEventLiveDashboard,
  SchoolEventLiveTab,
} from "@/modules/student/domain/types/schoolEvent.types";
import {
  getSchoolEventLiveDashboard,
  voteSchoolEventPoll,
} from "@/modules/student/infrastructure/api/schoolEvents.api";

export type SchoolEventLiveInitialData = {
  dashboard: SchoolEventLiveDashboard;
};

type UseSchoolEventLiveOptions = {
  eventId: string;
  initial?: SchoolEventLiveInitialData;
};

function formatTimer(totalSeconds: number): string {
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
}: UseSchoolEventLiveOptions) {
  const locale = useLocale();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<SchoolEventLiveTab>("live");
  const [remainingSeconds, setRemainingSeconds] = useState(
    initial?.dashboard.currentMatch.remainingSeconds ?? 0,
  );

  const liveQuery = useQuery({
    queryKey: schoolEventsQueryKeys.live(locale, eventId),
    queryFn: () => getSchoolEventLiveDashboard(eventId, locale),
    initialData: initial?.dashboard,
    staleTime: 5_000,
    refetchInterval: (query) => (query.state.data?.isLive ? 8_000 : false),
  });

  const dashboard = liveQuery.data;

  useEffect(() => {
    if (dashboard?.currentMatch.remainingSeconds != null) {
      setRemainingSeconds(dashboard.currentMatch.remainingSeconds);
    }
  }, [dashboard?.currentMatch.remainingSeconds, dashboard?.generatedAtUtc]);

  useEffect(() => {
    if (!dashboard?.isLive) return;
    const id = window.setInterval(() => {
      setRemainingSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [dashboard?.isLive]);

  const voteMutation = useMutation({
    mutationFn: (optionId: string) => {
      if (!dashboard?.activePoll) {
        return Promise.reject(new Error("No active poll"));
      }
      return voteSchoolEventPoll({
        eventId,
        pollId: dashboard.activePoll.pollId,
        optionId,
        locale,
      });
    },
    onSuccess: (next) => {
      queryClient.setQueryData(schoolEventsQueryKeys.live(locale, eventId), next);
    },
  });

  const refreshFeed = () => {
    void liveQuery.refetch();
  };

  return {
    liveQuery,
    dashboard,
    activeTab,
    setActiveTab,
    remainingSeconds,
    timerLabel: formatTimer(remainingSeconds),
    refreshFeed,
    votePoll: (optionId: string) => voteMutation.mutate(optionId),
    isVoting: voteMutation.isPending,
  };
}
