import type { BackendApiResponse, BackendStatus } from "@/shared/domain/types/api.types";
import { getApiErrorMessage, isApiSuccess } from "@/shared/infrastructure/api/apiResponse.utils";
import { httpClient } from "@/shared/infrastructure/http/httpClient";

export type KnowledgeCommunityApiResult<T> = {
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

function readArray(record: UnknownRecord | null, keys: string[]): unknown[] {
  if (!record) return [];
  for (const key of keys) {
    const value = record[key];
    if (Array.isArray(value)) return value;
  }
  return [];
}

function extractDataNode(data: unknown): UnknownRecord | null {
  const root = asRecord(data);
  return asRecord(root?.data) ?? root;
}

function extractDataArray(data: unknown): unknown[] {
  const root = asRecord(data);
  if (Array.isArray(data)) return data;
  if (Array.isArray(root?.data)) return root.data as unknown[];
  const dataNode = asRecord(root?.data);
  if (Array.isArray(dataNode?.data)) return dataNode.data as unknown[];
  if (Array.isArray(dataNode?.items)) return dataNode.items as unknown[];
  return readArray(root, ["data", "items"]);
}

function buildErrorResult<T>(error: unknown, fallbackMessage: string): KnowledgeCommunityApiResult<T> {
  const axiosError = asRecord(error);
  const response = asRecord(axiosError?.response);
  const responseData = asRecord(response?.data);
  const dataEnvelope = responseData as BackendApiResponse<unknown> | null;

  const detailMessage =
    readString(responseData, ["detail", "title"], "") ||
    dataEnvelope?.error?.message ||
    (typeof axiosError?.message === "string" ? axiosError.message : fallbackMessage);

  return {
    status: (typeof dataEnvelope?.status === "string" ? dataEnvelope.status : undefined) ?? "Error",
    message: typeof dataEnvelope?.message === "string" ? dataEnvelope.message : undefined,
    errorMessage: detailMessage,
    data: null,
  };
}

async function postKnowledgeCommunityAction(
  url: string,
  fallbackMessage: string,
): Promise<KnowledgeCommunityApiResult<true>> {
  try {
    const response = await httpClient.post<unknown>({ url });
    if (!isApiSuccess(response)) {
      return {
        status: response.status,
        message: response.message,
        errorMessage: getApiErrorMessage(response, fallbackMessage),
        data: null,
      };
    }
    return {
      status: response.status,
      message: response.message,
      errorMessage: undefined,
      data: true,
    };
  } catch (error) {
    return buildErrorResult<true>(error, fallbackMessage);
  }
}

export type KnowledgeCommunityAuthorBadgeDto = {
  name: string;
  level: number;
};

export type KnowledgeCommunityAuthorSkillDto = {
  name: string;
  displayOrder: number;
};

export type KnowledgeCommunityAchievementBadgeDto = {
  badgeId: string;
  name: string;
  description: string;
  iconUrl: string | null;
  requiredPoints: number;
  earnedAt: string;
};

export type KnowledgeCommunityAuthorProfileDto = {
  userId: string;
  fullName: string;
  avatarUrl: string | null;
  bannerImageUrl: string | null;
  specialty: string;
  bio: string;
  institution: string;
  location: string;
  joinedAt: string;
  totalLikesReceived: number;
  totalPosts: number;
  followingCount: number;
  followersCount: number;
  isFollowedByViewer: boolean;
  badges: KnowledgeCommunityAuthorBadgeDto[];
  skills: KnowledgeCommunityAuthorSkillDto[];
  isStudent: boolean;
  currentPoints: number;
  maxPointsEverReached: number;
  achievementBadgeCount: number;
  earnedAchievementBadges: KnowledgeCommunityAchievementBadgeDto[];
};

export type KnowledgeCommunityAuthorArticleDto = {
  articleId: string;
  title: string;
  excerpt: string;
  coverImageUrl: string | null;
  isFeatured: boolean;
  primaryCategory: { id: string; name: string } | null;
  tags: Array<{ name: string }>;
  publishedAt: string;
  likesCount: number;
  commentsCount: number;
  isLikedByCurrentUser: boolean;
  isBookmarkedByCurrentUser: boolean;
};

function mapAuthorProfile(record: UnknownRecord | null): KnowledgeCommunityAuthorProfileDto | null {
  if (!record) return null;
  const userId = readString(record, ["userId", "id"], "");
  if (!userId) return null;

  const badgesRaw = readArray(record, ["badges"]);
  const skillsRaw = readArray(record, ["skills"]);
  const earnedBadgesRaw = readArray(record, ["earnedAchievementBadges"]);

  const avatar = readString(record, ["avatarUrl"], "");
  const banner = readString(record, ["bannerImageUrl"], "");

  return {
    userId,
    fullName: readString(record, ["fullName", "name"], "—"),
    avatarUrl: avatar.trim() !== "" ? avatar : null,
    bannerImageUrl: banner.trim() !== "" ? banner : null,
    specialty: readString(record, ["specialty"], ""),
    bio: readString(record, ["bio"], ""),
    institution: readString(record, ["institution"], ""),
    location: readString(record, ["location"], ""),
    joinedAt: readString(record, ["joinedAt"], ""),
    totalLikesReceived: readNumber(record, ["totalLikesReceived"]) ?? 0,
    totalPosts: readNumber(record, ["totalPosts"]) ?? 0,
    followingCount: readNumber(record, ["followingCount"]) ?? 0,
    followersCount: readNumber(record, ["followersCount"]) ?? 0,
    isFollowedByViewer: readBoolean(record, ["isFollowedByViewer"], false),
    badges: badgesRaw
      .map((item) => {
        const row = asRecord(item);
        if (!row) return null;
        const name = readString(row, ["name"], "");
        if (!name) return null;
        return { name, level: readNumber(row, ["level"]) ?? 0 };
      })
      .filter((item): item is KnowledgeCommunityAuthorBadgeDto => item !== null),
    skills: skillsRaw
      .map((item) => {
        const row = asRecord(item);
        if (!row) return null;
        const name = readString(row, ["name"], "");
        if (!name) return null;
        return {
          name,
          displayOrder: readNumber(row, ["displayOrder"]) ?? 0,
        };
      })
      .filter((item): item is KnowledgeCommunityAuthorSkillDto => item !== null),
    isStudent: readBoolean(record, ["isStudent"], false),
    currentPoints: readNumber(record, ["currentPoints"]) ?? 0,
    maxPointsEverReached: readNumber(record, ["maxPointsEverReached"]) ?? 0,
    achievementBadgeCount: readNumber(record, ["achievementBadgeCount"]) ?? 0,
    earnedAchievementBadges: earnedBadgesRaw
      .map((item) => {
        const row = asRecord(item);
        if (!row) return null;
        const badgeId = readString(row, ["badgeId", "id"], "");
        const name = readString(row, ["name"], "");
        if (!badgeId || !name) return null;
        const icon = readString(row, ["iconUrl"], "");
        return {
          badgeId,
          name,
          description: readString(row, ["description"], ""),
          iconUrl: icon.trim() !== "" ? icon : null,
          requiredPoints: readNumber(row, ["requiredPoints"]) ?? 0,
          earnedAt: readString(row, ["earnedAt"], ""),
        };
      })
      .filter((item): item is KnowledgeCommunityAchievementBadgeDto => item !== null),
  };
}

function mapAuthorArticle(record: UnknownRecord | null): KnowledgeCommunityAuthorArticleDto | null {
  if (!record) return null;
  const articleId = readString(record, ["articleId", "id"], "");
  if (!articleId) return null;

  const categoryRecord = asRecord(record.primaryCategory);
  const cover = readString(record, ["coverImageUrl"], "");
  const tagsRaw = readArray(record, ["tags"]);

  return {
    articleId,
    title: readString(record, ["title"], "—"),
    excerpt: readString(record, ["excerpt"], ""),
    coverImageUrl: cover.trim() !== "" ? cover : null,
    isFeatured: readBoolean(record, ["isFeatured"], false),
    primaryCategory: categoryRecord
      ? {
          id: readString(categoryRecord, ["id"], ""),
          name: readString(categoryRecord, ["name"], "—"),
        }
      : null,
    tags: tagsRaw
      .map((item) => {
        if (typeof item === "string") return { name: item };
        const row = asRecord(item);
        const name = readString(row, ["name"], "");
        return name ? { name } : null;
      })
      .filter((item): item is { name: string } => item !== null),
    publishedAt: readString(record, ["publishedAt"], ""),
    likesCount: readNumber(record, ["likesCount"]) ?? 0,
    commentsCount: readNumber(record, ["commentsCount"]) ?? 0,
    isLikedByCurrentUser: readBoolean(record, ["isLikedByCurrentUser"], false),
    isBookmarkedByCurrentUser: readBoolean(record, ["isBookmarkedByCurrentUser"], false),
  };
}

export async function likeKnowledgeCommunityArticle(
  articleId: string,
): Promise<KnowledgeCommunityApiResult<true>> {
  return postKnowledgeCommunityAction(
    `/api/v1/knowledgeCommunity/articles/${encodeURIComponent(articleId)}/like`,
    "Failed to like article",
  );
}

export async function unlikeKnowledgeCommunityArticle(
  articleId: string,
): Promise<KnowledgeCommunityApiResult<true>> {
  return postKnowledgeCommunityAction(
    `/api/v1/knowledgeCommunity/articles/${encodeURIComponent(articleId)}/unlike`,
    "Failed to unlike article",
  );
}

export async function bookmarkKnowledgeCommunityArticle(
  articleId: string,
): Promise<KnowledgeCommunityApiResult<true>> {
  return postKnowledgeCommunityAction(
    `/api/v1/knowledgeCommunity/articles/${encodeURIComponent(articleId)}/bookmark`,
    "Failed to bookmark article",
  );
}

export async function removeKnowledgeCommunityArticleBookmark(
  articleId: string,
): Promise<KnowledgeCommunityApiResult<true>> {
  return postKnowledgeCommunityAction(
    `/api/v1/knowledgeCommunity/articles/${encodeURIComponent(articleId)}/bookmark/remove`,
    "Failed to remove bookmark",
  );
}

export async function likeKnowledgeCommunityComment(
  commentId: string,
): Promise<KnowledgeCommunityApiResult<true>> {
  return postKnowledgeCommunityAction(
    `/api/v1/knowledgeCommunity/comments/${encodeURIComponent(commentId)}/like`,
    "Failed to like comment",
  );
}

export async function unlikeKnowledgeCommunityComment(
  commentId: string,
): Promise<KnowledgeCommunityApiResult<true>> {
  return postKnowledgeCommunityAction(
    `/api/v1/knowledgeCommunity/comments/${encodeURIComponent(commentId)}/unlike`,
    "Failed to unlike comment",
  );
}

export async function followKnowledgeCommunityUser(
  userId: string,
): Promise<KnowledgeCommunityApiResult<true>> {
  return postKnowledgeCommunityAction(
    `/api/v1/knowledgeCommunity/users/${encodeURIComponent(userId)}/follow`,
    "Failed to follow user",
  );
}

export async function unfollowKnowledgeCommunityUser(
  userId: string,
): Promise<KnowledgeCommunityApiResult<true>> {
  return postKnowledgeCommunityAction(
    `/api/v1/knowledgeCommunity/users/${encodeURIComponent(userId)}/unfollow`,
    "Failed to unfollow user",
  );
}

export async function getKnowledgeCommunityAuthorProfile(
  userId: string,
): Promise<KnowledgeCommunityApiResult<KnowledgeCommunityAuthorProfileDto>> {
  try {
    const response = await httpClient.get<unknown>({
      url: `/api/v1/knowledgeCommunity/authors/${encodeURIComponent(userId)}`,
    });
    const mapped = mapAuthorProfile(extractDataNode(response.data));
    if (!mapped) {
      return {
        status: response.status,
        message: response.message,
        errorMessage: response.error?.message ?? "Author not found",
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
    return buildErrorResult<KnowledgeCommunityAuthorProfileDto>(error, "Failed to load author profile");
  }
}

export async function getKnowledgeCommunityAuthorArticles(
  userId: string,
): Promise<KnowledgeCommunityApiResult<KnowledgeCommunityAuthorArticleDto[]>> {
  try {
    const response = await httpClient.get<unknown>({
      url: `/api/v1/knowledgeCommunity/authors/${encodeURIComponent(userId)}/articles`,
    });
    const articles = extractDataArray(response.data)
      .map((item) => mapAuthorArticle(asRecord(item)))
      .filter((item): item is KnowledgeCommunityAuthorArticleDto => item !== null);

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: articles,
    };
  } catch (error) {
    const failed = buildErrorResult<KnowledgeCommunityAuthorArticleDto[]>(error, "Failed to load author articles");
    return { ...failed, data: failed.data ?? [] };
  }
}
