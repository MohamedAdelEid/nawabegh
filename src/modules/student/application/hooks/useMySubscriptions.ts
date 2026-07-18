"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { progressQueryKeys } from "@/modules/student/application/constants/progressQueryKeys";
import {
  useStudentHomeNotifications,
  useStudentHomeProfile,
} from "@/modules/student/application/hooks/useStudentHomeDashboard";
import { sortSubscriptionCourses } from "@/modules/student/domain/progress/progress.utils";
import {
  getSubscriptionsDashboard,
  initializeCourseProgress,
} from "@/modules/student/infrastructure/api/progress.api";

export function useMySubscriptions() {
  const queryClient = useQueryClient();
  const [continuingCourseId, setContinuingCourseId] = useState<string | null>(null);

  const dashboardQuery = useQuery({
    queryKey: progressQueryKeys.dashboard(),
    queryFn: getSubscriptionsDashboard,
    staleTime: 60_000,
  });

  const profileQuery = useStudentHomeProfile();
  const notificationsQuery = useStudentHomeNotifications();

  const sortedCourses = useMemo(
    () => sortSubscriptionCourses(dashboardQuery.data?.courses ?? []),
    [dashboardQuery.data?.courses],
  );

  const continueMutation = useMutation({
    mutationFn: initializeCourseProgress,
    onSettled: () => {
      setContinuingCourseId(null);
    },
  });

  const refreshAll = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: progressQueryKeys.dashboard() }),
      profileQuery.refetch(),
      notificationsQuery.refetch(),
    ]);
  };

  const handleContinueLearning = async (courseId: string) => {
    setContinuingCourseId(courseId);
    await continueMutation.mutateAsync(courseId);
  };

  const isLoading = dashboardQuery.isLoading;
  const errorMessage =
    dashboardQuery.error instanceof Error ? dashboardQuery.error.message : null;
  const continueError =
    continueMutation.error instanceof Error ? continueMutation.error.message : null;

  return {
    dashboardQuery,
    profileQuery,
    notificationsQuery,
    sortedCourses,
    refreshAll,
    handleContinueLearning,
    continuingCourseId,
    continueError,
    isLoading,
    errorMessage,
  };
}
