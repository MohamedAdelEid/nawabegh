import type { ArticleRow, ArticleStatusId } from "@/modules/admin/domain/data/articleEditorDashboardData";
import { ArticleStatus } from "@/modules/admin/domain/entities/community.enums";
import type { BackendApiResponse, BackendStatus } from "@/shared/domain/types/api.types";
import {
  extractApiErrorMessage,
  getApiErrorMessage,
  isApiSuccess,
} from "@/shared/infrastructure/api/apiResponse.utils";
import { httpClient } from "@/shared/infrastructure/http/httpClient";
import {
  followKnowledgeCommunityUser,
  likeKnowledgeCommunityArticle,
} from "@/modules/teacher/infrastructure/api/knowledgeCommunityApi";

export type CommunityArticleStatusCode = 0 | 1 | 2 | 3 | 4 | 5;

export type CommunityArticleStatsDto = {
  totalArticles: number;
  pendingReviewCount: number;
  publishedTodayCount: number;
  reportedCount: number;
};

export type CommunityArticlesListParams = {
  status?: CommunityArticleStatusCode;
  schoolId?: string;
  authorId?: string;
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDesc?: boolean;
};

export type CommunityArticlesApiResult<T> = {
  status: BackendStatus | string;
  message?: string;
  errorMessage?: string;
  data: T | null;
};

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord | null {
  return value !== null && typeof value === "object" ? (value as UnknownRecord) : null;
}

function readString(record: UnknownRecord | null, keys: string[], fallback = ""): string {
  if (!record) return fallback;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string") return value;
  }
  return fallback;
}

function readNumber(record: UnknownRecord | null, keys: string[]): number | null {
  if (!record) return null;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() !== "" && !Number.isNaN(Number(value))) {
      return Number(value);
    }
  }
  return null;
}

function readArray(record: UnknownRecord | null, keys: string[]): unknown[] {
  if (!record) return [];
  for (const key of keys) {
    const value = record[key];
    if (Array.isArray(value)) return value;
  }
  return [];
}

function buildErrorResult<T>(
  error: unknown,
  fallbackMessage: string,
): CommunityArticlesApiResult<T | null> {
  const axiosError = asRecord(error);
  const response = asRecord(axiosError?.response);
  const responseData = asRecord(response?.data);
  const dataEnvelope = responseData as BackendApiResponse<unknown> | null;

  return {
    status: (typeof dataEnvelope?.status === "string" ? dataEnvelope.status : undefined) ?? "Error",
    message: typeof dataEnvelope?.message === "string" ? dataEnvelope.message : undefined,
    errorMessage: extractApiErrorMessage(error, fallbackMessage),
    data: null,
  };
}

const ARTICLE_STATUS_STRING_TO_CODE: Record<string, CommunityArticleStatusCode> = {
  draft: ArticleStatus.Draft,
  pendingreview: ArticleStatus.PendingReview,
  needsedits: ArticleStatus.NeedsEdits,
  published: ArticleStatus.Published,
  hidden: ArticleStatus.Hidden,
  removed: ArticleStatus.Removed,
};

function readArticleStatusCode(record: UnknownRecord | null): CommunityArticleStatusCode | null {
  if (!record) return null;

  const numericStatus = readNumber(record, ["status", "articleStatus", "articleStatusCode"]);
  if (
    numericStatus !== null &&
    numericStatus >= ArticleStatus.Draft &&
    numericStatus <= ArticleStatus.Removed
  ) {
    return numericStatus as CommunityArticleStatusCode;
  }

  const statusText = readString(record, ["status", "articleStatus"], "").trim();
  if (!statusText) return null;

  const normalized = statusText.replace(/\s+/g, "").toLowerCase();
  return ARTICLE_STATUS_STRING_TO_CODE[normalized] ?? null;
}

/** Maps backend ArticleStatus enum to dashboard status keys. */
export function mapCommunityArticleStatus(status: number | null | undefined): ArticleStatusId {
  switch (status) {
    case ArticleStatus.Draft:
      return "draft";
    case ArticleStatus.PendingReview:
      return "pendingReview";
    case ArticleStatus.NeedsEdits:
      return "needsEdits";
    case ArticleStatus.Published:
      return "published";
    case ArticleStatus.Hidden:
      return "hidden";
    case ArticleStatus.Removed:
      return "rejected";
    default:
      return "draft";
  }
}

