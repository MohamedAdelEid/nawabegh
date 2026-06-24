import type { ArticleRow } from "@/modules/admin/domain/data/articleEditorDashboardData";
import type {
  CommunityArticleDetailDto,
  CommunityCommentDto,
  CommunityFeedSort,
} from "@/modules/admin/infrastructure/api/communityArticlesApi";
import type {
  KnowledgeCommunityAchievementBadgeDto,
  KnowledgeCommunityAuthorBadgeDto,
  KnowledgeCommunityAuthorSkillDto,
} from "@/modules/teacher/infrastructure/api/knowledgeCommunityApi";
import type { CommunitySettings } from "@/modules/admin/domain/types/communitySettings.types";

export type { CommunityFeedSort };

export type CommunityFeedPost = ArticleRow & {
  excerpt?: string;
  coverImageUrl?: string | null;
  authorUserId?: string;
  attachmentFileName?: string | null;
  attachmentUrl?: string | null;
  isLikedByCurrentUser?: boolean;
  isBookmarkedByCurrentUser?: boolean;
};

export type CommunityAuthorSummary = {
  userId: string;
  fullName: string;
  specialty: string;
  avatarUrl: string | null;
  articlesCount: number;
  followersCount: number;
  isFollowing?: boolean;
};

export type CommunityAuthorProfile = {
  userId: string;
  fullName: string;
  specialty: string;
  bio: string;
  location: string;
  joinedAtLabel: string;
  avatarUrl: string | null;
  bannerImageUrl: string | null;
  points: number;
  publishedArticlesCount: number;
  followersCount: number;
  followingCount: number;
  interactionsCount: number;
  earnedBadges: KnowledgeCommunityAchievementBadgeDto[];
  profileBadges: KnowledgeCommunityAuthorBadgeDto[];
  skills: KnowledgeCommunityAuthorSkillDto[];
  socialLinks: Array<{ id: string; label: string; href: string }>;
  isFollowing: boolean;
};

export type CommunityPostDraft = {
  title: string;
  categoryId: string;
  categoryLabel: string;
  content: string;
  coverImageUrl: string | null;
  attachmentUrl: string | null;
  attachmentFileName: string | null;
};

export type CommunityFeedState = {
  posts: CommunityFeedPost[];
  topArticles: CommunityFeedPost[];
  topAuthors: CommunityAuthorSummary[];
  badges: import("@/modules/admin/domain/types/communityBadges.types").CommunityBadgeRow[];
  settings: CommunitySettings | null;
  totalItems: number;
};

export type CommunityArticleViewModel = {
  article: CommunityArticleDetailDto;
  comments: CommunityCommentDto[];
  relatedArticles: CommunityFeedPost[];
};

export const COMMUNITY_POST_DRAFT_STORAGE_KEY = "teacher-community-post-draft";
