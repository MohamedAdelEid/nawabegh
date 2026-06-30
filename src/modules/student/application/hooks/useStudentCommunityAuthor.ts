"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getKnowledgeCommunityAuthorArticles,
  getKnowledgeCommunityAuthorProfile,
} from "@/modules/teacher/infrastructure/api/knowledgeCommunityApi";
import type {
  CommunityAuthorProfile,
  CommunityFeedPost,
} from "@/modules/student/domain/types/knowledgeCommunity.types";
import {
  mapKnowledgeCommunityAuthorArticleToFeedPost,
  mapKnowledgeCommunityAuthorProfile,
  sortAuthorArticles,
} from "@/modules/teacher/domain/utils/knowledgeCommunityAuthorMappers";

export type CommunityAuthorTab = "mostRead" | "topRated" | "all";

export function useStudentCommunityAuthor(authorId: string, tab: CommunityAuthorTab) {
  const [profile, setProfile] = useState<CommunityAuthorProfile | null>(null);
  const [articles, setArticles] = useState<CommunityFeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    const [profileResult, articlesResult] = await Promise.all([
      getKnowledgeCommunityAuthorProfile(authorId),
      getKnowledgeCommunityAuthorArticles(authorId),
    ]);

    if (!profileResult.data) {
      setError(profileResult.errorMessage ?? "Failed to load author");
      setProfile(null);
      setArticles([]);
      setLoading(false);
      return;
    }

    const sortedArticles = sortAuthorArticles(articlesResult.data ?? [], tab);
    setProfile(mapKnowledgeCommunityAuthorProfile(profileResult.data));
    setArticles(sortedArticles.map(mapKnowledgeCommunityAuthorArticleToFeedPost));
    setLoading(false);
  }, [authorId, tab]);

  useEffect(() => {
    void load();
  }, [load]);

  const setFollowing = useCallback((isFollowing: boolean) => {
    setProfile((current) => (current ? { ...current, isFollowing } : current));
  }, []);

  return { profile, articles, loading, error, reload: load, setFollowing };
}