export function canHideCommunityArticle(statusId: ArticleStatusId): boolean {
  return statusId === "published";
}

export function canUnhideCommunityArticle(statusId: ArticleStatusId): boolean {
  return statusId === "hidden";
}

export function resolveCommunityArticleMutationError(
  errorMessage: string | undefined,
  messages: { invalidStatusHide: string; invalidStatusUnhide: string; fallback: string },
  operation: "hide" | "unhide" = "hide",
): string {
  const normalized = errorMessage?.trim().toUpperCase();
  if (normalized === "INVALID_STATUS") {
    return operation === "unhide" ? messages.invalidStatusUnhide : messages.invalidStatusHide;
  }
  return errorMessage?.trim() || messages.fallback;
}

function estimateReadMinutesFromExcerpt(excerpt: string): number {
  const words = excerpt.trim().split(/\s+/).filter(Boolean).length;
  if (words === 0) return 1;
  return Math.max(1, Math.round(words / 200));
}

function readCountFromNumberOrArray(record: UnknownRecord | null, numericKeys: string[], arrayKeys: string[]): number {
  const numericValue = readNumber(record, numericKeys);
  if (numericValue !== null) return Math.max(0, numericValue);
  for (const key of arrayKeys) {
    const value = record?.[key];
    if (Array.isArray(value)) return value.length;
  }
  return 0;
}

function mapArticleRow(item: unknown): ArticleRow | null {
  const record = asRecord(item);
  if (!record) return null;

  const id = readString(record, ["articleId", "id"]);
  if (!id) return null;

  const authorRecord = asRecord(record.author);
  const categoryRecord = asRecord(record.primaryCategory);
  const excerpt = readString(record, ["excerpt"], "");
  const statusCode = readArticleStatusCode(record);

  const authorName = readString(authorRecord, ["fullName", "name"], "—");
  const authorAvatarRaw = readString(
    authorRecord,
    ["profileImageUrl", "avatarImageUrl", "imageUrl", "photo", "avatar", "avatarUrl", "picture"],
    "",
  );
  const authorAvatarImageUrl = authorAvatarRaw.trim() !== "" ? authorAvatarRaw : null;
  const authorRole = readString(authorRecord, ["specialty", "jobTitle", "role"], "—");
  const schoolName = readString(record, ["schoolName"], "") || "—";

  return {
    id,
    title: readString(record, ["title"], "—"),
    category: readString(categoryRecord, ["name", "title"], "—"),
    readTimeMinutes: estimateReadMinutesFromExcerpt(excerpt),
    authorName,
    authorAvatarImageUrl,
    authorUserId: readString(authorRecord, ["userId", "id"], "") || undefined,
    authorRole,
    schoolName,
    likesCount: readCountFromNumberOrArray(
      record,
      ["likesCount", "likeCount", "likes", "totalLikes"],
      ["likesList"],
    ),
    commentsCount: readCountFromNumberOrArray(
      record,
      ["commentsCount", "commentCount", "comments", "totalComments", "repliesCount"],
      ["commentsList", "comments", "replies"],
    ),
    viewsCount: readCountFromNumberOrArray(
      record,
      ["viewsCount", "viewCount", "views", "totalViews"],
      ["viewsList"],
    ),
    publishedAt: readString(record, ["publishedAt", "createdAt", "submittedAt"], "") || "",
    statusId: mapCommunityArticleStatus(statusCode),
    isHidden: statusCode === ArticleStatus.Hidden,
  };
}

function mapStats(data: unknown): CommunityArticleStatsDto | null {
  const record = asRecord(data);
  if (!record) return null;
  const statsRecord = asRecord(record.stats);
  if (!statsRecord) return null;

  return {
    totalArticles: readNumber(statsRecord, ["totalArticles"]) ?? 0,
    pendingReviewCount: readNumber(statsRecord, ["pendingReviewCount"]) ?? 0,
    publishedTodayCount: readNumber(statsRecord, ["publishedTodayCount"]) ?? 0,
    reportedCount: readNumber(statsRecord, ["reportedCount"]) ?? 0,
  };
}

