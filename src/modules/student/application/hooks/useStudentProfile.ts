"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { studentHomeQueryKeys } from "@/modules/student/application/constants/studentHomeQueryKeys";
import { studentProfileQueryKeys } from "@/modules/student/application/constants/studentProfileQueryKeys";
import { progressQueryKeys } from "@/modules/student/application/constants/progressQueryKeys";
import {
  useStudentHomeNotifications,
  useStudentHomeProfile,
} from "@/modules/student/application/hooks/useStudentHomeDashboard";
import {
  buildProfileKpis,
  readNotificationPrefs,
  writeNotificationPrefs,
} from "@/modules/student/domain/profile/profile.utils";
import type {
  StudentProfileNotificationPrefs,
  UpdateStudentProfilePayload,
} from "@/modules/student/domain/profile/profile.types";
import { getAchievementAudit, getStudentPointsSummary } from "@/modules/student/infrastructure/api/challengeStation.api";
import { getLeaderboardWidget } from "@/modules/student/infrastructure/api/studentHomeApi";
import {
  getStudentProfileBadges,
  getStudentSchoolRank,
  updateStudentMyProfile,
} from "@/modules/student/infrastructure/api/studentProfile.api";
import {
  getSubscriptionsDashboard,
  initializeCourseProgress,
} from "@/modules/student/infrastructure/api/progress.api";
import { sortSubscriptionCourses } from "@/modules/student/domain/progress/progress.utils";

export function useStudentProfile() {
  const queryClient = useQueryClient();
  const [continuingCourseId, setContinuingCourseId] = useState<string | null>(null);
  const [notificationPrefs, setNotificationPrefs] = useState<StudentProfileNotificationPrefs>(
    () => readNotificationPrefs(),
  );

  const profileQuery = useStudentHomeProfile();
  const notificationsQuery = useStudentHomeNotifications();

  const pointsQuery = useQuery({
    queryKey: studentProfileQueryKeys.points(),
    queryFn: () => getStudentPointsSummary(20),
    staleTime: 60_000,
  });

  const badgesQuery = useQuery({
    queryKey: studentProfileQueryKeys.badges(),
    queryFn: getStudentProfileBadges,
    staleTime: 60_000,
  });

  const schoolRankQuery = useQuery({
    queryKey: studentProfileQueryKeys.schoolRank(),
    queryFn: getStudentSchoolRank,
    staleTime: 60_000,
    retry: false,
  });

  const leaderboardQuery = useQuery({
    queryKey: studentHomeQueryKeys.leaderboard(),
    queryFn: getLeaderboardWidget,
    staleTime: 60_000,
  });

  const subscriptionsQuery = useQuery({
    queryKey: progressQueryKeys.dashboard(),
    queryFn: getSubscriptionsDashboard,
    staleTime: 60_000,
  });

  const auditQuery = useQuery({
    queryKey: studentProfileQueryKeys.achievementAudit(),
    queryFn: () => getAchievementAudit({ pageNumber: 1, pageSize: 20 }),
    staleTime: 60_000,
  });

  const updateMutation = useMutation({
    mutationFn: updateStudentMyProfile,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: studentHomeQueryKeys.profile() }),
        queryClient.invalidateQueries({ queryKey: studentProfileQueryKeys.all() }),
      ]);
    },
  });

  const continueMutation = useMutation({
    mutationFn: initializeCourseProgress,
    onSettled: () => {
      setContinuingCourseId(null);
    },
  });

  const sortedCourses = useMemo(
    () => sortSubscriptionCourses(subscriptionsQuery.data?.courses ?? []).slice(0, 3),
    [subscriptionsQuery.data?.courses],
  );

  const kpis = useMemo(
    () =>
      buildProfileKpis({
        overallProgressPercentage: subscriptionsQuery.data?.stats.overallProgressPercentage ?? 0,
        auditItems: auditQuery.data ?? [],
      }),
    [subscriptionsQuery.data?.stats.overallProgressPercentage, auditQuery.data],
  );

  const totalPoints =
    pointsQuery.data?.totalPoints ?? profileQuery.data?.points ?? 0;

  const badgeCount =
    badgesQuery.data?.earnedBadges.length ??
    profileQuery.data?.achievementBadgeCount ??
    0;

  const earnedBadges =
    badgesQuery.data?.earnedBadges ??
    (profileQuery.data?.earnedAchievementBadges ?? []).map((badge) => ({
      badgeId: badge.badgeId,
      name: badge.name,
      iconUrl: badge.iconUrl,
      earnedAt: null,
      isNew: false,
    }));

  const refreshAll = async () => {
    await Promise.all([
      profileQuery.refetch(),
      pointsQuery.refetch(),
      badgesQuery.refetch(),
      schoolRankQuery.refetch(),
      leaderboardQuery.refetch(),
      subscriptionsQuery.refetch(),
      auditQuery.refetch(),
      notificationsQuery.refetch(),
    ]);
  };

  const handleContinueLearning = async (courseId: string) => {
    setContinuingCourseId(courseId);
    await continueMutation.mutateAsync(courseId);
  };

  const handleUpdateProfile = async (payload: UpdateStudentProfilePayload) => {
    await updateMutation.mutateAsync(payload);
  };

  const handleNotificationPrefChange = (
    key: keyof StudentProfileNotificationPrefs,
    value: boolean,
  ) => {
    const next = { ...notificationPrefs, [key]: value };
    setNotificationPrefs(next);
    writeNotificationPrefs(next);
  };

  const isLoading =
    (profileQuery.isLoading && !profileQuery.data) ||
    (subscriptionsQuery.isLoading && !subscriptionsQuery.data);

  const errorMessage =
    profileQuery.error instanceof Error
      ? profileQuery.error.message
      : subscriptionsQuery.error instanceof Error
        ? subscriptionsQuery.error.message
        : null;

  return {
    profileQuery,
    pointsQuery,
    badgesQuery,
    schoolRankQuery,
    leaderboardQuery,
    subscriptionsQuery,
    auditQuery,
    notificationsQuery,
    sortedCourses,
    kpis,
    totalPoints,
    badgeCount,
    earnedBadges,
    notificationPrefs,
    continuingCourseId,
    continueError:
      continueMutation.error instanceof Error ? continueMutation.error.message : null,
    updateError:
      updateMutation.error instanceof Error ? updateMutation.error.message : null,
    isUpdating: updateMutation.isPending,
    isLoading,
    errorMessage,
    refreshAll,
    handleContinueLearning,
    handleUpdateProfile,
    handleNotificationPrefChange,
  };
}
