import type { BackendApiResponse, BackendStatus } from "@/shared/domain/types/api.types";
import { httpClient } from "@/shared/infrastructure/http/httpClient";
import { resolveFileUrl } from "@/shared/infrastructure/files/fileUrl";
import type { CommunityFeedSort } from "@/modules/admin/infrastructure/api/communityArticlesApi";
import type { CommunityFeedPost } from "@/modules/teacher/domain/types/knowledgeCommunity.types";

/**
 * Student-facing Knowledge Community feed.
 *
 * Unlike the teacher dashboard (which reads the admin moderation list), students
 * read the public feed documented in STUDENT_KNOWLEDGE_COMMUNITY_API.md:
 *   GET /api/v1/knowledgeCommunity/feed -> CommunityArticleCardDto[]
 * Pagination metadata is returned in the `X-Pagination` response header.
 */

export type StudentCommunityFeedResult<T> = {
  status: BackendStatus | string;
  message?: string;
  errorMessage?: string;
  data: T | null;
};

export type StudentCommunityFeedData = {
  posts: CommunityFeedPost[];
  totalItems: number;
  totalPages: number;
  page: number;
  pageSize: number;
};

export type StudentCommunityFeedParams = {
  sort?: CommunityFeedSort;
  search?: string;
  categoryId?: string;
  page?: number;
  pageSize?: number;
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

function extractDataArray(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  const root = asRecord(data);
  if (Array.isArray(root?.data)) return root.data as unknown[];
  const dataNode = asRecord(root?.data);
  if (Array.isArray(dataNode?.data)) return dataNode.data as unknown[];
  if (Array.isArray(dataNode?.items)) return dataNode.items as unknown[];
  return [];
}

function buildErrorResult<T>(error: unknown, fallbackMessage: string): StudentCommunityFeedResult<T> {
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

/** Maps the shared feed sort tabs to the documented `CommunityFeedSort` enum names. */
function feedSortToApiValue(sort: CommunityFeedSort | undefined): "Recent" | "Trending" {
  return sort === "mostActive" ? "Trending" : "Recent";
}

function estimateReadMinutes(excerpt: string): number {
  const words = excerpt.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/** Maps a `CommunityArticleCardDto` (feed/search/author articles) to the shared feed post shape. */
export function mapCommunityCardToFeedPost(item: unknown): CommunityFeedPost | null {
  const record = asRecord(item);
  if (!record) return null;

  const id = readString(record, ["articleId", "id"], "");
  if (!id) return null;

  const authorRecord = asRecord(record.author);
  const categoryRecord = asRecord(record.primaryCategory);
  const excerpt = readString(record, ["excerpt"], "");
  const cover = readString(record, ["coverImageUrl"], "");
  const authorAvatar = readString(authorRecord, ["avatarUrl", "profileImageUrl", "imageUrl"], "");

  return {
    id,
    title: readString(record, ["title"], "—"),
    category: readString(categoryRecord, ["name", "title"], "—"),
    readTimeMinutes: estimateReadMinutes(excerpt),
    authorName: readString(authorRecord, ["fullName", "name"], "—"),
    authorAvatarImageUrl: authorAvatar.trim() !== "" ? authorAvatar : null,
    authorUserId: readString(authorRecord, ["userId", "id"], "") || undefined,
    authorRole: readString(authorRecord, ["specialty", "jobTitle", "role"], "—"),
    schoolName: readString(authorRecord, ["institution", "schoolName"], "") || "—",
    likesCount: readNumber(record, ["likesCount"]) ?? 0,
    commentsCount: readNumber(record, ["commentsCount"]) ?? 0,
    viewsCount: readNumber(record, ["viewsCount"]) ?? 0,
    publishedAt: readString(record, ["publishedAt", "createdAt"], ""),
    statusId: "published",
    isHidden: false,
    excerpt,
    coverImageUrl: cover.trim() !== "" ? resolveFileUrl(cover) : null,
    isLikedByCurrentUser: readBoolean(record, ["isLikedByCurrentUser"], false),
    isBookmarkedByCurrentUser: readBoolean(record, ["isBookmarkedByCurrentUser"], false),
  };
}

function parsePagination(
  headers: Record<string, string | undefined>,
  fallbackPage: number,
  fallbackPageSize: number,
  itemsLength: number,
): { totalItems: number; totalPages: number; page: number; pageSize: number } {
  const raw = headers["x-pagination"];
  if (raw) {
    try {
      const meta = JSON.parse(raw) as Record<string, unknown>;
      const totalItems = readNumber(meta, ["totalCount", "totalItems"]) ?? itemsLength;
      const pageSize = readNumber(meta, ["pageSize"]) ?? fallbackPageSize;
      const totalPages =
        readNumber(meta, ["totalPages"]) ?? Math.max(1, Math.ceil(totalItems / Math.max(1, pageSize)));
      const page = readNumber(meta, ["currentPage", "pageNumber"]) ?? fallbackPage;
      return { totalItems, totalPages, page, pageSize };
    } catch {
      // fall through to defaults
    }
  }
  return {
    totalItems: itemsLength,
    totalPages: 1,
    page: fallbackPage,
    pageSize: fallbackPageSize,
  };
}

export async function getStudentCommunityFeed(
  params: StudentCommunityFeedParams = {},
): Promise<StudentCommunityFeedResult<StudentCommunityFeedData>> {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 10;

  try {
    const response = await httpClient.get<unknown>({
      url: "/api/v1/knowledgeCommunity/feed",
      params: {
        sort: feedSortToApiValue(params.sort),
        ...(params.search?.trim() ? { search: params.search.trim() } : {}),
        ...(params.categoryId ? { categoryId: params.categoryId } : {}),
        pageNumber: page,
        pageSize,
      },
    });

    const posts = extractDataArray(response.data)
      .map((item) => mapCommunityCardToFeedPost(item))
      .filter((item): item is CommunityFeedPost => item !== null);

    const pagination = parsePagination(response.headers, page, pageSize, posts.length);

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: { posts, ...pagination },
    };
  } catch (error) {
    return buildErrorResult<StudentCommunityFeedData>(error, "Failed to load community feed");
  }
}
