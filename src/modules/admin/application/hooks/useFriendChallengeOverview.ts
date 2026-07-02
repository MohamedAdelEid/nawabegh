"use client";

import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { getFriendChallengeOverview } from "@/modules/admin/infrastructure/api/friendChallengesApi";

export const ADMIN_FRIEND_CHALLENGE_OVERVIEW_QUERY_KEY = "admin-friend-challenge-overview";

export function useFriendChallengeOverview(challengeId: string) {
  const locale = useLocale();

  const query = useQuery({
    queryKey: [ADMIN_FRIEND_CHALLENGE_OVERVIEW_QUERY_KEY, locale, challengeId],
    queryFn: () => getFriendChallengeOverview(challengeId),
    enabled: Boolean(challengeId),
  });

  return {
    overview: query.data?.data ?? null,
    isLoading: query.isLoading || query.isFetching,
    errorMessage: query.data?.errorMessage,
    refetch: query.refetch,
  };
}