export type CommunityArticlesListData = {
  stats: CommunityArticleStatsDto;
  articles: ArticleRow[];
  totalItems: number;
  page: number;
  pageSize: number;
};

export async function getCommunityArticles(
  params: CommunityArticlesListParams,
): Promise<CommunityArticlesApiResult<CommunityArticlesListData | null>> {
  try {
    const response = await httpClient.get<unknown>({
      url: "/api/v1/admin/CommunityArticles",
      params: {
        ...(params.status !== undefined ? { status: params.status } : {}),
        ...(params.schoolId ? { schoolId: params.schoolId } : {}),
        ...(params.authorId ? { authorId: params.authorId } : {}),
        ...(params.search?.trim() ? { search: params.search.trim() } : {}),
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 10,
        sortBy: params.sortBy ?? "CreatedAt",
        sortDesc: params.sortDesc ?? true,
      },
    });

    const root = asRecord(response.data);
    const payload = asRecord(root?.data) ?? root;

    const stats = mapStats(payload ?? response.data);
    const articlesRaw = readArray(payload, ["articles"]);
    const articles = articlesRaw.map(mapArticleRow).filter((row): row is ArticleRow => row !== null);

    const totalItems =
      readNumber(payload, ["totalCount", "total", "totalItems", "count"]) ?? articles.length;
    const page = readNumber(payload, ["page", "pageNumber", "currentPage"]) ?? params.page ?? 1;
    const pageSize = readNumber(payload, ["pageSize", "limit", "size"]) ?? params.pageSize ?? 10;

    if (!stats) {
      return {
        status: response.status,
        message: response.message,
        errorMessage: "Invalid articles response",
        data: null,
      };
    }

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: {
        stats,
        articles,
        totalItems,
        page,
        pageSize,
      },
    };
  } catch (error) {
    return buildErrorResult<CommunityArticlesListData>(error, "Failed to load articles");
  }
}

export async function approveCommunityArticle(
  articleId: string,
): Promise<CommunityArticlesApiResult<unknown>> {
  try {
    const response = await httpClient.post<unknown>({
      url: `/api/v1/admin/CommunityArticles/${encodeURIComponent(articleId)}/approve`,
      data: {},
    });
    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: response.data ?? true,
    };
  } catch (error) {
    return buildErrorResult<unknown>(error, "Failed to approve article");
  }
}

export type RejectCommunityArticleBody = {
  reasons: string[];
  additionalNotes: string;
};

export async function rejectCommunityArticle(
  articleId: string,
  body: RejectCommunityArticleBody,
): Promise<CommunityArticlesApiResult<unknown>> {
  try {
    const response = await httpClient.post<unknown>({
      url: `/api/v1/admin/CommunityArticles/${encodeURIComponent(articleId)}/reject`,
      data: body,
    });
    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: response.data ?? true,
    };
  } catch (error) {
    return buildErrorResult<unknown>(error, "Failed to reject article");
  }
}

/** Body for `POST /api/v1/admin/CommunityUsers/{userId}/suspend`. */
export type SuspendCommunityUserBody = {
  durationType: number;
  reason: string;
};

export async function suspendCommunityUser(
  userId: string,
  body: SuspendCommunityUserBody,
): Promise<CommunityArticlesApiResult<unknown>> {
  try {
    const response = await httpClient.post<unknown>({
      url: `/api/v1/admin/CommunityUsers/${encodeURIComponent(userId)}/suspend`,
      data: body,
    });
    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: response.data ?? true,
    };
  } catch (error) {
    return buildErrorResult<unknown>(error, "Failed to suspend community user");
  }
}

export async function deleteCommunityArticle(
  articleId: string,
): Promise<CommunityArticlesApiResult<unknown>> {
  try {
    const response = await httpClient.delete<unknown>({
      url: `/api/v1/admin/CommunityArticles/${encodeURIComponent(articleId)}`,
    });
    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: response.data ?? true,
    };
  } catch (error) {
    return buildErrorResult<unknown>(error, "Failed to delete article");
  }
}

