import type { CommunityAuthorProfile } from "@/modules/teacher/domain/types/knowledgeCommunity.types";
import type {
  KnowledgeCommunityAuthorArticleDto,
  KnowledgeCommunityAuthorProfileDto,
} from "@/modules/teacher/infrastructure/api/knowledgeCommunityApi";
import type { CommunityFeedPost } from "@/modules/teacher/domain/types/knowledgeCommunity.types";

export function mapKnowledgeCommunityAuthorArticleToFeedPost(
  article: KnowledgeCommunityAuthorArticleDto,
): CommunityFeedPost {
  const excerpt = article.excerpt.trim();
  return {
    id: article.articleId,
    title: article.title,
    category: article.primaryCategory?.name ?? "—",
    readTimeMinutes: Math.max(1, Math.round(excerpt.split(/\s+/).filter(Boolean).length / 200)),
    authorName: "—",
    authorAvatarImageUrl: null,
    authorRole: "—",
    schoolName: "—",
    likesCount: article.likesCount,
    commentsCount: article.commentsCount,
    viewsCount: 0,
    publishedAt: article.publishedAt,
    statusId: "published",
    isHidden: false,
    excerpt,
    coverImageUrl: article.coverImageUrl,
    isLikedByCurrentUser: article.isLikedByCurrentUser,
    isBookmarkedByCurrentUser: article.isBookmarkedByCurrentUser,
  };
}

export function mapKnowledgeCommunityAuthorProfile(
  profile: KnowledgeCommunityAuthorProfileDto,
): CommunityAuthorProfile {
  return {
    userId: profile.userId,
    fullName: profile.fullName,
    specialty: profile.specialty,
    bio: profile.bio || profile.institution,
    location: profile.location || profile.institution,
    joinedAtLabel: profile.joinedAt,
    avatarUrl: profile.avatarUrl,
    bannerImageUrl: profile.bannerImageUrl,
    points: profile.currentPoints,
    publishedArticlesCount: profile.totalPosts,
    followersCount: profile.followersCount,
    followingCount: profile.followingCount,
    interactionsCount: profile.totalLikesReceived,
    earnedBadges: profile.earnedAchievementBadges,
    profileBadges: profile.badges,
    skills: profile.skills,
    socialLinks: [],
    isFollowing: profile.isFollowedByViewer,
  };
}

export function sortAuthorArticles(
  articles: KnowledgeCommunityAuthorArticleDto[],
  tab: "mostRead" | "topRated" | "all",
): KnowledgeCommunityAuthorArticleDto[] {
  const copy = [...articles];
  if (tab === "topRated") {
    return copy.sort((a, b) => b.likesCount - a.likesCount);
  }
  if (tab === "mostRead") {
    return copy.sort((a, b) => b.commentsCount - a.commentsCount || b.likesCount - a.likesCount);
  }
  return copy.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}
