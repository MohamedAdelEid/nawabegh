import type { ArticleRow } from "@/modules/admin/domain/data/articleEditorDashboardData";
import type {
  CommunityArticleDetailDto,
  CommunityCommentDto,
} from "@/modules/admin/infrastructure/api/communityArticlesApi";
import type {
  CommunityAuthorProfile,
  CommunityAuthorSummary,
  CommunityFeedPost,
} from "@/modules/teacher/domain/types/knowledgeCommunity.types";
import { resolveFileUrl } from "@/shared/infrastructure/files/fileUrl";

export function mapArticleRowToFeedPost(row: ArticleRow): CommunityFeedPost {
  return { ...row };
}

export function mapArticleDetailToFeedPost(article: CommunityArticleDetailDto): CommunityFeedPost {
  const primary = article.categories.find((c) => c.isPrimary) ?? article.categories[0];
  const excerpt = article.content.replace(/<[^>]+>/g, " ").trim().slice(0, 220);
  return {
    id: article.articleId,
    title: article.title,
    category: primary?.name ?? "—",
    readTimeMinutes: Math.max(1, Math.round(excerpt.split(/\s+/).filter(Boolean).length / 200)),
    authorName: article.author?.fullName ?? "—",
    authorAvatarImageUrl: article.author?.avatarUrl ?? null,
    authorRole: article.author?.specialty ?? "—",
    schoolName: article.author?.institution ?? "—",
    likesCount: article.likesCount,
    commentsCount: article.commentsCount,
    viewsCount: article.viewsCount,
    publishedAt: article.publishedAt ?? article.createdAt,
    statusId: "published",
    isHidden: false,
    excerpt,
    coverImageUrl: resolveFileUrl(article.coverImageUrl),
    authorUserId: article.author?.userId,
  };
}

export function buildAuthorSummariesFromPosts(posts: CommunityFeedPost[]): CommunityAuthorSummary[] {
  const map = new Map<string, CommunityAuthorSummary>();

  for (const post of posts) {
    const userId = post.authorUserId?.trim();
    if (!userId) continue;
    const existing = map.get(userId);
    if (existing) {
      existing.articlesCount += 1;
      continue;
    }
    map.set(userId, {
      userId,
      fullName: post.authorName,
      specialty: post.authorRole,
      avatarUrl: post.authorAvatarImageUrl,
      articlesCount: 1,
      followersCount: 0,
      isFollowing: false,
    });
  }

  return Array.from(map.values()).slice(0, 5);
}

export function buildAuthorProfileFromPosts(
  authorId: string,
  posts: CommunityFeedPost[],
  authorArticle?: CommunityArticleDetailDto | null,
): CommunityAuthorProfile {
  const authorPosts = posts.filter((p) => p.authorUserId === authorId);
  const first = authorPosts[0];
  const author = authorArticle?.author;

  return {
    userId: authorId,
    fullName: author?.fullName ?? first?.authorName ?? "—",
    specialty: author?.specialty ?? first?.authorRole ?? "—",
    bio: author?.specialty
      ? `${author.specialty} — ${author.institution ?? ""}`.trim()
      : first?.schoolName ?? "",
    location: author?.institution ?? first?.schoolName ?? "—",
    joinedAtLabel: authorArticle?.createdAt ?? first?.publishedAt ?? "",
    avatarUrl: author?.avatarUrl ?? first?.authorAvatarImageUrl ?? null,
    bannerImageUrl: null,
    points: authorPosts.reduce((sum, post) => sum + post.likesCount * 2 + post.viewsCount, 0),
    publishedArticlesCount: authorPosts.length,
    followersCount: Math.max(authorPosts.length * 120, 0),
    followingCount: Math.max(authorPosts.length * 25, 0),
    interactionsCount: authorPosts.reduce(
      (sum, post) => sum + post.likesCount + post.commentsCount,
      0,
    ),
    earnedBadges: [],
    profileBadges: [],
    skills: [],
    socialLinks: [],
    isFollowing: false,
  };
}

export function nestCommunityComments(comments: CommunityCommentDto[]) {
  const roots = comments.filter((c) => !c.parentCommentId);
  const repliesByParent = new Map<string, CommunityCommentDto[]>();
  for (const comment of comments) {
    if (!comment.parentCommentId) continue;
    const list = repliesByParent.get(comment.parentCommentId) ?? [];
    list.push(comment);
    repliesByParent.set(comment.parentCommentId, list);
  }
  return roots.map((comment) => ({
    comment,
    replies: repliesByParent.get(comment.commentId) ?? [],
  }));
}

export function formatCommunityRelativeTime(iso: string, locale: string): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return locale.startsWith("ar") ? "الآن" : "Just now";
  if (minutes < 60) {
    return locale.startsWith("ar") ? `منذ ${minutes} دقيقة` : `${minutes}m ago`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return locale.startsWith("ar") ? `منذ ${hours} ساعة` : `${hours}h ago`;
  }
  const days = Math.floor(hours / 24);
  return locale.startsWith("ar") ? `منذ ${days} يوم` : `${days}d ago`;
}