export async function hideCommunityArticle(
  articleId: string,
): Promise<CommunityArticlesApiResult<unknown>> {
  try {
    const response = await httpClient.post<unknown>({
      url: `/api/v1/admin/CommunityArticles/${encodeURIComponent(articleId)}/hide`,
      data: {},
    });
    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: response.data ?? true,
    };
  } catch (error) {
    return buildErrorResult<unknown>(error, "Failed to hide article");
  }
}

export async function unhideCommunityArticle(
  articleId: string,
): Promise<CommunityArticlesApiResult<unknown>> {
  try {
    const response = await httpClient.post<unknown>({
      url: `/api/v1/admin/CommunityArticles/${encodeURIComponent(articleId)}/unhide`,
      data: {},
    });
    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: response.data ?? true,
    };
  } catch (error) {
    return buildErrorResult<unknown>(error, "Failed to unhide article");
  }
}

export type RequestCommunityArticleEditsBody = {
  notes: string;
  hideFromFeed: boolean;
};

export async function requestCommunityArticleEdits(
  articleId: string,
  body: RequestCommunityArticleEditsBody,
): Promise<CommunityArticlesApiResult<unknown>> {
  try {
    const response = await httpClient.post<unknown>({
      url: `/api/v1/admin/CommunityArticles/${encodeURIComponent(articleId)}/request-edits`,
      data: body,
    });
    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: response.data ?? true,
    };
  } catch (error) {
    return buildErrorResult<unknown>(error, "Failed to request article edits");
  }
}

/** Backend `CommunityCommentStatus`; `0` is treated as visible for admin UI. */
export type CommunityCommentStatusCode = number;

export type CommunityArticleAuthorDto = {
  userId: string;
  fullName: string;
  avatarUrl: string | null;
  specialty: string;
  institution: string | null;
};

export type CommunityArticleCategoryDto = {
  id: string;
  name: string;
  isPrimary?: boolean;
};

export type CommunityArticleDetailDto = {
  articleId: string;
  title: string;
  content: string;
  coverImageUrl: string | null;
  status: number;
  isFeatured: boolean;
  categories: CommunityArticleCategoryDto[];
  tags: unknown[];
  likesCount: number;
  commentsCount: number;
  viewsCount: number;
  createdAt: string;
  updatedAt: string | null;
  publishedAt: string | null;
  submittedAt: string | null;
  author: CommunityArticleAuthorDto | null;
  moderationHistory: unknown[];
  isLikedByCurrentUser?: boolean;
  isBookmarkedByCurrentUser?: boolean;
};

export type CommunityCommentAuthorDto = {
  userId: string;
  fullName: string;
  avatarUrl: string | null;
  specialty: string;
  email: string;
};

export type CommunityCommentDto = {
  commentId: string;
  content: string;
  status: CommunityCommentStatusCode;
  likesCount: number;
  createdAt: string;
  isReply: boolean;
  parentCommentId: string | null;
  author: CommunityCommentAuthorDto | null;
  isLikedByCurrentUser?: boolean;
};

function readBoolean(record: UnknownRecord | null, keys: string[], fallback = false): boolean {
  if (!record) return fallback;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "boolean") return value;
    if (value === "true") return true;
    if (value === "false") return false;
  }
  return fallback;
}

function mapArticleAuthor(record: UnknownRecord | null): CommunityArticleAuthorDto | null {
  if (!record) return null;
  const avatar = readString(record, ["avatarUrl", "profileImageUrl", "imageUrl"], "");
  return {
    userId: readString(record, ["userId", "id"], ""),
    fullName: readString(record, ["fullName", "name"], "—"),
    avatarUrl: avatar.trim() !== "" ? avatar : null,
    specialty: readString(record, ["specialty", "professionOrRole", "jobTitle", "role"], ""),
    institution: readString(record, ["institution", "schoolName"], "") || null,
  };
}

