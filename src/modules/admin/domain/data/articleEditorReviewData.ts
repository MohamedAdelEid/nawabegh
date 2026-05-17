import type { ArticleStatusId } from "@/modules/admin/domain/data/articleEditorDashboardData";
import {
  getCommunityArticleById,
  getCommunityArticleComments,
  deleteCommunityComment,
  hideCommunityComment,
  mapCommunityArticleStatus,
  requestCommunityArticleEdits,
  suspendCommunityUser,
  type CommunityArticleDetailDto,
  type CommunityCommentDto,
} from "@/modules/admin/infrastructure/api/communityArticlesApi";
import { getUserDisplayInitials } from "@/shared/application/lib/userDisplayInitials";

export type ArticleReviewDecision = "approve" | "reject" | "needsChanges";

export type ArticleReviewReasonId =
  | "language"
  | "grammar"
  | "format"
  | "imageQuality"
  | "policy";

export type ArticleCommentModerationAction = "delete" | "hide";

export type CommentAuthorSuspensionDuration = "day" | "week" | "month" | "permanent";

/** Raw comment status from API (`CommunityCommentStatus`); `0` = visible in admin list. */
export type ArticleReviewComment = {
  id: string;
  /** Community user id for admin suspend (`CommunityUsers/{id}/suspend`). */
  authorUserId: string;
  authorName: string;
  authorRole: string;
  authorEmail: string;
  authorAvatarImageUrl: string | null;
  message: string;
  createdAtLabel: string;
  canModerate: boolean;
  serverCommentStatus: number;
};

export type ArticleReviewDetail = {
  id: string;
  title: string;
  statusId: ArticleStatusId;
  /** Article author community user id (when provided by API). */
  authorUserId: string;
  category: string;
  tags: string[];
  readTimeMinutes: number;
  authorName: string;
  authorRole: string;
  authorAvatarInitials: string;
  authorAvatarImageUrl: string | null;
  schoolName: string;
  coverImageAlt: string;
  coverImageUrl: string | null;
  content: string;
  keyPoints: string[];
  stats: {
    commentsCount: number;
    viewsCount: number;
  };
  reviewSummary: {
    informationCompletionPercent: number;
  };
  comments: ArticleReviewComment[];
};

function estimateReadMinutesFromText(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  if (words === 0) return 1;
  return Math.max(1, Math.round(words / 200));
}

function mapTagsFromApi(tags: unknown[]): string[] {
  return tags
    .map((item) => {
      if (typeof item === "string") return item.trim();
      if (item !== null && typeof item === "object") {
        const r = item as Record<string, unknown>;
        const name = typeof r.name === "string" ? r.name : typeof r.label === "string" ? r.label : "";
        return name.trim();
      }
      return "";
    })
    .filter(Boolean);
}

function primaryCategoryName(article: CommunityArticleDetailDto): string {
  const primary = article.categories.find((c) => c.isPrimary) ?? article.categories[0];
  return primary?.name ?? "—";
}

