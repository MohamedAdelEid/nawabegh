"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import type { HubConnection } from "@microsoft/signalr";
import {
  schoolEventsQueryKeys,
  schoolTeamsQueryKeys,
} from "@/modules/school/application/constants/schoolEventsQueryKeys";
import type {
  SchoolEventLiveDashboard,
  SchoolEventsListParams,
  SchoolTeamRankingsParams,
  UpsertSchoolEventPayload,
  UpsertSchoolTeamPayload,
} from "@/modules/school/domain/types/schoolEvents.types";
import {
  archiveSchoolEvent,
  createSchoolEvent,
  getSchoolEventActivePoll,
  getSchoolEventActivity,
  getSchoolEventDetail,
  getSchoolEventHonorBoard,
  getSchoolEventKpis,
  getSchoolEventLive,
  getSchoolEventMatches,
  getSchoolEventMeta,
  getSchoolEventStandings,
  getSchoolEventsList,
  postSchoolEventActivity,
  publishSchoolEvent,
  updateSchoolEvent,
  uploadSchoolEventImage,
  voteSchoolEventPoll,
} from "@/modules/school/infrastructure/api/schoolEventsApi";
import {
  connectSchoolEventLiveHub,
  disconnectSchoolEventLiveHub,
} from "@/modules/school/infrastructure/realtime/schoolEventLiveHub";
import {
  createSchoolTeam,
  getSchoolTeamMeta,
  getSchoolTeamRankings,
  searchSchoolTeamStudents,
  uploadSchoolTeamLogo,
} from "@/modules/school/infrastructure/api/schoolTeamsApi";
import { useAuth } from "@/shared/application/hooks/useAuth";

function useIsSchool() {
  const auth = useAuth();
  return auth.user?.role === "School";
}

export function useSchoolEventMeta() {
  const enabled = useIsSchool();
  return useQuery({
    queryKey: schoolEventsQueryKeys.meta(),
    queryFn: getSchoolEventMeta,
    enabled,
  });
}

export function useSchoolEventKpis() {
  const enabled = useIsSchool();
  return useQuery({
    queryKey: schoolEventsQueryKeys.kpis(),
    queryFn: getSchoolEventKpis,
    enabled,
  });
}