function mapArticleCategory(record: UnknownRecord | null): CommunityArticleCategoryDto | null {
  if (!record) return null;
  const id = readString(record, ["id"], "");
  const name = readString(record, ["name", "title"], "");
  if (!id || !name) return null;
  return {
    id,
    name,
    isPrimary: readBoolean(record, ["isPrimary"], false),
  };
}

function mapArticleDetailFromRecord(record: UnknownRecord): CommunityArticleDetailDto | null {
  const articleId = readString(record, ["articleId", "id"], "");
  if (!articleId) return null;

  const categoriesRaw = readArray(record, ["categories"]);
  const categories = categoriesRaw
    .map((item) => mapArticleCategory(asRecord(item)))
    .filter((c): c is CommunityArticleCategoryDto => c !== null);

  const authorRecord = asRecord(record.author);
  const tagsRaw = record.tags;
  const tags: unknown[] = Array.isArray(tagsRaw) ? tagsRaw : [];

  return {
    articleId,
    title: readString(record, ["title"], "—"),
    content: readString(record, ["content"], ""),
    coverImageUrl: readString(record, ["coverImageUrl", "coverImage"], "") || null,
    status: readArticleStatusCode(record) ?? ArticleStatus.Draft,
    isFeatured: readBoolean(record, ["isFeatured"], false),
    categories,
    tags,
    likesCount: readNumber(record, ["likesCount"]) ?? 0,
    commentsCount: readNumber(record, ["commentsCount"]) ?? 0,
    viewsCount: readNumber(record, ["viewsCount"]) ?? 0,
    createdAt: readString(record, ["createdAt"], ""),
    updatedAt: readString(record, ["updatedAt"], "") || null,
    publishedAt: readString(record, ["publishedAt"], "") || null,
    submittedAt: readString(record, ["submittedAt"], "") || null,
    author: mapArticleAuthor(authorRecord),
    moderationHistory: readArray(record, ["moderationHistory"]),
  };
}

function mapKnowledgeCommunityArticleDetail(record: UnknownRecord | null): CommunityArticleDetailDto | null {
  if (!record) return null;
  const articleId = readString(record, ["articleId", "id"], "");
  if (!articleId) return null;

  const categoryRecord = asRecord(record.primaryCategory);
  const authorRecord = asRecord(record.author);
  const cover = readString(record, ["coverImageUrl"], "");
  const publishedAt = readString(record, ["publishedAt"], "") || null;

  return {
    articleId,
    title: readString(record, ["title"], "—"),
    content: readString(record, ["content"], ""),
    coverImageUrl: cover.trim() !== "" ? cover : null,
    status: 3,
    isFeatured: readBoolean(record, ["isFeatured"], false),
    categories: categoryRecord
      ? [
          {
            id: readString(categoryRecord, ["id"], ""),
            name: readString(categoryRecord, ["name", "title"], "—"),
            isPrimary: true,
          },
        ]
      : [],
    tags: readArray(record, ["tags"]),
    likesCount: readNumber(record, ["likesCount"]) ?? 0,
    commentsCount: readNumber(record, ["commentsCount"]) ?? 0,
    viewsCount: readNumber(record, ["viewsCount"]) ?? 0,
    createdAt: publishedAt ?? "",
    updatedAt: null,
    publishedAt,
    submittedAt: null,
    author: mapArticleAuthor(authorRecord),
    moderationHistory: [],
    isLikedByCurrentUser: readBoolean(record, ["isLikedByCurrentUser"], false),
    isBookmarkedByCurrentUser: readBoolean(record, ["isBookmarkedByCurrentUser"], false),
  };
}

function flattenKnowledgeCommunityCommentNodes(nodes: unknown[]): CommunityCommentDto[] {
  const flattened: CommunityCommentDto[] = [];

  for (const item of nodes) {
    const record = asRecord(item);
    if (!record) continue;

    const parentComment = mapCommentFromRecord(record);
    if (!parentComment) continue;

    flattened.push({
      ...parentComment,
      isReply: false,
      parentCommentId: null,
    });

    for (const replyItem of readArray(record, ["replies"])) {
      const reply = mapCommentFromRecord(asRecord(replyItem));
      if (!reply) continue;
      flattened.push({
        ...reply,
        isReply: true,
        parentCommentId: parentComment.commentId,
      });
    }
  }

  return flattened;
}

