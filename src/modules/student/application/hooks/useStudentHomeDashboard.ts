"use client";

import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { useMemo } from "react";
import { studentHomeQueryKeys } from "@/modules/student/application/constants/studentHomeQueryKeys";
import {
  getCurrentStations,
  getLeaderboardWidget,
  getStudentMyProfile,
  getUnreadInAppNotifications,
} from "@/modules/student/infrastructure/api/studentHomeApi";
import { getStudentCommunityFeed } from "@/modules/student/infrastructure/api/studentKnowledgeCommunityApi";
import { mapExploreCourseToCard } from "@/shared/domain/utils/course.utils";
import { getExploreCoursesPage } from "@/shared/infrastructure/api/course.api";
import { getTeachers } from "@/shared/infrastructure/api/teacher.api";

const LIVE_POLL_MS = 45_000;

export function useStudentHomeProfile() {
  return useQuery({
    queryKey: studentHomeQueryKeys.profile(),
    queryFn: getStudentMyProfile,
    staleTime: 60_000,
  });
}

export function useStudentHomeNotifications() {
  return useQuery({
    queryKey: studentHomeQueryKeys.notifications(),
    queryFn: getUnreadInAppNotifications,
    staleTime: 30_000,
  });
}

export function useStudentHomeDashboard() {
  const locale = useLocale();

  const profileQuery = useStudentHomeProfile();
  const notificationsQuery = useStudentHomeNotifications();

  const stationsQuery = useQuery({
    queryKey: studentHomeQueryKeys.currentStations(),
    queryFn: () => getCurrentStations(10),
    refetchInterval: LIVE_POLL_MS,
    staleTime: 15_000,
  });

  const coursesQuery = useQuery({
    queryKey: studentHomeQueryKeys.courses(locale),
    queryFn: () => getExploreCoursesPage({ pageNumber: 1, pageSize: 10 }),
    staleTime: 60_000,
  });

  const leaderboardQuery = useQuery({
    queryKey: studentHomeQueryKeys.leaderboard(),
    queryFn: getLeaderboardWidget,
    staleTime: 120_000,
  });

  const teachersQuery = useQuery({
    queryKey: studentHomeQueryKeys.teachers(locale),
    queryFn: () => getTeachers({ pageNumber: 1, pageSize: 8 }),
    staleTime: 120_000,
  });

  const feedQuery = useQuery({
    queryKey: studentHomeQueryKeys.communityFeed(locale),
    queryFn: async () => {
      const result = await getStudentCommunityFeed({
        sort: "latest",
        page: 1,
        pageSize: 5,
      });
      if (!result.data) {
        throw new Error(result.errorMessage ?? "Failed to load community feed");
      }
      return result.data.posts;
    },
    staleTime: 60_000,
  });

  const courses = useMemo(
    () => (coursesQuery.data?.rows ?? []).map((row) => mapExploreCourseToCard(row, locale)),
    [coursesQuery.data?.rows, locale],
  );

  const unreadCount = notificationsQuery.data?.filter((item) => !item.isRead).length ?? 0;

  const refetchAll = async () => {
    await Promise.all([
      profileQuery.refetch(),
      notificationsQuery.refetch(),
      stationsQuery.refetch(),
      coursesQuery.refetch(),
      leaderboardQuery.refetch(),
      teachersQuery.refetch(),
      feedQuery.refetch(),
    ]);
  };

  const isInitialLoading =
    profileQuery.isLoading &&
    stationsQuery.isLoading &&
    coursesQuery.isLoading &&
    leaderboardQuery.isLoading;

  return {
    profileQuery,
    notificationsQuery,
    stationsQuery,
    coursesQuery,
    leaderboardQuery,
    teachersQuery,
    feedQuery,
    courses,
    unreadCount,
    refetchAll,
    isInitialLoading,
  };
}
