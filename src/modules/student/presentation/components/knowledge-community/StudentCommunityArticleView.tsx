"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useStudentCommunityArticle } from "@/modules/student/application/hooks/useStudentCommunityArticle";
import type { CommunityCommentDto } from "@/modules/admin/infrastructure/api/communityArticlesApi";
import { formatCommunityRelativeTime } from "@/modules/teacher/domain/utils/knowledgeCommunityMappers";
import { CommunityCommentSection } from "@/shared/presentation/components/community/CommunityCommentSection";
import { CommunityInteractionBar } from "@/shared/presentation/components/community/CommunityInteractionBar";
import { CommunityMediaImage } from "@/shared/presentation/components/community/CommunityMediaImage";
import {
  CommunityNewsletterWidget,
  CommunityTopArticlesWidget,
} from "@/shared/presentation/components/community/CommunitySidebarWidgets";
import { CommunityPageShell, CommunitySidebarCard } from "@/shared/presentation/components/community/CommunityPageShell";
import { useScopedDashboardRoutes } from "@/shared/application/hooks/useScopedDashboardRoutes";
import { CommunityAuthorLink } from "@/shared/presentation/components/community/CommunityAuthorLink";
import { CommunityFollowButton } from "@/shared/presentation/components/community/CommunityFollowButton";
import { getKnowledgeCommunityAuthorProfile } from "@/modules/teacher/infrastructure/api/knowledgeCommunityApi";
import { StudentCommunityArticleSkeleton } from "@/modules/student/presentation/components/knowledge-community/StudentCommunityArticleSkeleton";
import { UserAvatarImageOrInitials } from "@/shared/presentation/components/user";
import { ApiFailureAlert } from "@/shared/presentation/components/ui/ApiFailureAlert";

export function StudentCommunityArticleView({ articleId }: { articleId: string }) {
  const t = useTranslations("student.dashboard.knowledgeCommunity.article");
  const tCommon = useTranslations("student.dashboard");
  const locale = useLocale();
  const routes = useScopedDashboardRoutes();
  const { data, loading, error, feedPost, refreshEngagement } = useStudentCommunityArticle(articleId);
  const [isFollowingAuthor, setIsFollowingAuthor] = useState(false);
  const [comments, setComments] = useState<CommunityCommentDto[]>([]);
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    if (!data) return;
    setComments(data.comments);
    setLikesCount(data.article.likesCount);
    setIsLiked(data.article.isLikedByCurrentUser ?? false);
    setIsBookmarked(data.article.isBookmarkedByCurrentUser ?? false);
  }, [data]);

  useEffect(() => {
    const authorId = data?.article.author?.userId;
    if (!authorId) return;
    void getKnowledgeCommunityAuthorProfile(authorId).then((result) => {
      if (result.data) {
        setIsFollowingAuthor(result.data.isFollowedByViewer);
      }
    });
  }, [data?.article.author?.userId]);

  if (loading) {
    return <StudentCommunityArticleSkeleton label={tCommon("common.loading")} />;
  }

  if (error || !data) {
    return <ApiFailureAlert message={error ?? t("notFound")} fallbackMessage={t("notFound")} />;
  }

  const { article, relatedArticles } = data;
  const primaryCategory = article.categories.find((c) => c.isPrimary) ?? article.categories[0];

  return (
    <CommunityPageShell
      title={t("pageTitle")}
      sidebar={
        <>
          <CommunitySidebarCard title={t("authorCard.title")}>
            <div className="text-center">
              <CommunityAuthorLink userId={article.author?.userId} className="mx-auto block w-fit">
                <UserAvatarImageOrInitials
                  trackKey={article.author?.userId ?? article.articleId}
                  name={article.author?.fullName ?? "—"}
                  imageUrl={article.author?.avatarUrl}
                  size="xl"
                  circleClassName="mx-auto"
                />
              </CommunityAuthorLink>
              {article.author?.userId ? (
                <CommunityAuthorLink userId={article.author.userId} className="mt-4 block">
                  <h3 className="text-lg font-bold text-[#2C4260] hover:underline">
                    {article.author.fullName}
                  </h3>
                </CommunityAuthorLink>
              ) : (
                <h3 className="mt-4 text-lg font-bold text-[#2C4260]">{article.author?.fullName}</h3>
              )}
              <p className="mt-2 text-sm leading-6 text-slate-500">{article.author?.specialty}</p>
              <CommunityFollowButton
                userId={article.author?.userId ?? ""}
                isFollowing={isFollowingAuthor}
                onFollowingChange={setIsFollowingAuthor}
                fullWidth
              />
            </div>
          </CommunitySidebarCard>
          <CommunityTopArticlesWidget articles={relatedArticles} />
          <CommunityNewsletterWidget />
        </>
      }
    >
      <nav className="text-right text-sm text-slate-500">
        <Link href={routes.knowledgeCommunity.LIST} className="hover:text-[#2C4260]">
          {t("breadcrumbs.home")}
        </Link>
        <span className="mx-2">›</span>
        <span>{primaryCategory?.name ?? t("breadcrumbs.category")}</span>
        <span className="mx-2">›</span>
        <span className="text-[#2C4260]">{t("breadcrumbs.current")}</span>
      </nav>

      <article className="rounded-[1.5rem] border border-white/80 bg-white p-6 shadow-[var(--dashboard-shadow-soft)]">
        <div className="space-y-4 text-right">
          <h1 className="text-3xl font-bold text-[#2C4260]">{article.title}</h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
            <CommunityAuthorLink userId={article.author?.userId}>
              <UserAvatarImageOrInitials
                trackKey={article.author?.userId ?? article.articleId}
                name={article.author?.fullName ?? "—"}
                imageUrl={article.author?.avatarUrl}
                size="sm"
              />
            </CommunityAuthorLink>
            {article.author?.userId ? (
              <CommunityAuthorLink userId={article.author.userId}>
                <span className="font-medium text-[#2C4260] hover:underline">{article.author.fullName}</span>
              </CommunityAuthorLink>
            ) : (
              <span>{article.author?.fullName}</span>
            )}
            <span>•</span>
            <span>{article.author?.specialty}</span>
            <span>•</span>
            <span>{formatCommunityRelativeTime(article.publishedAt ?? article.createdAt, locale)}</span>
            {feedPost ? (
              <>
                <span>•</span>
                <span>{t("readTime", { minutes: feedPost.readTimeMinutes })}</span>
              </>
            ) : null}
          </div>
        </div>

        {article.coverImageUrl ? (
          <div className="mt-6 overflow-hidden rounded-2xl">
            <CommunityMediaImage
              src={article.coverImageUrl}
              alt={article.title}
              className="h-72"
            />
          </div>
        ) : null}

        <div
          className="prose prose-sm mt-6 max-w-none text-right leading-8 text-slate-700"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        <div className="mt-8">
          <CommunityInteractionBar
            articleId={article.articleId}
            likesCount={likesCount}
            commentsCount={comments.length}
            initialIsLiked={isLiked}
            initialIsBookmarked={isBookmarked}
            enableLikes
            enableRatings={false}
            onLikeChange={({ isLiked: nextLiked, likesCount: nextLikesCount }) => {
              setIsLiked(nextLiked);
              setLikesCount(nextLikesCount);
            }}
            onBookmarkChange={setIsBookmarked}
          />
        </div>
      </article>

      <CommunityCommentSection
        articleId={article.articleId}
        initialComments={comments}
        enabled
        onCommentsChange={setComments}
        onRefreshComments={refreshEngagement}
      />
    </CommunityPageShell>
  );
}
