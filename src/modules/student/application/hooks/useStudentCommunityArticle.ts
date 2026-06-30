"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getKnowledgeCommunityArticleById,
  getKnowledgeCommunityArticleComments,
} from "@/modules/admin/infrastructure/api/communityArticlesApi";
import { getStudentCommunityFeed } from "@/modules/student/infrastructure/api/studentKnowledgeCommunityApi";
import type { CommunityArticleViewModel } from "@/modules/student/domain/types/knowledgeCommunity.types";
import { mapArticleDetailToFeedPost } from "@/modules/teacher/domain/utils/knowledgeCommunityMappers";

export function useStudentCommunityArticle(articleId: string) {
  const [data, setData] = useState<CommunityArticleViewModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    const [articleResult, commentsResult, relatedResult] = await Promise.all([
      getKnowledgeCommunityArticleById(articleId),
      getKnowledgeCommunityArticleComments(articleId),
      getStudentCommunityFeed({ sort: "latest", page: 1, pageSize: 4 }),
    ]);

    if (!articleResult.data) {
      setError(articleResult.errorMessage ?? "Article not found");
      setData(null);
      setLoading(false);
      return;
    }

    const relatedArticles = (relatedResult.data?.posts ?? [])
      .filter((post) => post.id !== articleId)
      .slice(0, 3);

    setData({
      article: articleResult.data,
      comments: commentsResult.data ?? [],
      relatedArticles,
    });
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
    loading,
    error,
    reload: load,
    refreshEngagement,
    feedPost: data ? mapArticleDetailToFeedPost(data.article) : null,
  };
}
