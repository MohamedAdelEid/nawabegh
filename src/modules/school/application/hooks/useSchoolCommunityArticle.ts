"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/shared/application/hooks/useAuth";
import { schoolCommunityQueryKeys } from "@/modules/school/application/constants/schoolCommunityQueryKeys";
import {
  approveSchoolCommunityArticle,
  deleteSchoolCommunityArticle,
  deleteSchoolCommunityComment,
  getSchoolCommunityArticleById,
  getSchoolCommunityArticleComments,
  hideSchoolCommunityArticle,
  hideSchoolCommunityComment,
  rejectSchoolCommunityArticle,
  requestSchoolCommunityArticleEdits,
  submitSchoolCommunityArticle,
  unhideSchoolCommunityArticle,
} from "@/modules/school/infrastructure/api/schoolCommunityApi";
import type {
  SchoolCommunityHidePayload,
  SchoolCommunityRejectPayload,
  SchoolCommunityRequestEditsPayload,
} from "@/modules/school/domain/types/schoolCommunity.types";

export function useSchoolCommunityArticle(articleId: string) {
  const auth = useAuth();
  const queryClient = useQueryClient();
  const enabled = auth.user?.role === "School" && Boolean(articleId);

  const detailQuery = useQuery({
    queryKey: schoolCommunityQueryKeys.article(articleId),
    queryFn: () => getSchoolCommunityArticleById(articleId),
    enabled,
  });

  const commentsQuery = useQuery({
    queryKey: schoolCommunityQueryKeys.comments(articleId),
    queryFn: () => getSchoolCommunityArticleComments(articleId),
    enabled,
  });

  const invalidate = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: schoolCommunityQueryKeys.article(articleId) }),
      queryClient.invalidateQueries({ queryKey: schoolCommunityQueryKeys.comments(articleId) }),
      queryClient.invalidateQueries({ queryKey: schoolCommunityQueryKeys.all }),
    ]);
  };

  const approve = useMutation({
    mutationFn: () => approveSchoolCommunityArticle(articleId),
    onSuccess: invalidate,
  });

  const submit = useMutation({
    mutationFn: () => submitSchoolCommunityArticle(articleId),
    onSuccess: invalidate,
  });

  const reject = useMutation({
    mutationFn: (payload: SchoolCommunityRejectPayload) =>
      rejectSchoolCommunityArticle(articleId, payload),
    onSuccess: invalidate,
  });

  const requestEdits = useMutation({
    mutationFn: (payload: SchoolCommunityRequestEditsPayload) =>
      requestSchoolCommunityArticleEdits(articleId, payload),
    onSuccess: invalidate,
  });

  const hide = useMutation({
    mutationFn: (payload?: SchoolCommunityHidePayload) =>
      hideSchoolCommunityArticle(articleId, payload),
    onSuccess: invalidate,
  });

  const unhide = useMutation({
    mutationFn: () => unhideSchoolCommunityArticle(articleId),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: () => deleteSchoolCommunityArticle(articleId),
    onSuccess: invalidate,
  });

  const hideComment = useMutation({
    mutationFn: (commentId: string) => hideSchoolCommunityComment(articleId, commentId),
    onSuccess: invalidate,
  });

  const deleteComment = useMutation({
    mutationFn: (commentId: string) => deleteSchoolCommunityComment(articleId, commentId),
    onSuccess: invalidate,
  });

  return {
    detail: detailQuery.data ?? null,
    comments: commentsQuery.data?.items ?? [],
    isLoading: detailQuery.isLoading || commentsQuery.isLoading,
    isError: detailQuery.isError || commentsQuery.isError,
    error: detailQuery.error ?? commentsQuery.error,
    refetch: async () => {
      await Promise.all([detailQuery.refetch(), commentsQuery.refetch()]);
    },
    approve,
    submit,
    reject,
    requestEdits,
    hide,
    unhide,
    remove,
    hideComment,
    deleteComment,
  };
}
