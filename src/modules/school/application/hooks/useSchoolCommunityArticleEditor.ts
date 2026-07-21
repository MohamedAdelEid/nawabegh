"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/shared/application/hooks/useAuth";
import { schoolCommunityQueryKeys } from "@/modules/school/application/constants/schoolCommunityQueryKeys";
import {
  createSchoolCommunityArticle,
  createSchoolCommunityDraft,
  getSchoolCommunityArticleById,
  submitSchoolCommunityArticle,
  updateSchoolCommunityArticle,
} from "@/modules/school/infrastructure/api/schoolCommunityApi";
import type { SchoolCommunityArticleWritePayload } from "@/modules/school/domain/types/schoolCommunity.types";

export function useSchoolCommunityArticleEditor(articleId?: string) {
  const auth = useAuth();
  const queryClient = useQueryClient();
  const isEdit = Boolean(articleId);

  const detailQuery = useQuery({
    queryKey: schoolCommunityQueryKeys.article(articleId ?? ""),
    queryFn: () => getSchoolCommunityArticleById(articleId!),
    enabled: auth.user?.role === "School" && isEdit,
  });

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: schoolCommunityQueryKeys.all });
  };

  const saveDraft = useMutation({
    mutationFn: async (payload: SchoolCommunityArticleWritePayload) => {
      if (articleId) {
        return updateSchoolCommunityArticle(articleId, payload);
      }
      return createSchoolCommunityDraft(payload);
    },
    onSuccess: invalidate,
  });

  const publish = useMutation({
    mutationFn: async (payload: SchoolCommunityArticleWritePayload) => {
      if (articleId) {
        await updateSchoolCommunityArticle(articleId, payload);
        await submitSchoolCommunityArticle(articleId);
        return;
      }
      await createSchoolCommunityArticle(payload);
    },
    onSuccess: invalidate,
  });

  return {
    detail: detailQuery.data ?? null,
    isLoadingDetail: detailQuery.isLoading,
    isDetailError: detailQuery.isError,
    saveDraft,
    publish,
  };
}
