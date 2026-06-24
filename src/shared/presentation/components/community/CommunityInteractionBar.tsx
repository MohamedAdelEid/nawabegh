"use client";

import { Bookmark, Heart, MessageSquare, Share2, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { rateCommunityArticle } from "@/modules/admin/infrastructure/api/communityArticlesApi";
import {
  bookmarkKnowledgeCommunityArticle,
  likeKnowledgeCommunityArticle,
  removeKnowledgeCommunityArticleBookmark,
  unlikeKnowledgeCommunityArticle,
} from "@/modules/teacher/infrastructure/api/knowledgeCommunityApi";
import { notify } from "@/shared/application/lib/toast";
import { cn } from "@/shared/application/lib/cn";

type CommunityInteractionBarProps = {
  articleId: string;
  likesCount: number;
  commentsCount: number;
  initialIsLiked?: boolean;
  initialIsBookmarked?: boolean;
  enableLikes?: boolean;
  enableRatings?: boolean;
  onLikeChange?: (state: { isLiked: boolean; likesCount: number }) => void;
  onBookmarkChange?: (isBookmarked: boolean) => void;
};

export function CommunityInteractionBar({
  articleId,
  likesCount,
  commentsCount,
  initialIsLiked = false,
  initialIsBookmarked = false,
  enableLikes = true,
  enableRatings = true,
  onLikeChange,
  onBookmarkChange,
}: CommunityInteractionBarProps) {
  const t = useTranslations("teacher.dashboard.knowledgeCommunity.article.interactions");
  const [likes, setLikes] = useState(likesCount);
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked);
  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLikes(likesCount);
    setIsLiked(initialIsLiked);
    setIsBookmarked(initialIsBookmarked);
  }, [likesCount, initialIsLiked, initialIsBookmarked]);

  const handleLikeToggle = async () => {
    if (!enableLikes || submitting) return;
    setSubmitting(true);
    const result = isLiked
      ? await unlikeKnowledgeCommunityArticle(articleId)
      : await likeKnowledgeCommunityArticle(articleId);
    setSubmitting(false);

    if (result.errorMessage) {
      notify.error(result.errorMessage);
      return;
    }

    const nextIsLiked = !isLiked;
    const nextLikesCount = isLiked ? Math.max(0, likes - 1) : likes + 1;

    setIsLiked(nextIsLiked);
    setLikes(nextLikesCount);
    onLikeChange?.({ isLiked: nextIsLiked, likesCount: nextLikesCount });
  };

  const handleBookmarkToggle = async () => {
    if (submitting) return;
    setSubmitting(true);
    const result = isBookmarked
      ? await removeKnowledgeCommunityArticleBookmark(articleId)
      : await bookmarkKnowledgeCommunityArticle(articleId);
    setSubmitting(false);

    if (result.errorMessage) {
      notify.error(result.errorMessage);
      return;
    }

    setIsBookmarked((value) => !value);
    onBookmarkChange?.(!isBookmarked);
    notify.success(isBookmarked ? t("bookmarkRemoved") : t("bookmarkSaved"));
  };

  const handleRate = async (value: number) => {
    if (!enableRatings) return;
    const result = await rateCommunityArticle(articleId, value);
    if (result.errorMessage) {
      notify.error(result.errorMessage);
      return;
    }
    setRating(value);
    notify.success(t("rated"));
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
        <button
          type="button"
          disabled={submitting}
          onClick={() => void handleLikeToggle()}
          className={cn("inline-flex items-center gap-2", isLiked && "text-rose-500")}
        >
          <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
          {likes.toLocaleString()}
        </button>
        <span className="inline-flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          {commentsCount}
        </span>
        <button
          type="button"
          disabled={submitting}
          onClick={() => void handleBookmarkToggle()}
          className={cn("inline-flex items-center gap-2", isBookmarked && "text-[#2C4260]")}
        >
          <Bookmark className={cn("h-4 w-4", isBookmarked && "fill-current")} />
          {isBookmarked ? t("saved") : t("save")}
        </button>
        <button type="button" className="inline-flex items-center gap-2">
          <Share2 className="h-4 w-4" />
          {t("share")}
        </button>
      </div>
      {enableRatings ? (
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">{t("yourRating")}</span>
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, index) => {
              const value = index + 1;
              return (
                <button key={value} type="button" onClick={() => void handleRate(value)}>
                  <Star
                    className={cn(
                      "h-4 w-4",
                      value <= rating ? "fill-amber-400 text-amber-400" : "text-slate-300",
                    )}
                  />
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