function mapCommentFromRecord(record: UnknownRecord | null): CommunityCommentDto | null {
  if (!record) return null;
  const commentId = readString(record, ["commentId", "id"], "");
  if (!commentId) return null;
  const authorRecord = asRecord(record.author);
  const avatar = readString(authorRecord, ["avatarUrl", "profileImageUrl"], "");
  return {
    commentId,
    content: readString(record, ["content"], ""),
    status: readNumber(record, ["status"]) ?? 0,
    likesCount: readNumber(record, ["likesCount"]) ?? 0,
    createdAt: readString(record, ["createdAt"], ""),
    isReply: readBoolean(record, ["isReply"], false),
    parentCommentId: readString(record, ["parentCommentId"], "") || null,
    isLikedByCurrentUser: readBoolean(record, ["isLikedByCurrentUser"], false),
    author: authorRecord
      ? {
          userId: readString(authorRecord, ["userId", "id"], ""),
          fullName: readString(authorRecord, ["fullName", "name"], "—"),
          avatarUrl: avatar.trim() !== "" ? avatar : null,
          specialty: readString(authorRecord, ["specialty", "professionOrRole", "jobTitle"], ""),
          email: readString(authorRecord, ["email"], ""),
        }
      : null,
  };
}

export async function getCommunityArticleById(
  articleId: string,
): Promise<CommunityArticlesApiResult<CommunityArticleDetailDto | null>> {
  try {
    const response = await httpClient.get<unknown>({
      url: `/api/v1/admin/CommunityArticles/${encodeURIComponent(articleId)}`,
    });
    const root = asRecord(response.data);
    const dataNode = asRecord(root?.data) ?? asRecord(response.data);
    if (!dataNode) {
      return {
        status: response.status,
        message: response.message,
        errorMessage: response.error?.message ?? "Article not found",
        data: null,
      };
    }
    const mapped = mapArticleDetailFromRecord(dataNode);
    if (!mapped) {
      return {
        status: response.status,
        message: response.message,
        errorMessage: "Invalid article payload",
        data: null,
      };
    }
    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: mapped,
    };
  } catch (error) {
    return buildErrorResult<CommunityArticleDetailDto>(error, "Failed to load article");
  }
}

export async function getKnowledgeCommunityArticleById(
  articleId: string,
): Promise<CommunityArticlesApiResult<CommunityArticleDetailDto | null>> {
  try {
    const response = await httpClient.get<unknown>({
      url: `/api/v1/knowledgeCommunity/articles/${encodeURIComponent(articleId)}`,
    });

    if (!isApiSuccess(response)) {
      return {
        status: response.status,
        message: response.message,
        errorMessage: getApiErrorMessage(response, "Article not found"),
        data: null,
      };
    }

    const root = asRecord(response.data);
    const dataNode = asRecord(root?.data) ?? asRecord(response.data);
    const mapped = mapKnowledgeCommunityArticleDetail(dataNode);
    if (!mapped) {
      return {
        status: response.status,
        message: response.message,
        errorMessage: "Invalid article payload",
        data: null,
      };
    }

    return {
      status: response.status,
      message: response.message,
      errorMessage: undefined,
      data: mapped,
    };
  } catch (error) {
    return buildErrorResult<CommunityArticleDetailDto>(error, "Failed to load article");
  }
}

function parseCommunityCommentsFromResponse(responseData: unknown): CommunityCommentDto[] {
  const root = asRecord(responseData);
  const rootData = asRecord(root?.data);
  let rows: unknown[] = [];
  if (Array.isArray(responseData)) {
    rows = responseData as unknown[];
  } else if (Array.isArray(root?.data)) {
    rows = root.data as unknown[];
  } else if (Array.isArray(rootData?.data)) {
    rows = rootData.data as unknown[];
  } else if (Array.isArray(rootData?.comments)) {
    rows = rootData.comments as unknown[];
  } else if (Array.isArray(rootData?.items)) {
    rows = rootData.items as unknown[];
  } else {
    rows = readArray(root, ["data", "comments", "items"]);
  }

  const hasNestedReplies = rows.some((item) => {
    const record = asRecord(item);
    return record ? readArray(record, ["replies"]).length > 0 : false;
  });

  if (hasNestedReplies) {
    return flattenKnowledgeCommunityCommentNodes(rows);
  }

  return rows
    .map((item) => mapCommentFromRecord(asRecord(item)))
    .filter((c): c is CommunityCommentDto => c !== null);
}

