"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { progressQueryKeys } from "@/modules/student/application/constants/progressQueryKeys";
import {
  hasActiveLiveStation,
  resolveActiveCourseId,
  resolveActivePathId,
} from "@/modules/student/domain/progress/progress.utils";
import {
  getCourseProgress,
  getLearningPathDropdown,
  getLearningPathStationsProgress,
  getSubscriptionsDashboard,
  initializeCourseProgress,
} from "@/modules/student/infrastructure/api/progress.api";

type UseProgressPathOptions = {
  courseId?: string | null;
  pathId?: string | null;
};

export function useProgressPath({ courseId: preferredCourseId, pathId: preferredPathId }: UseProgressPathOptions) {
  const queryClient = useQueryClient();
  const [initializedCourses, setInitializedCourses] = useState<Record<string, true>>({});

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
      setInitializedCourses((prev) => ({ ...prev, [courseId]: true }));
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
    selectCourse: (courseId: string) => initializeMutation.mutate(courseId),
  };
}