export function useSchoolEventsList(params: SchoolEventsListParams) {
  const enabled = useIsSchool();
  return useQuery({
    queryKey: schoolEventsQueryKeys.list(params),
    queryFn: () => getSchoolEventsList(params),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useSchoolEventDetail(id?: string | number) {
  const enabled = useIsSchool();
  return useQuery({
    queryKey: schoolEventsQueryKeys.detail(id ?? ""),
    queryFn: () => getSchoolEventDetail(id as string | number),
    enabled: enabled && id != null && String(id).length > 0,
  });
}

export function useSchoolEventLive(id?: string | number) {
  const enabled = useIsSchool();
  const queryClient = useQueryClient();
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  const query = useQuery({
    queryKey: schoolEventsQueryKeys.live(id ?? ""),
    queryFn: () => getSchoolEventLive(id as string | number),
    enabled: enabled && id != null && String(id).length > 0,
    // Polling is the default live transport. SignalR is optional and only
    // enabled when NEXT_PUBLIC_SCHOOL_EVENT_LIVE_HUB=true (hub must be stable).
    refetchInterval: realtimeConnected ? 30_000 : 8_000,
  });

  const connectionRef = useRef<HubConnection | null>(null);
  const hubEnabled =
    process.env.NEXT_PUBLIC_SCHOOL_EVENT_LIVE_HUB === "true" ||
    process.env.NEXT_PUBLIC_SCHOOL_EVENT_LIVE_HUB === "1";

  useEffect(() => {
    if (!hubEnabled || !enabled || id == null || String(id).length === 0) {
      setRealtimeConnected(false);
      return;
    }

    const abortController = new AbortController();
    let cancelled = false;
    setRealtimeConnected(false);

    void connectSchoolEventLiveHub(
      id,
      {
        onScoreUpdated: () => {
          void queryClient.invalidateQueries({ queryKey: schoolEventsQueryKeys.live(id) });
        },
        onFeedItemAdded: () => {
          void queryClient.invalidateQueries({ queryKey: schoolEventsQueryKeys.live(id) });
          void queryClient.invalidateQueries({
            queryKey: [...schoolEventsQueryKeys.all, "activity", String(id)],
          });
        },
        onPollResultsUpdated: () => {
          void queryClient.invalidateQueries({ queryKey: schoolEventsQueryKeys.live(id) });
          void queryClient.invalidateQueries({ queryKey: schoolEventsQueryKeys.poll(id) });
        },
        onMatchTimerTick: (payload) => {
          queryClient.setQueryData<SchoolEventLiveDashboard>(
            schoolEventsQueryKeys.live(id),
            (current) => {
              if (!current?.score) return current;
              const record =
                payload && typeof payload === "object"
                  ? (payload as Record<string, unknown>)
                  : null;
              const timerSeconds =
                typeof record?.timerSeconds === "number"
                  ? record.timerSeconds
                  : typeof record?.remainingSeconds === "number"
                    ? record.remainingSeconds
                    : current.score.timerSeconds;
              const timerLabel =
                typeof record?.timerLabel === "string"
                  ? record.timerLabel
                  : typeof record?.countdown === "string"
                    ? record.countdown
                    : current.score.timerLabel;
              return {
                ...current,
                score: {
                  ...current.score,
                  timerSeconds,
                  timerLabel,
                },
              };
            },
          );
        },
      },
      { signal: abortController.signal },
    )
      .then((connection) => {
        if (cancelled || abortController.signal.aborted) {
          void disconnectSchoolEventLiveHub(connection, id);
          return;
        }
        connectionRef.current = connection;
        setRealtimeConnected(Boolean(connection));
      })
      .catch(() => {
        if (!cancelled) setRealtimeConnected(false);
      });

    return () => {
      cancelled = true;
      abortController.abort();
      const connection = connectionRef.current;
      connectionRef.current = null;
      setRealtimeConnected(false);
      void disconnectSchoolEventLiveHub(connection, id);
    };
  }, [enabled, hubEnabled, id, queryClient]);

  return query;
}

export function useSchoolEventMatches(id?: string | number) {
  const enabled = useIsSchool();
  return useQuery({
    queryKey: schoolEventsQueryKeys.matches(id ?? ""),
    queryFn: () => getSchoolEventMatches(id as string | number),
    enabled: enabled && id != null && String(id).length > 0,
  });
}

export function useSchoolEventStandings(id?: string | number) {
  const enabled = useIsSchool();
  return useQuery({
    queryKey: schoolEventsQueryKeys.standings(id ?? ""),
    queryFn: () => getSchoolEventStandings(id as string | number),
    enabled: enabled && id != null && String(id).length > 0,
  });
}

export function useSchoolEventHonorBoard(id?: string | number) {
  const enabled = useIsSchool();
  return useQuery({
    queryKey: schoolEventsQueryKeys.honorBoard(id ?? ""),
    queryFn: () => getSchoolEventHonorBoard(id as string | number),
    enabled: enabled && id != null && String(id).length > 0,
  });
}

export function useSchoolEventActivity(id?: string | number, pageNumber = 1) {
  const enabled = useIsSchool();
  return useQuery({
    queryKey: schoolEventsQueryKeys.activity(id ?? "", pageNumber),
    queryFn: () => getSchoolEventActivity(id as string | number, pageNumber),
    enabled: enabled && id != null && String(id).length > 0,
  });
}

export function useSchoolEventActivePoll(id?: string | number) {
  const enabled = useIsSchool();
  return useQuery({
    queryKey: schoolEventsQueryKeys.poll(id ?? ""),
    queryFn: () => getSchoolEventActivePoll(id as string | number),
    enabled: enabled && id != null && String(id).length > 0,
  });
}

export function useSchoolEventMutations() {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: schoolEventsQueryKeys.all });

  return {
    create: useMutation({
      mutationFn: createSchoolEvent,
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: ({
        id,
        payload,
      }: {
        id: number | string;
        payload: UpsertSchoolEventPayload;
      }) => updateSchoolEvent(id, payload),
      onSuccess: invalidate,
    }),
    publish: useMutation({
      mutationFn: publishSchoolEvent,
      onSuccess: invalidate,
    }),
    archive: useMutation({
      mutationFn: archiveSchoolEvent,
      onSuccess: invalidate,
    }),
    postActivity: useMutation({
      mutationFn: ({
        id,
        message,
        iconType,
      }: {
        id: number | string;
        message: string;
        iconType?: string;
      }) => postSchoolEventActivity(id, message, iconType ?? "Update"),
      onSuccess: (_data, variables) => {
        void queryClient.invalidateQueries({
          queryKey: schoolEventsQueryKeys.live(variables.id),
        });
        void queryClient.invalidateQueries({
          queryKey: [...schoolEventsQueryKeys.all, "activity", String(variables.id)],
        });
      },
    }),
    votePoll: useMutation({
      mutationFn: ({
        eventId,
        pollId,
        optionId,
      }: {
        eventId: number | string;
        pollId: number | string;
        optionId: number | string;
      }) => voteSchoolEventPoll(eventId, pollId, optionId),
      onSuccess: (_data, variables) => {
        void queryClient.invalidateQueries({
          queryKey: schoolEventsQueryKeys.live(variables.eventId),
        });
        void queryClient.invalidateQueries({
          queryKey: schoolEventsQueryKeys.poll(variables.eventId),
        });
      },
    }),
    uploadImage: useMutation({ mutationFn: uploadSchoolEventImage }),
  };
}

export function useSchoolTeamMeta() {
  const enabled = useIsSchool();
  return useQuery({
    queryKey: schoolTeamsQueryKeys.meta(),
    queryFn: getSchoolTeamMeta,
    enabled,
  });
}

export function useSchoolTeamStudentSearch(keyword: string) {
  const enabled = useIsSchool();
  const normalized = keyword.trim();
  return useQuery({
    queryKey: schoolTeamsQueryKeys.studentSearch(normalized),
    queryFn: () => searchSchoolTeamStudents(normalized),
    enabled: enabled && normalized.length >= 2,
  });
}

export function useSchoolTeamRankings(params: SchoolTeamRankingsParams) {
  const enabled = useIsSchool();
  return useQuery({
    queryKey: schoolTeamsQueryKeys.rankings(params),
    queryFn: () => getSchoolTeamRankings(params),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useSchoolTeamMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: schoolTeamsQueryKeys.all });
  };

  return {
    create: useMutation({
      mutationFn: createSchoolTeam,
      onSuccess: invalidate,
    }),
    uploadLogo: useMutation({ mutationFn: uploadSchoolTeamLogo }),
  };
}
