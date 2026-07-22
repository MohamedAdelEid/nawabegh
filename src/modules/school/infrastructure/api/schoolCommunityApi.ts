import { httpClient } from "@/shared/infrastructure/http/httpClient";
import { parseXPaginationHeader } from "@/shared/infrastructure/http/xPagination";
import type {
  SchoolArticleStatus,
  SchoolCommunityArticleDetail,
  SchoolCommunityArticleListItem,
  SchoolCommunityArticleWritePayload,
  SchoolCommunityArticlesQuery,
  SchoolCommunityComment,
  SchoolCommunityContentSource,
  SchoolCommunityDashboardData,
  SchoolCommunityDropdownOption,
  SchoolCommunityFeedSort,
  SchoolCommunityHidePayload,
  SchoolCommunityModerationMode,
  SchoolCommunityPagination,
  SchoolCommunityPatchSettingsPayload,
  SchoolCommunityPrivacyMode,
  SchoolCommunityRejectPayload,
  SchoolCommunityRequestEditsPayload,
  SchoolCommunitySettingsResponse,
  SchoolCommunityStats,
} from "@/modules/school/domain/types/schoolCommunity.types";

const BASE = "/api/v1/school/community";
type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as UnknownRecord)
    : null;
}

function readString(record: UnknownRecord | null, key: string, fallback = "") {
  const value = record?.[key];
  if (typeof value === "string") return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return fallback;
}

function readNumber(record: UnknownRecord | null, key: string) {
  const value = record?.[key];
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) {
    return Number(value);
  }
  return 0;
}

function readBoolean(record: UnknownRecord | null, key: string, fallback = false) {
  const value = record?.[key];
  return typeof value === "boolean" ? value : fallback;
}

function readNullableString(record: UnknownRecord | null, key: string) {
  const value = record?.[key];
  return typeof value === "string" && value.trim() ? value : null;
}

function isFailure(response: { status?: string | number; isSuccess?: boolean }) {
  if (response.isSuccess === true) return false;
  return response.status !== "Success";
}

function failMessage(response: unknown, fallback: string) {
  const record = asRecord(response);
  const error = asRecord(record?.error);
  const message =
    (typeof error?.message === "string" && error.message) ||
    (typeof record?.message === "string" && record.message) ||
    null;
  return message || fallback;
}

const STATUS_VALUES: SchoolArticleStatus[] = [
  "Draft",
  "PendingReview",
  "NeedsEdits",
  "Published",
  "Hidden",
  "Removed",
];

function mapStatus(value: unknown): SchoolArticleStatus {
  if (typeof value === "number") {
    return STATUS_VALUES[value] ?? "Draft";
  }
  if (typeof value === "string") {
    const normalized = value.replace(/\s+/g, "");
    const match = STATUS_VALUES.find(
      (item) => item.toLowerCase() === normalized.toLowerCase(),
    );
    if (match) return match;
  }
  return "Draft";
}

function emptyActions() {
  return {
    canEdit: false,
    canSubmit: false,
    canApprove: false,
    canReject: false,
    canRequestEdits: false,
    canHide: false,
    canUnhide: false,
    canDelete: false,
    canHideComment: false,
    canDeleteComment: false,
  };
}

function mapActions(value: unknown) {
  const record = asRecord(value);
  if (!record) return emptyActions();
  return {
    canEdit: readBoolean(record, "canEdit"),
    canSubmit: readBoolean(record, "canSubmit"),
    canApprove: readBoolean(record, "canApprove"),
    canReject: readBoolean(record, "canReject"),
    canRequestEdits: readBoolean(record, "canRequestEdits"),
    canHide: readBoolean(record, "canHide"),
    canUnhide: readBoolean(record, "canUnhide"),
    canDelete: readBoolean(record, "canDelete"),
    canHideComment: readBoolean(record, "canHideComment"),
    canDeleteComment: readBoolean(record, "canDeleteComment"),
  };
}

function mapAuthor(value: unknown) {
  const record = asRecord(value);
  return {
    userId: readString(record, "userId"),
    fullName: readString(record, "fullName", "—"),
    avatarUrl: readNullableString(record, "avatarUrl"),
    specialty: readString(record, "specialty"),
    primaryBadge: readNullableString(record, "primaryBadge"),
    email: readNullableString(record, "email"),
    institution: readNullableString(record, "institution"),
    location: readNullableString(record, "location"),
  };
}

function mapCategory(value: unknown) {
  const record = asRecord(value);
  if (!record) return null;
  const id = readString(record, "id");
  if (!id) return null;
  return {
    id,
    name: readString(record, "name"),
    isPrimary: readBoolean(record, "isPrimary"),
  };
}

