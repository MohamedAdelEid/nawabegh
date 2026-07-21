"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { progressQueryKeys } from "@/modules/student/application/constants/progressQueryKeys";
import {
  buildJourneyCompletionNotice,
  hasActiveLiveStation,
  resolveActiveCourseId,
  resolveActivePathId,
} from "@/modules/student/domain/progress/progress.utils";
import type { JourneyCompletionNotice } from "@/modules/student/domain/progress/progress.types";
import {
  getCourseProgress,
  getLearningPathDropdown,
  getLearningPathStationsProgress,
  getSubscriptionsDashboard,
  initializeCourseProgress,
  openLearningPathMilestone,
} from "@/modules/student/infrastructure/api/progress.api";

type UseProgressPathOptions = {
  courseId?: string | null;
  pathId?: string | null;
};

const INIT_SESSION_KEY = "nawabegh:progress-initialized-courses";

function readInitializedCourses(): Record<string, true> {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(INIT_SESSION_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return Object.fromEntries(
      Object.keys(parsed).map((id) => [id, true as const]),
    );
  } catch {
    return {};
  }
}

function writeInitializedCourses(map: Record<string, true>) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(INIT_SESSION_KEY, JSON.stringify(map));
  } catch {
    // ignore quota / private mode
  }
}

export function useProgressPath({ courseId: preferredCourseId, pathId: preferredPathId }: UseProgressPathOptions) {
  const queryClient = useQueryClient();
  const [initializedCourses, setInitializedCourses] = useState<Record<string, true>>(
    readInitializedCourses,
  );
  const [completionNotice, setCompletionNotice] = useState<JourneyCompletionNotice | null>(
    null,
  );

  const markCourseInitialized = useCallback((courseId: string) => {
    setInitializedCourses((prev) => {
      if (prev[courseId]) return prev;
      const next = { ...prev, [courseId]: true as const };
      writeInitializedCourses(next);
      return next;
    });
  }, []);

  const dashboardQuery = useQuery({
    queryKey: progressQueryKeys.dashboard(),
    queryFn: getSubscriptionsDashboard,
    staleTime: 60_000,
  });

  const activeCourseId = useMemo(
    () =>
      resolveActiveCourseId(dashboardQuery.data?.courses ?? [], preferredCourseId ?? null),
    [dashboardQuery.data?.courses, preferredCourseId],
  );

  const initializeMutation = useMutation({
    mutationFn: initializeCourseProgress,
    onSettled: (_, __, courseId) => {
      if (!courseId) return;
      // 200 or 409 — both mean progress rows exist; don't call again.
      markCourseInitialized(courseId);
      void queryClient.invalidateQueries({
        queryKey: progressQueryKeys.courseProgress(courseId),
      });
    },
  });

  const initializeRef = useRef(initializeMutation.mutate);
  initializeRef.current = initializeMutation.mutate;

  useEffect(() => {
    if (!activeCourseId || initializedCourses[activeCourseId]) return;
    initializeRef.current(activeCourseId);
  }, [activeCourseId, initializedCourses]);

  const courseProgressQuery = useQuery({
    queryKey: progressQueryKeys.courseProgress(activeCourseId ?? ""),
    queryFn: () => getCourseProgress(activeCourseId!),
    enabled: Boolean(activeCourseId),
    staleTime: 30_000,
  });

  // If course-progress loads, initialize is unnecessary for this course.
  useEffect(() => {
    if (!activeCourseId || !courseProgressQuery.isSuccess) return;
    markCourseInitialized(activeCourseId);
  }, [activeCourseId, courseProgressQuery.isSuccess, markCourseInitialized]);

  const pathDropdownQuery = useQuery({
    queryKey: progressQueryKeys.pathDropdown(activeCourseId ?? ""),
    queryFn: () => getLearningPathDropdown(activeCourseId!),
    enabled: Boolean(activeCourseId),
    staleTime: 60_000,
  });

  const activePathId = useMemo(() => {
    const paths = courseProgressQuery.data?.paths ?? [];
    const dropdown = pathDropdownQuery.data ?? [];
    const fromProgress = resolveActivePathId(paths, preferredPathId ?? null);
    if (fromProgress) return fromProgress;
    return dropdown[0]?.id ?? null;
  }, [courseProgressQuery.data?.paths, pathDropdownQuery.data, preferredPathId]);

  const pathStationsQuery = useQuery({
    queryKey: progressQueryKeys.pathStations(activePathId ?? ""),
    queryFn: () => getLearningPathStationsProgress(activePathId!),
    enabled: Boolean(activePathId),
    staleTime: 15_000,
    refetchInterval: (query) => {
      const stations = query.state.data?.stations ?? [];
      return hasActiveLiveStation(stations) ? 45_000 : false;
    },
  });

  const openMilestoneMutation = useMutation({
    mutationFn: ({
      learningPathId,
      milestoneOrder,
    }: {
      learningPathId: string;
      milestoneOrder: number;
      pointsReward: number;
    }) => openLearningPathMilestone(learningPathId, milestoneOrder),
    onSuccess: (result, variables) => {
      void queryClient.invalidateQueries({
        queryKey: progressQueryKeys.pathStations(variables.learningPathId),
      });
      if (activeCourseId) {
        void queryClient.invalidateQueries({
          queryKey: progressQueryKeys.courseProgress(activeCourseId),
        });
      }

      const looksLikeConflict =
        result.pointsAwarded <= 0 &&
        result.currentLevel == null &&
        result.pointsToNextLevel == null &&
        result.totalPoints == null;
      if (looksLikeConflict) return;

      const pointsEarned =
        result.pointsAwarded > 0 ? result.pointsAwarded : variables.pointsReward;

      setCompletionNotice(
        buildJourneyCompletionNotice({
          variant: "station",
          pointsEarned,
          currentLevel: result.currentLevel,
          pointsToNextLevel: result.pointsToNextLevel,
        }),
      );
    },
  });

  const activeCourse = useMemo(
    () => dashboardQuery.data?.courses.find((course) => course.courseId === activeCourseId),
    [dashboardQuery.data?.courses, activeCourseId],
  );

  const activePathProgress = useMemo(
    () => courseProgressQuery.data?.paths.find((path) => path.pathId === activePathId),
    [courseProgressQuery.data?.paths, activePathId],
  );

  const refreshAll = async () => {
    await Promise.all([
      dashboardQuery.refetch(),
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

  const clearCompletionNotice = useCallback(() => setCompletionNotice(null), []);

  const showDemoCompletion = useCallback((variant: "station" | "path" = "station") => {
    setCompletionNotice(
      buildJourneyCompletionNotice({
        variant,
        pointsEarned: 500,
        currentLevel: 12,
        pointsToNextLevel: 250,
      }),
    );
  }, []);

  return {
    dashboardQuery,
    courseProgressQuery,
    pathDropdownQuery,
    pathStationsQuery,
    activeCourseId,
    activePathId,
    activeCourse,
    activePathProgress,
    refreshAll,
    isInitializing: initializeMutation.isPending,
    openMilestone: openMilestoneMutation.mutateAsync,
    isOpeningMilestone: openMilestoneMutation.isPending,
    openingMilestoneOrder: openMilestoneMutation.variables?.milestoneOrder ?? null,
    openMilestoneError:
      openMilestoneMutation.error instanceof Error
        ? openMilestoneMutation.error.message
        : null,
    completionNotice,
    clearCompletionNotice,
    showDemoCompletion,
  };
}
