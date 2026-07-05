"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { dailyTasksQueryKeys } from "@/modules/student/application/constants/dailyTasksQueryKeys";
import { progressQueryKeys } from "@/modules/student/application/constants/progressQueryKeys";
import {
  isActivePath,
  pickFeaturedChallenge,
  pickFeaturedLiveSession,
  resolveHeroMission,
} from "@/modules/student/domain/daily-tasks/daily-tasks.utils";
import type { DailyTasksHeroMission } from "@/modules/student/domain/daily-tasks/daily-tasks.types";
import { resolveActiveCourseId, resolveActivePathId } from "@/modules/student/domain/progress/progress.utils";
import {
  enterChallengeQueue,
  getStudentDailyTasks,
  joinLiveStation,
} from "@/modules/student/infrastructure/api/dailyTasks.api";
import {
  getCourseProgress,
  getLearningPathDropdown,
  getLearningPathStationsProgress,
  getSubscriptionsDashboard,
} from "@/modules/student/infrastructure/api/progress.api";

const POLL_INTERVAL_MS = 60_000;

export function useDailyTasks() {
  const queryClient = useQueryClient();
  const [joiningStationId, setJoiningStationId] = useState<string | null>(null);
  const [enteringChallengeId, setEnteringChallengeId] = useState<string | null>(null);

  const dashboardQuery = useQuery({
    queryKey: progressQueryKeys.dashboard(),
    queryFn: getSubscriptionsDashboard,
    staleTime: 60_000,
  });

  const dailyTasksQuery = useQuery({
    queryKey: dailyTasksQueryKeys.tasks(),
    queryFn: getStudentDailyTasks,
    refetchInterval: POLL_INTERVAL_MS,
    staleTime: 30_000,
  });

  const activeCourseId = useMemo(
    () => resolveActiveCourseId(dashboardQuery.data?.courses ?? [], null),
    [dashboardQuery.data?.courses],
  );

  const activeCourse = useMemo(
    () => dashboardQuery.data?.courses.find((course) => course.courseId === activeCourseId) ?? null,
    [activeCourseId, dashboardQuery.data?.courses],
  );

  const courseProgressQuery = useQuery({
    queryKey: progressQueryKeys.courseProgress(activeCourseId ?? ""),
    queryFn: () => getCourseProgress(activeCourseId!),
    enabled: Boolean(activeCourseId),
    staleTime: 30_000,
  });

  const pathDropdownQuery = useQuery({
    queryKey: progressQueryKeys.pathDropdown(activeCourseId ?? ""),
    queryFn: () => getLearningPathDropdown(activeCourseId!),
    enabled: Boolean(activeCourseId),
    staleTime: 60_000,
  });

  const activePathId = useMemo(() => {
    const paths = courseProgressQuery.data?.paths ?? [];
    const activePath = paths.find(isActivePath);
    if (activePath) return activePath.pathId;
    return resolveActivePathId(paths, null) ?? pathDropdownQuery.data?.[0]?.id ?? null;
  }, [courseProgressQuery.data?.paths, pathDropdownQuery.data]);

  const pathStationsQuery = useQuery({
    queryKey: progressQueryKeys.pathStations(activePathId ?? ""),
    queryFn: () => getLearningPathStationsProgress(activePathId!),
    enabled: Boolean(activePathId),
    staleTime: 30_000,
  });

  const heroMission = useMemo((): DailyTasksHeroMission | null => {
    if (!activeCourseId || !activePathId) return null;
    const pathProgress =
      courseProgressQuery.data?.paths.find((path) => path.pathId === activePathId) ?? null;
    return resolveHeroMission({
      courseId: activeCourseId,
      courseTitle: activeCourse?.title ?? "",
      pathId: activePathId,
      pathProgress,
      stations: pathStationsQuery.data?.stations ?? [],
    });
  }, [
    activeCourse?.title,
    activeCourseId,
    activePathId,
    courseProgressQuery.data?.paths,
    pathStationsQuery.data?.stations,
  ]);

  const featuredLiveSession = useMemo(
    () => pickFeaturedLiveSession(dailyTasksQuery.data?.liveSessions ?? []),
    [dailyTasksQuery.data?.liveSessions],
  );

  const featuredChallenge = useMemo(
    () => pickFeaturedChallenge(dailyTasksQuery.data?.challenges ?? []),
    [dailyTasksQuery.data?.challenges],
  );

  const joinMutation = useMutation({
    mutationFn: joinLiveStation,
    onSettled: () => {
      setJoiningStationId(null);
      void queryClient.invalidateQueries({ queryKey: dailyTasksQueryKeys.tasks() });
    },
  });

  const challengeMutation = useMutation({
    mutationFn: enterChallengeQueue,
    onSettled: () => {
      setEnteringChallengeId(null);
      void queryClient.invalidateQueries({ queryKey: dailyTasksQueryKeys.tasks() });
    },
  });

  const refreshAll = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: dailyTasksQueryKeys.tasks() }),
      queryClient.invalidateQueries({ queryKey: progressQueryKeys.dashboard() }),
      activeCourseId
        ? queryClient.invalidateQueries({
            queryKey: progressQueryKeys.courseProgress(activeCourseId),
          })
        : Promise.resolve(),
      activePathId
        ? queryClient.invalidateQueries({
            queryKey: progressQueryKeys.pathStations(activePathId),
          })
        : Promise.resolve(),
    ]);
  };

  const handleJoinLive = async (stationId: string) => {
    setJoiningStationId(stationId);
    await joinMutation.mutateAsync(stationId);
  };

  const handleEnterChallenge = async (challengeId: string) => {
    setEnteringChallengeId(challengeId);
    await challengeMutation.mutateAsync(challengeId);
  };

  const isLoading =
    dailyTasksQuery.isLoading ||
    dashboardQuery.isLoading ||
    (Boolean(activeCourseId) && courseProgressQuery.isLoading);

  const errorMessage =
    (dailyTasksQuery.error instanceof Error ? dailyTasksQuery.error.message : null) ||
    (dashboardQuery.error instanceof Error ? dashboardQuery.error.message : null);

  return {
    dashboardQuery,
    dailyTasksQuery,
    heroMission,
    featuredLiveSession,
    featuredChallenge,
    isLoading,
    errorMessage,
    refreshAll,
    handleJoinLive,
    handleEnterChallenge,
    joiningStationId,
    enteringChallengeId,
    joinError: joinMutation.error instanceof Error ? joinMutation.error.message : null,
    challengeError:
      challengeMutation.error instanceof Error ? challengeMutation.error.message : null,
  };
}