export async function getCommunityArticleComments(
  articleId: string,
): Promise<CommunityArticlesApiResult<CommunityCommentDto[]>> {
  try {
    const response = await httpClient.get<unknown>({
      url: `/api/v1/admin/CommunityArticles/${encodeURIComponent(articleId)}/comments`,
    });

    const comments = parseCommunityCommentsFromResponse(response.data);

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: comments,
    };
  } catch (error) {
    const failed = buildErrorResult<CommunityCommentDto[]>(error, "Failed to load comments");
    return { ...failed, data: failed.data ?? [] };
  }
}

export async function getKnowledgeCommunityArticleComments(
  articleId: string,
): Promise<CommunityArticlesApiResult<CommunityCommentDto[]>> {
  try {
    const response = await httpClient.get<unknown>({
      url: `/api/v1/knowledgeCommunity/articles/${encodeURIComponent(articleId)}/comments`,
      params: {
        pageNumber: 1,
        pageSize: 100,
      },
    });

    if (!isApiSuccess(response)) {
      return {
        status: response.status,
        message: response.message,
        errorMessage: getApiErrorMessage(response, "Failed to load comments"),
        data: [],
      };
    }

    const comments = parseCommunityCommentsFromResponse(response.data);

    return {
      status: response.status,
      message: response.message,
      errorMessage: undefined,
      data: comments,
    };
  } catch (error) {
    const failed = buildErrorResult<CommunityCommentDto[]>(error, "Failed to load comments");
    return { ...failed, data: failed.data ?? [] };
  }
}

export type HideCommunityCommentBody = {
  reason: string;
};

export async function hideCommunityComment(
  commentId: string,
  body: HideCommunityCommentBody,
): Promise<CommunityArticlesApiResult<unknown>> {
  try {
    const response = await httpClient.post<unknown>({
      url: `/api/v1/admin/CommunityComments/${encodeURIComponent(commentId)}/hide`,
      data: body,
    });
    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: response.data ?? true,
    };
  } catch (error) {
    return buildErrorResult<unknown>(error, "Failed to hide comment");
  }
}

export async function deleteCommunityComment(
  commentId: string,
): Promise<CommunityArticlesApiResult<unknown>> {
  try {
    const response = await httpClient.delete<unknown>({
      url: `/api/v1/admin/CommunityComments/${encodeURIComponent(commentId)}`,
    });
    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: response.data ?? true,
    };
  } catch (error) {
    return buildErrorResult<unknown>(error, "Failed to delete comment");
  }
}

export type CreateCommunityArticlePayload = {
  title: string;
  content: string;
  coverImageUrl?: string | null;
  categoryIds: string[];
  primaryCategoryId: string;
  tags?: string[];
};

export async function createCommunityArticle(
  payload: CreateCommunityArticlePayload,
): Promise<CommunityArticlesApiResult<{ articleId: string } | null>> {
  try {
    const primaryCategoryId = payload.primaryCategoryId.trim();
    const categoryIds =
      payload.categoryIds.length > 0
        ? payload.categoryIds.map((id) => id.trim()).filter(Boolean)
        : primaryCategoryId
          ? [primaryCategoryId]
          : [];

    const response = await httpClient.post<unknown>({
      url: "/api/v1/CommunityArticle/create",
      data: {
        title: payload.title.trim(),
        content: payload.content,
        coverImageUrl: payload.coverImageUrl?.trim() ?? "",
        categoryIds,
        primaryCategoryId,
        tags: payload.tags ?? [],
      },
    });

    if (!isApiSuccess(response)) {
      return {
        status: response.status,
        message: response.message,
        errorMessage: getApiErrorMessage(response, "Failed to create article"),
        data: null,
      };
    }

    const root = asRecord(response.data);
    const dataNode = asRecord(root?.data) ?? root;
    const articleId = readString(dataNode, ["articleId", "id"], "");
    return {
      status: response.status,
      message: response.message,
      errorMessage: articleId ? undefined : getApiErrorMessage(response, "Failed to create article"),
      data: articleId ? { articleId } : null,
    };
  } catch (error) {
    return buildErrorResult<{ articleId: string }>(error, "Failed to create article");
  }
}

