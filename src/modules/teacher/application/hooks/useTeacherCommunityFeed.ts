"use client";

import { useCallback, useEffect, useState } from "react";
import { getCommunityBadgesPage } from "@/modules/admin/infrastructure/api/communityBadgesApi";
import {
  feedSortToApiParams,
  getCommunityArticles,
  type CommunityFeedSort,
} from "@/modules/admin/infrastructure/api/communityArticlesApi";
import { getCommunitySettings } from "@/modules/admin/infrastructure/api/communitySettingsApi";
import type { CommunityFeedState } from "@/modules/teacher/domain/types/knowledgeCommunity.types";
import {
  buildAuthorSummariesFromPosts,
  mapArticleRowToFeedPost,
} from "@/modules/teacher/domain/utils/knowledgeCommunityMappers";

const PAGE_SIZE = 10;

export function useTeacherCommunityFeed(sort: CommunityFeedSort) {
  const [state, setState] = useState<CommunityFeedState>({
    posts: [],
    topArticles: [],
    topAuthors: [],
    badges: [],
    settings: null,
    totalItems: 0,
  });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const sortParams = feedSortToApiParams(sort);

    const [feedResult, topResult, badgesResult, settingsResult] = await Promise.all([
      getCommunityArticles({
        status: sortParams.status,
        page,
        pageSize: PAGE_SIZE,
        sortBy: sortParams.sortBy,
        sortDesc: sortParams.sortDesc,
      }),
      getCommunityArticles({
        status: 3,
        page: 1,
        pageSize: 3,
        sortBy: "ViewsCount",
        sortDesc: true,
      }),
      getCommunityBadgesPage({ pageNumber: 1, pageSize: 8 }),
      getCommunitySettings(),
    ]);

    if (!feedResult.data) {
      setError(feedResult.errorMessage ?? "Failed to load feed");
      setLoading(false);
      return;
    }

    const posts = feedResult.data.articles.map(mapArticleRowToFeedPost);
    const topArticles = (topResult.data?.articles ?? []).map(mapArticleRowToFeedPost);

    setState({
      posts,
      topArticles,
      topAuthors: buildAuthorSummariesFromPosts(posts),
      badges: badgesResult.data?.rows ?? [],
      settings: settingsResult.data,
      totalItems: feedResult.data.totalItems,
    });
    setLoading(false);
  }, [page, sort]);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    ...state,
    page,
    setPage,
    loading,
    error,
    reload: load,
    totalPages: Math.max(1, Math.ceil(state.totalItems / PAGE_SIZE)),
  };
}
