"use client";

import { useCallback, useEffect, useState } from "react";
import { getCommunityBadgesPage } from "@/modules/admin/infrastructure/api/communityBadgesApi";
import type { CommunityFeedSort } from "@/modules/admin/infrastructure/api/communityArticlesApi";
import { getStudentCommunityFeed } from "@/modules/student/infrastructure/api/studentKnowledgeCommunityApi";
import type { CommunityFeedState } from "@/modules/student/domain/types/knowledgeCommunity.types";
import { buildAuthorSummariesFromPosts } from "@/modules/teacher/domain/utils/knowledgeCommunityMappers";

const PAGE_SIZE = 10;

export function useStudentCommunityFeed(sort: CommunityFeedSort) {
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

    const [feedResult, trendingResult, badgesResult] = await Promise.all([
      getStudentCommunityFeed({ sort, page, pageSize: PAGE_SIZE }),
      getStudentCommunityFeed({ sort: "mostActive", page: 1, pageSize: 3 }),
      getCommunityBadgesPage({ pageNumber: 1, pageSize: 8 }),
    ]);

    if (!feedResult.data) {
      setError(feedResult.errorMessage ?? "Failed to load feed");
      setLoading(false);
      return;
    }

    const posts = feedResult.data.posts;

    setState({
      posts,
      topArticles: trendingResult.data?.posts ?? [],
      topAuthors: buildAuthorSummariesFromPosts(posts),
      badges: badgesResult.data?.rows ?? [],
      settings: null,
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
