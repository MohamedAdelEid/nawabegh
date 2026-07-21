export type SchoolArticleStatus =
  | "Draft"
  | "PendingReview"
  | "NeedsEdits"
  | "Published"
  | "Hidden"
  | "Removed";

export type SchoolArticleStatusFilter = "all" | SchoolArticleStatus;

export type SchoolCommunityContentSource = "All" | "School" | "Students";

export type SchoolCommunityArticleActions = {
  canEdit: boolean;
  canSubmit: boolean;
  canApprove: boolean;
  canReject: boolean;
  canRequestEdits: boolean;
  canHide: boolean;
  canUnhide: boolean;
  canDelete: boolean;
  canHideComment: boolean;
  canDeleteComment: boolean;
};

export type SchoolCommunityAuthor = {
  userId: string;
  fullName: string;
  avatarUrl: string | null;
  specialty: string;
  primaryBadge: string | null;
  email: string | null;
  institution: string | null;
  location: string | null;
};

export type SchoolCommunityCategory = {
  id: string;
  name: string;
  isPrimary?: boolean;
};

export type SchoolCommunityTag = {
  name: string;
};

export type SchoolCommunityArticleCore = {
  articleId: string;
  title: string;
  excerpt: string;
  content: string;
  coverImageUrl: string | null;
  status: SchoolArticleStatus;
  isFeatured: boolean;
  primaryCategory: SchoolCommunityCategory | null;
  categories: SchoolCommunityCategory[];
  tags: SchoolCommunityTag[];
  likesCount: number;
  commentsCount: number;
  viewsCount: number;
  createdAt: string;
  publishedAt: string | null;
  author: SchoolCommunityAuthor;
  schoolName: string;
  reportCount: number;
  moderationHistory: Array<{
    action: string;
    adminId: string;
    reason: string | null;
    metadataJson: string | null;
    createdAt: string;
  }>;
};

export type SchoolCommunityArticleListItem = {
  article: SchoolCommunityArticleCore;
  statusLabel: string;
  isAuthoredBySchool: boolean;
  actions: SchoolCommunityArticleActions;
};

export type SchoolCommunityStats = {
  totalArticles: number;
  pendingReviewCount: number;
  publishedTodayCount: number;
  reportedCount: number;
};

export type SchoolCommunityPagination = {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
};

export type SchoolCommunityDashboardData = {
  stats: SchoolCommunityStats;
  articles: SchoolCommunityArticleListItem[];
  pagination: SchoolCommunityPagination;
};

export type SchoolCommunityArticleDetail = {
  article: SchoolCommunityArticleCore;
  statusLabel: string;
  isAuthoredBySchool: boolean;
  actions: SchoolCommunityArticleActions;
};

export type SchoolCommunityComment = {
  commentId: string;
  content: string;
  status: string;
  likesCount: number;
  createdAt: string;
  isReply: boolean;
  parentCommentId: string | null;
  author: SchoolCommunityAuthor;
};

export type SchoolCommunityDropdownOption = {
  id: string;
  name: string;
};

export type SchoolCommunityPrivacyMode = "Public" | "SchoolPrivate";
export type SchoolCommunityModerationMode = "PreModeration" | "PostModeration";
export type SchoolCommunityFeedSort = "Recent" | "Trending";

export type SchoolCommunitySettings = {
  id: string;
  schoolId: string;
  privacyMode: SchoolCommunityPrivacyMode;
  moderationMode: SchoolCommunityModerationMode;
  enablePublishing: boolean;
  enableComments: boolean;
  enableLikes: boolean;
  enableRatings: boolean;
  enableFollowing: boolean;
  feedSortDefault: SchoolCommunityFeedSort;
  updatedAt: string | null;
  updatedByAdminId: string | null;
};

export type SchoolCommunitySettingsResponse = {
  settings: SchoolCommunitySettings;
  isInheritedFromGlobal: boolean;
};

export type SchoolCommunityArticleWritePayload = {
  title: string;
  content: string;
  coverImageUrl?: string | null;
  categoryIds: string[];
  primaryCategoryId: string;
  tags: string[];
};

export type SchoolCommunityRejectPayload = {
  reasons: string[];
  additionalNotes?: string;
};

export type SchoolCommunityRequestEditsPayload = {
  notes: string;
  hideFromFeed: boolean;
};

export type SchoolCommunityHidePayload = {
  reason?: string;
};

export type SchoolCommunityArticlesQuery = {
  status?: SchoolArticleStatusFilter;
  contentSource?: SchoolCommunityContentSource;
  categoryId?: string;
  search?: string;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  sortDesc?: boolean;
};

export type SchoolCommunityPatchSettingsPayload = Partial<{
  privacyMode: SchoolCommunityPrivacyMode;
  moderationMode: SchoolCommunityModerationMode;
  enablePublishing: boolean;
  enableComments: boolean;
  enableLikes: boolean;
  enableRatings: boolean;
  enableFollowing: boolean;
  feedSortDefault: SchoolCommunityFeedSort;
}>;
