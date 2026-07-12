"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { weeklyScheduleQueryKeys } from "@/modules/student/application/constants/weeklyScheduleQueryKeys";
import {
  getCurrentWeekStart,
  hasLiveScheduleItems,
} from "@/modules/student/domain/weekly-schedule/weekly-schedule.utils";
import type { WeeklyScheduleItemDto } from "@/modules/student/domain/weekly-schedule/weekly-schedule.types";
import { joinLiveStation } from "@/modules/student/infrastructure/api/dailyTasks.api";
import { getStudentWeeklySchedule } from "@/modules/student/infrastructure/api/weeklySchedule.api";

const LIVE_POLL_INTERVAL_MS = 60_000;

export function useWeeklySchedule() {
  const queryClient = useQueryClient();
  const [weekStart, setWeekStart] = useState<string>(() => getCurrentWeekStart());
  const [joiningStationId, setJoiningStationId] = useState<string | null>(null);

  const scheduleQuery = useQuery({
    queryKey: weeklyScheduleQueryKeys.weekly(weekStart),
    queryFn: () => getStudentWeeklySchedule(weekStart),
    refetchInterval: (query) =>
      hasLiveScheduleItems(query.state.data) ? LIVE_POLL_INTERVAL_MS : false,
    staleTime: 30_000,
  });

  const joinMutation = useMutation({
    mutationFn: joinLiveStation,
    onSettled: () => {
      setJoiningStationId(null);
      void queryClient.invalidateQueries({ queryKey: weeklyScheduleQueryKeys.weekly(weekStart) });
    },
  });

  const isCurrentWeek = useMemo(
    () => weekStart === getCurrentWeekStart(),
    [weekStart],
  );

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: weeklyScheduleQueryKeys.weekly(weekStart) });
  };

  const goToPreviousWeek = () => {
    const date = new Date(`${weekStart}T12:00:00`);
    date.setDate(date.getDate() - 7);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    setWeekStart(`${year}-${month}-${day}`);
  };

  const goToNextWeek = () => {
    const date = new Date(`${weekStart}T12:00:00`);
    date.setDate(date.getDate() + 7);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    setWeekStart(`${year}-${month}-${day}`);
  };

  const goToCurrentWeek = () => {
    setWeekStart(getCurrentWeekStart());
  };

  const handleJoinLive = async (item: WeeklyScheduleItemDto) => {
    setJoiningStationId(item.stationId);
    await joinMutation.mutateAsync(item.stationId);
  };

  return {
    scheduleQuery,
    weekStart,
    isCurrentWeek,
    goToPreviousWeek,
    goToNextWeek,
    goToCurrentWeek,
    refresh,
    handleJoinLive,
    joiningStationId,
    joinError: joinMutation.error instanceof Error ? joinMutation.error.message : null,
    isLoading: scheduleQuery.isLoading,
    errorMessage:
      scheduleQuery.error instanceof Error ? scheduleQuery.error.message : null,
  };
}