function mapTags(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item === "string") return { name: item };
      const record = asRecord(item);
      const name = readString(record, "name");
      return name ? { name } : null;
    })
    .filter((item): item is { name: string } => item !== null);
}

function mapArticleCore(value: unknown) {
  const record = asRecord(value);
  if (!record) return null;
  const articleId = readString(record, "articleId") || readString(record, "id");
  if (!articleId) return null;

  const categories = (Array.isArray(record.categories) ? record.categories : [])
    .map(mapCategory)
    .filter((item): item is NonNullable<ReturnType<typeof mapCategory>> => item !== null);

  const primaryCategory =
    mapCategory(record.primaryCategory) ??
    categories.find((item) => item.isPrimary) ??
    categories[0] ??
    null;

  return {
    articleId,
    title: readString(record, "title"),
    excerpt: readString(record, "excerpt"),
    content: readString(record, "content"),
    coverImageUrl: readNullableString(record, "coverImageUrl"),
    status: mapStatus(record.status),
    isFeatured: readBoolean(record, "isFeatured"),
    primaryCategory,
    categories,
    tags: mapTags(record.tags),
    likesCount: readNumber(record, "likesCount"),
    commentsCount: readNumber(record, "commentsCount"),
    viewsCount: readNumber(record, "viewsCount"),
    createdAt: readString(record, "createdAt"),
    publishedAt: readNullableString(record, "publishedAt"),
    author: mapAuthor(record.author),
    schoolName: readString(record, "schoolName"),
    reportCount: readNumber(record, "reportCount"),
    moderationHistory: (Array.isArray(record.moderationHistory) ? record.moderationHistory : [])
      .map((item) => {
        const entry = asRecord(item);
        if (!entry) return null;
        return {
          action: readString(entry, "action"),
          adminId: readString(entry, "adminId"),
          reason: readNullableString(entry, "reason"),
          metadataJson: readNullableString(entry, "metadataJson"),
          createdAt: readString(entry, "createdAt"),
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null),
  };
}

function mapListItem(value: unknown): SchoolCommunityArticleListItem | null {
  const record = asRecord(value);
  if (!record) return null;
  const article = mapArticleCore(record.article ?? record);
  if (!article) return null;
  return {
    article,
    statusLabel: readString(record, "statusLabel") || article.status,
    isAuthoredBySchool: readBoolean(record, "isAuthoredBySchool"),
    actions: mapActions(record.actions),
  };
}

function mapStats(value: unknown): SchoolCommunityStats {
  const record = asRecord(value);
  return {
    totalArticles: readNumber(record, "totalArticles"),
    pendingReviewCount: readNumber(record, "pendingReviewCount"),
    publishedTodayCount: readNumber(record, "publishedTodayCount"),
    reportedCount: readNumber(record, "reportedCount"),
  };
}

function mapPagination(
  value: unknown,
  fallback: Partial<SchoolCommunityPagination> = {},
): SchoolCommunityPagination {
  const record = asRecord(value);
  return {
    currentPage: readNumber(record, "currentPage") || fallback.currentPage || 1,
    totalPages: readNumber(record, "totalPages") || fallback.totalPages || 1,
    pageSize: readNumber(record, "pageSize") || fallback.pageSize || 10,
    totalCount: readNumber(record, "totalCount") || fallback.totalCount || 0,
    hasPrevious: readBoolean(record, "hasPrevious", fallback.hasPrevious ?? false),
    hasNext: readBoolean(record, "hasNext", fallback.hasNext ?? false),
  };
}

function mapDashboard(value: unknown, headers?: Record<string, string | undefined>): SchoolCommunityDashboardData {
  const record = asRecord(value);
  const articles = (Array.isArray(record?.articles) ? record.articles : Array.isArray(value) ? value : [])
    .map(mapListItem)
    .filter((item): item is SchoolCommunityArticleListItem => item !== null);

  const headerPagination = parseXPaginationHeader(headers ?? {});
  const pagination = mapPagination(record?.pagination, {
    currentPage: headerPagination?.currentPage,
    totalPages: headerPagination?.totalPages,
    pageSize: headerPagination?.pageSize,
    totalCount: headerPagination?.totalCount ?? articles.length,
    hasPrevious: headerPagination?.hasPrevious,
    hasNext: headerPagination?.hasNext,
  });

  return {
    stats: mapStats(record?.stats),
    articles,
    pagination,
  };
}

function mapComment(value: unknown): SchoolCommunityComment | null {
  const record = asRecord(value);
  if (!record) return null;
  const commentId = readString(record, "commentId") || readString(record, "id");
  if (!commentId) return null;
  return {
    commentId,
    content: readString(record, "content"),
    status: readString(record, "status", "Visible"),
    likesCount: readNumber(record, "likesCount"),
    createdAt: readString(record, "createdAt"),
    isReply: readBoolean(record, "isReply"),
    parentCommentId: readNullableString(record, "parentCommentId"),
    author: mapAuthor(record.author),
  };
}

function mapDropdownOption(value: unknown): SchoolCommunityDropdownOption | null {
  const record = asRecord(value);
  if (!record) return null;
  const id = readString(record, "id") || readString(record, "value");
  const name = readString(record, "name") || readString(record, "label");
  if (!id || !name) return null;
  return { id, name };
}

function mapPrivacyMode(value: unknown): SchoolCommunityPrivacyMode {
  if (value === 1 || value === "SchoolPrivate" || value === "School") return "SchoolPrivate";
  return "Public";
}

function mapModerationMode(value: unknown): SchoolCommunityModerationMode {
  if (value === 1 || value === "PostModeration") return "PostModeration";
  return "PreModeration";
}

function mapFeedSort(value: unknown): SchoolCommunityFeedSort {
  if (value === 1 || value === "Trending") return "Trending";
  return "Recent";
}

function mapSettingsResponse(value: unknown): SchoolCommunitySettingsResponse {
  const root = asRecord(value);
  const settingsRecord = asRecord(root?.settings) ?? root;
  return {
    settings: {
      id: readString(settingsRecord, "id"),
      schoolId: readString(settingsRecord, "schoolId"),
      privacyMode: mapPrivacyMode(settingsRecord?.privacyMode),
      moderationMode: mapModerationMode(settingsRecord?.moderationMode),
      enablePublishing: readBoolean(settingsRecord, "enablePublishing", true),
      enableComments: readBoolean(settingsRecord, "enableComments", true),
      enableLikes: readBoolean(settingsRecord, "enableLikes", true),
      enableRatings: readBoolean(settingsRecord, "enableRatings", true),
      enableFollowing: readBoolean(settingsRecord, "enableFollowing", true),
      feedSortDefault: mapFeedSort(settingsRecord?.feedSortDefault),
      updatedAt: readNullableString(settingsRecord, "updatedAt"),
      updatedByAdminId: readNullableString(settingsRecord, "updatedByAdminId"),
    },
    isInheritedFromGlobal: readBoolean(root, "isInheritedFromGlobal"),
  };
}

function buildListParams(params: SchoolCommunityArticlesQuery = {}) {
  return {
    status: params.status && params.status !== "all" ? params.status : undefined,
    contentSource: params.contentSource && params.contentSource !== "All" ? params.contentSource : undefined,
    categoryId: params.categoryId || undefined,
    search: params.search?.trim() || undefined,
    pageNumber: params.pageNumber ?? 1,
    pageSize: params.pageSize ?? 10,
    sortBy: params.sortBy ?? "CreatedAt",
    sortDesc: params.sortDesc ?? true,
  };
}

export async function getSchoolCommunityDashboard(
  params: SchoolCommunityArticlesQuery = {},
): Promise<SchoolCommunityDashboardData> {
  const response = await httpClient.get<unknown>({
    url: `${BASE}/dashboard`,
    params: buildListParams(params),
  });
  if (isFailure(response)) {
    throw new Error(failMessage(response, "Failed to load community dashboard"));
  }
  return mapDashboard(response.data, response.headers);
}

export async function getSchoolCommunityArticles(
  params: SchoolCommunityArticlesQuery = {},
): Promise<SchoolCommunityDashboardData> {
  const response = await httpClient.get<unknown>({
    url: `${BASE}/articles`,
    params: buildListParams(params),
  });
  if (isFailure(response)) {
    throw new Error(failMessage(response, "Failed to load community articles"));
  }
  return mapDashboard(response.data, response.headers);
}

export async function getSchoolCommunityMeta(): Promise<UnknownRecord> {
  const response = await httpClient.get<unknown>({ url: `${BASE}/meta` });
  if (isFailure(response)) {
    throw new Error(failMessage(response, "Failed to load community meta"));
  }
  return asRecord(response.data) ?? {};
}

export type SchoolCommunityCategoriesDropdownParams = {
  keyword?: string;
  pageNumber?: number;
  pageSize?: number;
};

export async function getSchoolCommunityCategoriesDropdown(
  params: SchoolCommunityCategoriesDropdownParams = {},
): Promise<SchoolCommunityDropdownOption[]> {
  const response = await httpClient.get<unknown>({
    url: `${BASE}/categories/dropdown`,
    params: {
      keyword: params.keyword?.trim() || undefined,
      pageNumber: params.pageNumber ?? 1,
      pageSize: params.pageSize ?? 200,
    },
  });
  if (isFailure(response)) {
    throw new Error(failMessage(response, "Failed to load categories"));
  }
  const data = response.data;
  const list = Array.isArray(data)
    ? data
    : Array.isArray(asRecord(data)?.items)
      ? (asRecord(data)?.items as unknown[])
      : Array.isArray(asRecord(data)?.categories)
        ? (asRecord(data)?.categories as unknown[])
        : [];
  return list
    .map(mapDropdownOption)
    .filter((item): item is SchoolCommunityDropdownOption => item !== null);
}

export async function getSchoolCommunityTagSuggestions(
  prefix: string,
  limit = 10,
): Promise<string[]> {
  const response = await httpClient.get<unknown>({
    url: `${BASE}/tags/suggestions`,
    params: { prefix, limit },
  });
  if (isFailure(response)) {
    throw new Error(failMessage(response, "Failed to load tag suggestions"));
  }
  const data = response.data;
  if (Array.isArray(data)) {
    return data
      .map((item) => (typeof item === "string" ? item : readString(asRecord(item), "name")))
      .filter(Boolean);
  }
  return [];
}

export async function createSchoolCommunityDraft(
  payload: SchoolCommunityArticleWritePayload,
): Promise<SchoolCommunityArticleDetail> {
  const response = await httpClient.post<unknown>({
    url: `${BASE}/articles/drafts`,
    data: payload,
  });
  if (isFailure(response)) {
    throw new Error(failMessage(response, "Failed to save draft"));
  }
  const mapped = mapListItem(response.data);
  if (!mapped) throw new Error("Invalid draft response");
  return mapped;
}

export async function createSchoolCommunityArticle(
  payload: SchoolCommunityArticleWritePayload,
): Promise<SchoolCommunityArticleDetail> {
  const response = await httpClient.post<unknown>({
    url: `${BASE}/articles`,
    data: payload,
  });
  if (isFailure(response)) {
    throw new Error(failMessage(response, "Failed to publish article"));
  }
  const mapped = mapListItem(response.data);
  if (!mapped) throw new Error("Invalid article response");
  return mapped;
}

export async function updateSchoolCommunityArticle(
  id: string,
  payload: SchoolCommunityArticleWritePayload,
): Promise<SchoolCommunityArticleDetail> {
  const response = await httpClient.put<unknown>({
    url: `${BASE}/articles/${encodeURIComponent(id)}`,
    data: payload,
  });
  if (isFailure(response)) {
    throw new Error(failMessage(response, "Failed to update article"));
  }
  const mapped = mapListItem(response.data);
  if (!mapped) throw new Error("Invalid article response");
  return mapped;
}

export async function submitSchoolCommunityArticle(id: string): Promise<void> {
  const response = await httpClient.post<unknown>({
    url: `${BASE}/articles/${encodeURIComponent(id)}/submit`,
    data: {},
  });
  if (isFailure(response)) {
    throw new Error(failMessage(response, "Failed to submit article"));
  }
}

export async function getSchoolCommunityArticleById(
  id: string,
): Promise<SchoolCommunityArticleDetail> {
  const response = await httpClient.get<unknown>({
    url: `${BASE}/articles/${encodeURIComponent(id)}`,
  });
  if (isFailure(response)) {
    throw new Error(failMessage(response, "Failed to load article"));
  }
  const mapped = mapListItem(response.data);
  if (!mapped) throw new Error("Invalid article detail response");
  return mapped;
}

export async function getSchoolCommunityArticleComments(
  id: string,
  pageNumber = 1,
  pageSize = 20,
): Promise<{ items: SchoolCommunityComment[]; pagination: SchoolCommunityPagination }> {
  const response = await httpClient.get<unknown>({
    url: `${BASE}/articles/${encodeURIComponent(id)}/comments`,
    params: { pageNumber, pageSize },
  });
  if (isFailure(response)) {
    throw new Error(failMessage(response, "Failed to load comments"));
  }
  const data = response.data;
  const list = Array.isArray(data)
    ? data
    : Array.isArray(asRecord(data)?.items)
      ? (asRecord(data)?.items as unknown[])
      : Array.isArray(asRecord(data)?.comments)
        ? (asRecord(data)?.comments as unknown[])
        : [];
  const headerPagination = parseXPaginationHeader(response.headers ?? {});
  return {
    items: list
      .map(mapComment)
      .filter((item): item is SchoolCommunityComment => item !== null),
    pagination: mapPagination(asRecord(data)?.pagination, {
      currentPage: headerPagination?.currentPage ?? pageNumber,
      totalPages: headerPagination?.totalPages ?? 1,
      pageSize: headerPagination?.pageSize ?? pageSize,
      totalCount: headerPagination?.totalCount ?? list.length,
      hasPrevious: headerPagination?.hasPrevious,
      hasNext: headerPagination?.hasNext,
    }),
  };
}

export async function approveSchoolCommunityArticle(id: string): Promise<void> {
  const response = await httpClient.post<unknown>({
    url: `${BASE}/articles/${encodeURIComponent(id)}/approve`,
    data: {},
  });
  if (isFailure(response)) {
    throw new Error(failMessage(response, "Failed to approve article"));
  }
}

export async function rejectSchoolCommunityArticle(
  id: string,
  payload: SchoolCommunityRejectPayload,
): Promise<void> {
  const response = await httpClient.post<unknown>({
    url: `${BASE}/articles/${encodeURIComponent(id)}/reject`,
    data: payload,
  });
  if (isFailure(response)) {
    throw new Error(failMessage(response, "Failed to reject article"));
  }
}

export async function requestSchoolCommunityArticleEdits(
  id: string,
  payload: SchoolCommunityRequestEditsPayload,
): Promise<void> {
  const response = await httpClient.post<unknown>({
    url: `${BASE}/articles/${encodeURIComponent(id)}/request-edits`,
    data: payload,
  });
  if (isFailure(response)) {
    throw new Error(failMessage(response, "Failed to request edits"));
  }
}

export async function hideSchoolCommunityArticle(
  id: string,
  payload: SchoolCommunityHidePayload = {},
): Promise<void> {
  const response = await httpClient.post<unknown>({
    url: `${BASE}/articles/${encodeURIComponent(id)}/hide`,
    data: payload,
  });
  if (isFailure(response)) {
    throw new Error(failMessage(response, "Failed to hide article"));
  }
}

export async function unhideSchoolCommunityArticle(id: string): Promise<void> {
  const response = await httpClient.post<unknown>({
    url: `${BASE}/articles/${encodeURIComponent(id)}/unhide`,
    data: {},
  });
  if (isFailure(response)) {
    throw new Error(failMessage(response, "Failed to unhide article"));
  }
}

export async function deleteSchoolCommunityArticle(id: string): Promise<void> {
  const response = await httpClient.delete<unknown>({
    url: `${BASE}/articles/${encodeURIComponent(id)}`,
  });
  if (isFailure(response)) {
    throw new Error(failMessage(response, "Failed to delete article"));
  }
}

export async function hideSchoolCommunityComment(
  articleId: string,
  commentId: string,
): Promise<void> {
  const response = await httpClient.post<unknown>({
    url: `${BASE}/articles/${encodeURIComponent(articleId)}/comments/${encodeURIComponent(commentId)}/hide`,
    data: {},
  });
  if (isFailure(response)) {
    throw new Error(failMessage(response, "Failed to hide comment"));
  }
}

export async function deleteSchoolCommunityComment(
  articleId: string,
  commentId: string,
): Promise<void> {
  const response = await httpClient.delete<unknown>({
    url: `${BASE}/articles/${encodeURIComponent(articleId)}/comments/${encodeURIComponent(commentId)}`,
  });
  if (isFailure(response)) {
    throw new Error(failMessage(response, "Failed to delete comment"));
  }
}

export async function getSchoolCommunitySettings(): Promise<SchoolCommunitySettingsResponse> {
  const response = await httpClient.get<unknown>({ url: `${BASE}/settings` });
  if (isFailure(response)) {
    throw new Error(failMessage(response, "Failed to load community settings"));
  }
  return mapSettingsResponse(response.data);
}

export async function patchSchoolCommunitySettings(
  payload: SchoolCommunityPatchSettingsPayload,
): Promise<SchoolCommunitySettingsResponse> {
  const response = await httpClient.patch<unknown>({
    url: `${BASE}/settings`,
    data: payload,
  });
  if (isFailure(response)) {
    throw new Error(failMessage(response, "Failed to update community settings"));
  }
  return mapSettingsResponse(response.data);
}

export type { SchoolCommunityContentSource };
