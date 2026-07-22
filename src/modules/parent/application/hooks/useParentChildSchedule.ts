"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { parentChildrenQueryKeys } from "@/modules/parent/application/constants/parentChildrenQueryKeys";
import { fetchParentChildWeeklySchedule } from "@/modules/parent/infrastructure/api/parentChildrenApi";
import { getCurrentWeekStart } from "@/modules/student/domain/weekly-schedule/weekly-schedule.utils";
import { useAuth } from "@/shared/application/hooks/useAuth";

export function useParentChildSchedule(studentUserId: string | null | undefined) {
  const auth = useAuth();
  const [weekStart, setWeekStart] = useState(() => getCurrentWeekStart());
  const enabled =
    auth.user?.role?.toLowerCase() === "parent" && Boolean(studentUserId);

  const query = useQuery({
    queryKey: parentChildrenQueryKeys.schedule(studentUserId ?? "", weekStart),
    queryFn: () => fetchParentChildWeeklySchedule(studentUserId!, weekStart),
    enabled,
  });

  const isCurrentWeek = useMemo(
    () => weekStart === getCurrentWeekStart(),
    [weekStart],
  );

  const goToPreviousWeek = () => {
    const date = new Date(`${weekStart}T12:00:00`);
    date.setDate(date.getDate() - 7);
    setWeekStart(date.toISOString().slice(0, 10));
  };

  const goToNextWeek = () => {
    const date = new Date(`${weekStart}T12:00:00`);
    date.setDate(date.getDate() + 7);
    setWeekStart(date.toISOString().slice(0, 10));
  };

  const goToCurrentWeek = () => setWeekStart(getCurrentWeekStart());

  return {
    ...query,
    weekStart,
    isCurrentWeek,
    goToPreviousWeek,
    goToNextWeek,
    goToCurrentWeek,
  };
}