export type PostCommunityCommentPayload = {
  content: string;
  parentCommentId?: string | null;
};

export async function postKnowledgeCommunityArticleComment(
  articleId: string,
  payload: PostCommunityCommentPayload,
): Promise<CommunityArticlesApiResult<CommunityCommentDto | null>> {
  try {
    const response = await httpClient.post<unknown>({
      url: `/api/v1/knowledgeCommunity/articles/${encodeURIComponent(articleId)}/comments`,
      data: {
        content: payload.content.trim(),
        ...(payload.parentCommentId ? { parentCommentId: payload.parentCommentId } : {}),
      },
    });

    if (!isApiSuccess(response)) {
      return {
        status: response.status,
        message: response.message,
        errorMessage: getApiErrorMessage(response, "Failed to post comment"),
        data: null,
      };
    }

    const root = asRecord(response.data);
    const dataNode = asRecord(root?.data) ?? asRecord(response.data);
    const mapped = mapCommentFromRecord(dataNode);
    return {
      status: response.status,
      message: response.message,
      errorMessage: undefined,
      data: mapped,
    };
  } catch (error) {
    return buildErrorResult<CommunityCommentDto>(error, "Failed to post comment");
  }
}

/** @deprecated Prefer `postKnowledgeCommunityArticleComment` for teacher/community article views. */
export async function postCommunityArticleComment(
  articleId: string,
  payload: PostCommunityCommentPayload,
): Promise<CommunityArticlesApiResult<CommunityCommentDto | null>> {
  return postKnowledgeCommunityArticleComment(articleId, payload);
}

export async function likeCommunityArticle(
  articleId: string,
): Promise<CommunityArticlesApiResult<unknown>> {
  const result = await likeKnowledgeCommunityArticle(articleId);
  return { ...result, data: result.data ?? true };
}

export async function rateCommunityArticle(
  articleId: string,
  rating: number,
): Promise<CommunityArticlesApiResult<unknown>> {
  try {
    const response = await httpClient.post<unknown>({
      url: `/api/v1/admin/CommunityArticles/${encodeURIComponent(articleId)}/rate`,
      data: { rating },
    });
    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: response.data ?? true,
    };
  } catch (error) {
    return buildErrorResult<unknown>(error, "Failed to rate article");
  }
}

export async function followCommunityAuthor(
  userId: string,
): Promise<CommunityArticlesApiResult<unknown>> {
  const result = await followKnowledgeCommunityUser(userId);
  return { ...result, data: result.data ?? true };
}

export async function subscribeCommunityNewsletter(
  email: string,
): Promise<CommunityArticlesApiResult<unknown>> {
  try {
    const response = await httpClient.post<unknown>({
      url: "/api/v1/admin/communitySettings/newsletter/subscribe",
      data: { email: email.trim() },
    });
    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: response.data ?? true,
    };
  } catch (error) {
    return buildErrorResult<unknown>(error, "Failed to subscribe to newsletter");
  }
}

export type CommunityFeedSort = "latest" | "mostActive" | "unanswered";

export function feedSortToApiParams(sort: CommunityFeedSort): {
  sortBy: string;
  sortDesc: boolean;
  status: CommunityArticleStatusCode;
} {
  switch (sort) {
    case "mostActive":
      return { sortBy: "LikesCount", sortDesc: true, status: 3 };
    case "unanswered":
      return { sortBy: "CommentsCount", sortDesc: false, status: 3 };
    case "latest":
    default:
      return { sortBy: "PublishedAt", sortDesc: true, status: 3 };
  }
}
