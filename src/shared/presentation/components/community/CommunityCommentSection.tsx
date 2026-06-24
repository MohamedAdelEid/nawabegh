"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  postKnowledgeCommunityArticleComment,
  type CommunityCommentDto,
} from "@/modules/admin/infrastructure/api/communityArticlesApi";
import {
  likeKnowledgeCommunityComment,
  unlikeKnowledgeCommunityComment,
} from "@/modules/teacher/infrastructure/api/knowledgeCommunityApi";
import { nestCommunityComments, formatCommunityRelativeTime } from "@/modules/teacher/domain/utils/knowledgeCommunityMappers";
import { cn } from "@/shared/application/lib/cn";
import { notify } from "@/shared/application/lib/toast";
import { Button } from "@/shared/presentation/components/ui/button";
import { UserAvatarImageOrInitials } from "@/shared/presentation/components/user";

type CommunityCommentSectionProps = {
  articleId: string;
  initialComments: CommunityCommentDto[];
  enabled?: boolean;
  onCommentsChange?: (comments: CommunityCommentDto[]) => void;
  onRefreshComments?: () => void | Promise<void>;
};

export function CommunityCommentSection({
  articleId,
  initialComments,
  enabled = true,
  onCommentsChange,
  onRefreshComments,
}: CommunityCommentSectionProps) {
  const t = useTranslations("teacher.dashboard.knowledgeCommunity.article.comments");
  const locale = useLocale();
  const [comments, setComments] = useState(initialComments);
  const [draft, setDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

  const nested = nestCommunityComments(comments);

  const submit = async () => {
    if (!enabled || !draft.trim()) return;
    setSubmitting(true);
    const result = await postKnowledgeCommunityArticleComment(articleId, { content: draft.trim() });
    setSubmitting(false);
    if (result.errorMessage) {
      notify.error(result.errorMessage ?? t("error"));
      return;
    }
    if (result.data) {
      const next = [...comments, result.data];
      setComments(next);
      onCommentsChange?.(next);
    } else {
      await onRefreshComments?.();
    }
    setDraft("");
    notify.success(t("success"));
  };

  return (
    <section className="space-y-5">
      <div className="text-right">
        <h2 className="text-xl font-bold text-[#2C4260]">{t("title")}</h2>
        <p className="text-sm text-slate-500">{t("count", { count: comments.length })}</p>
      </div>

      {enabled ? (
        <div className="rounded-[1.5rem] border border-white/80 bg-white p-5 shadow-[var(--dashboard-shadow-soft)]">
          <div className="flex items-start gap-3">
            <UserAvatarImageOrInitials trackKey="comment-you" name={t("you")} imageUrl={null} size="sm" />
            <div className="flex-1 space-y-3">
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder={t("placeholder")}
                rows={4}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-right text-sm outline-none"
              />
              <div className="flex justify-end">
                <Button
                  type="button"
                  disabled={submitting}
                  onClick={() => void submit()}
                  className="rounded-xl bg-[#2C4260] hover:bg-[#243652]"
                >
                  {t("submit")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="space-y-4">
        {nested.map(({ comment, replies }) => (
          <div key={comment.commentId} className="space-y-3">
            <CommentCard comment={comment} locale={locale} />
            {replies.map((reply) => (
              <div key={reply.commentId} className="me-8">
                <CommentCard comment={reply} locale={locale} nested />
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

function CommentCard({
  comment,
  locale,
  nested = false,
}: {
  comment: CommunityCommentDto;
  locale: string;
  nested?: boolean;
}) {
  const t = useTranslations("teacher.dashboard.knowledgeCommunity.article.comments");
  const author = comment.author;
  const [likesCount, setLikesCount] = useState(comment.likesCount);
  const [isLiked, setIsLiked] = useState(comment.isLikedByCurrentUser ?? false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLikesCount(comment.likesCount);
    setIsLiked(comment.isLikedByCurrentUser ?? false);
  }, [comment.commentId, comment.likesCount, comment.isLikedByCurrentUser]);

  const toggleLike = async () => {
    if (submitting) return;
    setSubmitting(true);
    const result = isLiked
      ? await unlikeKnowledgeCommunityComment(comment.commentId)
      : await likeKnowledgeCommunityComment(comment.commentId);
    setSubmitting(false);

    if (result.errorMessage) {
      notify.error(result.errorMessage);
      return;
    }

    setIsLiked((value) => !value);
    setLikesCount((value) => (isLiked ? Math.max(0, value - 1) : value + 1));
  };

  return (
    <article
      className={`rounded-2xl border border-slate-100 bg-white p-4 ${
        nested ? "bg-slate-50" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        <UserAvatarImageOrInitials
          trackKey={comment.commentId}
          name={author?.fullName ?? "—"}
          imageUrl={author?.avatarUrl}
          size="sm"
        />
        <div className="flex-1 text-right">
          <div className="flex items-center justify-between gap-3">
            <p className="font-semibold text-[#2C4260]">{author?.fullName ?? "—"}</p>
            <span className="text-xs text-slate-400">
              {formatCommunityRelativeTime(comment.createdAt, locale)}
            </span>
          </div>
          <p className="mt-2 text-sm leading-7 text-slate-600">{comment.content}</p>
          <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
            <button
              type="button"
              disabled={submitting}
              onClick={() => void toggleLike()}
              className={cn(isLiked && "font-semibold text-rose-500")}
            >
              {t("like", { count: likesCount })}
            </button>
            <button type="button">{t("reply")}</button>
          </div>
        </div>
      </div>
    </article>
  );
}
