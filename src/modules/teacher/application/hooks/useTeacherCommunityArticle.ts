"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getKnowledgeCommunityArticleById,
  getKnowledgeCommunityArticleComments,
  getCommunityArticles,
} from "@/modules/admin/infrastructure/api/communityArticlesApi";
import { getCommunitySettings } from "@/modules/admin/infrastructure/api/communitySettingsApi";
import type { CommunitySettings } from "@/modules/admin/domain/types/communitySettings.types";
import type { CommunityArticleViewModel } from "@/modules/teacher/domain/types/knowledgeCommunity.types";
import {
  mapArticleDetailToFeedPost,
  mapArticleRowToFeedPost,
} from "@/modules/teacher/domain/utils/knowledgeCommunityMappers";

export function useTeacherCommunityArticle(articleId: string) {
  const [data, setData] = useState<CommunityArticleViewModel | null>(null);
  const [settings, setSettings] = useState<CommunitySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    const [articleResult, commentsResult, relatedResult, settingsResult] = await Promise.all([
      getKnowledgeCommunityArticleById(articleId),
      getKnowledgeCommunityArticleComments(articleId),
      getCommunityArticles({
        status: 3,
        page: 1,
        pageSize: 3,
        sortBy: "PublishedAt",
        sortDesc: true,
      }),
      getCommunitySettings(),
    ]);

    if (!articleResult.data) {
      setError(articleResult.errorMessage ?? "Article not found");
      setData(null);
      setLoading(false);
      return;
    }

    const relatedArticles = (relatedResult.data?.articles ?? [])
      .filter((row) => row.id !== articleId)
      .slice(0, 3)
      .map(mapArticleRowToFeedPost);

    setData({
      article: articleResult.data,
      comments: commentsResult.data ?? [],
      relatedArticles,
    });
    setSettings(settingsResult.data);
    setLoading(false);
  }, [articleId]);

  const refreshEngagement = useCallback(async () => {
    const [articleResult, commentsResult] = await Promise.all([
      getKnowledgeCommunityArticleById(articleId),
      getKnowledgeCommunityArticleComments(articleId),
    ]);

    setData((current) => {
      if (!current) return current;
      return {
        ...current,
        article: articleResult.data ?? current.article,
        comments: commentsResult.data ?? current.comments,
      };
    });
  }, [articleId]);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    data,
    settings,
    loading,
    error,
    reload: load,
    refreshEngagement,
    feedPost: data ? mapArticleDetailToFeedPost(data.article) : null,
  };
}