function formatCommentDate(iso: string, locale: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat(locale.startsWith("ar") ? "ar-EG" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
}

function suspensionDurationToApiDurationType(
  duration: CommentAuthorSuspensionDuration,
): number {
  /** Align with backend enum order: Day = 0, Week = 1, Month = 2, Permanent = 3. */
  switch (duration) {
    case "day":
      return 1;
    case "week":
      return 2;
    case "month":
      return 3;
    case "permanent":
      return 4;
    default:
      return 1;
  }
}

function mapCommentDto(dto: CommunityCommentDto, locale: string): ArticleReviewComment {
  const author = dto.author;
  const authorName = author?.fullName ?? "—";
  return {
    id: dto.commentId,
    authorUserId: author?.userId?.trim() ?? "",
    authorName,
    authorRole: author?.specialty ?? "—",
    authorEmail: author?.email ?? "",
    authorAvatarImageUrl: author?.avatarUrl ?? null,
    message: dto.content,
    createdAtLabel: formatCommentDate(dto.createdAt, locale),
    canModerate: true,
    serverCommentStatus: dto.status,
  };
}

function mapArticleToReviewDetail(
  article: CommunityArticleDetailDto,
  commentDtos: CommunityCommentDto[],
  localeHint: string,
): ArticleReviewDetail {
  const author = article.author;
  const authorName = author?.fullName ?? "—";
  const institution = author?.institution?.trim() ?? "";

  return {
    id: article.articleId,
    title: article.title,
    statusId: mapCommunityArticleStatus(article.status),
    authorUserId: author?.userId?.trim() ?? "",
    category: primaryCategoryName(article),
    tags: mapTagsFromApi(article.tags),
    readTimeMinutes: estimateReadMinutesFromText(article.content),
    authorName,
    authorRole: author?.specialty ?? "—",
    authorAvatarInitials: getUserDisplayInitials(authorName),
    authorAvatarImageUrl: author?.avatarUrl ?? null,
    schoolName: institution || "—",
    coverImageAlt: article.title,
    coverImageUrl: article.coverImageUrl,
    content: article.content,
    keyPoints: [],
    stats: {
      commentsCount: article.commentsCount,
      viewsCount: article.viewsCount,
    },
    reviewSummary: {
      informationCompletionPercent: article.isFeatured ? 88 : 72,
    },
    comments: commentDtos.map((c) => mapCommentDto(c, localeHint)),
  };
}

export async function getArticleReviewDetailById(
  articleId: string,
  localeHint = "ar",
): Promise<ArticleReviewDetail | null> {
  const [articleRes, commentsRes] = await Promise.all([
    getCommunityArticleById(articleId),
    getCommunityArticleComments(articleId),
  ]);

  if (!articleRes.data) {
    return null;
  }

  const comments = commentsRes.data ?? [];
  return mapArticleToReviewDetail(articleRes.data, comments, localeHint);
}

/**
 * Moderate a single comment (hide or delete) via admin APIs.
 */
export async function submitArticleCommentModeration(
  articleId: string,
  commentId: string,
  action: ArticleCommentModerationAction,
  hideReason?: string,
): Promise<{ ok: boolean; errorMessage?: string }> {
  void articleId;
  if (action === "delete") {
    const res = await deleteCommunityComment(commentId);
    return { ok: !res.errorMessage, errorMessage: res.errorMessage };
  }
  const reason = hideReason?.trim() || "";
  const res = await hideCommunityComment(commentId, {
    reason: reason.length > 0 ? reason : "—",
  });
  return { ok: !res.errorMessage, errorMessage: res.errorMessage };
}

/**
 * Suspend a community user (e.g. comment author) via admin API.
 */
export async function submitArticleCommentAuthorSuspension(
  communityUserId: string,
  payload: { duration: CommentAuthorSuspensionDuration; reason: string },
): Promise<{ ok: boolean; errorMessage?: string; message?: string }> {
  const userId = communityUserId.trim();
  if (!userId) {
    return { ok: false, errorMessage: "Missing community user id" };
  }
  const res = await suspendCommunityUser(userId, {
    durationType: suspensionDurationToApiDurationType(payload.duration),
    reason: payload.reason.trim() || "—",
  });
  if (res.errorMessage) {
    return { ok: false, errorMessage: res.errorMessage };
  }
  return { ok: true, message: res.message };
}

export type ArticleAmendmentRequestPayload = {
  hideFromPlatform: boolean;
  reviewNotes: string;
};

/** Request edits from the author (`request-edits` admin endpoint). */
export async function submitArticleAmendmentRequest(
  articleId: string,
  payload: ArticleAmendmentRequestPayload,
): Promise<{ ok: boolean; errorMessage?: string; message?: string }> {
  const res = await requestCommunityArticleEdits(articleId, {
    notes: payload.reviewNotes.trim() || "—",
    hideFromFeed: payload.hideFromPlatform,
  });
  if (res.errorMessage) {
    return { ok: false, errorMessage: res.errorMessage };
  }
  return { ok: true, message: res.message };
}
