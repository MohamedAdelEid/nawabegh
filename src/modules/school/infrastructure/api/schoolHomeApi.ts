import { httpClient } from "@/shared/infrastructure/http/httpClient";
import { parseXPaginationHeader } from "@/shared/infrastructure/http/xPagination";
import { resolveFileUrl } from "@/shared/infrastructure/files/fileUrl";
import type {
  SchoolCompetitionCenter,
  SchoolHomeAnnouncement,
  SchoolHomeArticle,
  SchoolHomeArticlesPage,
  SchoolHomeArticleStatus,
  SchoolHomeArticleStatusFilter,
  SchoolHomeData,
  SchoolHomeKpis,
} from "@/modules/school/domain/types/schoolHome.types";

const BASE = "/api/v1/school/home";
type UnknownRecord = Record<string, unknown>;

export interface GetSchoolHomeArticlesParams {
  pageNumber: number;
  pageSize: number;
  status: SchoolHomeArticleStatusFilter;
}

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

function mapKpis(value: unknown): SchoolHomeKpis {
  const record = asRecord(value);
  return {
    registeredStudentsCount: readNumber(record, "registeredStudentsCount"),
    studentsGrowthPercent: readNumber(record, "studentsGrowthPercent"),
    studentsGrowthLabel: readString(record, "studentsGrowthLabel"),
    schoolRank: readNumber(record, "schoolRank"),
    totalSchools: readNumber(record, "totalSchools"),
    performanceBadge: readNullableString(record, "performanceBadge"),
    activeCoursesCount: readNumber(record, "activeCoursesCount"),
    activeCoursesProgressPercent: readNumber(record, "activeCoursesProgressPercent"),
    todayRegistrationsCount: readNumber(record, "todayRegistrationsCount"),
    lastRegistrationAgoText: readString(record, "lastRegistrationAgoText"),
  };
}

function mapCompetition(value: unknown): SchoolCompetitionCenter {
  const record = asRecord(value);
  return {
    competitionPointsPercent: readNumber(record, "competitionPointsPercent"),
    competitionPointsLabel: readString(record, "competitionPointsLabel"),
    competitionRank: readNumber(record, "competitionRank"),
    competitionRankLabel: readString(record, "competitionRankLabel"),
    medalsCount: readNumber(record, "medalsCount"),
    thisSchoolTotalPoints: readNumber(record, "thisSchoolTotalPoints"),
    topSchoolTotalPoints: readNumber(record, "topSchoolTotalPoints"),
  };
}

function mapAnnouncement(value: unknown): SchoolHomeAnnouncement | null {
  const record = asRecord(value);
  if (!record) return null;
  const id = readString(record, "id");
  if (!id) return null;
  return {
    id,
    title: readString(record, "title", "—"),
    type: readString(record, "type"),
    isUrgent: readBoolean(record, "isUrgent"),
    priorityLabel: readString(record, "priorityLabel"),
    date: readString(record, "date"),
    dateLabel: readString(record, "dateLabel"),
  };
}

function normalizeArticleStatus(value: string): SchoolHomeArticleStatus {
  if (
    value === "Draft" ||
    value === "PendingReview" ||
    value === "NeedsEdits" ||
    value === "Hidden"
  ) {
    return value;
  }
  return "Published";
}

function mapArticle(value: unknown): SchoolHomeArticle | null {
  const record = asRecord(value);
  if (!record) return null;
  const articleId = readString(record, "articleId");
  if (!articleId) return null;
  const author = asRecord(record.author);
  return {
    articleId,
    title: readString(record, "title", "—"),
    author: {
      userId: readString(author, "userId"),
      fullName: readString(author, "fullName", "—"),
      avatarUrl: readNullableString(author, "avatarUrl"),
      roleLabel: readString(author, "roleLabel"),
    },
    likesCount: readNumber(record, "likesCount"),
    commentsCount: readNumber(record, "commentsCount"),
    publishedAt: readString(record, "publishedAt"),
    publishedAtLabel: readString(record, "publishedAtLabel"),
    status: normalizeArticleStatus(readString(record, "status")),
    statusLabel: readString(record, "statusLabel"),
    canHide: readBoolean(record, "canHide"),
    canDelete: readBoolean(record, "canDelete"),
  };
}

function mapArticles(value: unknown) {
  return (Array.isArray(value) ? value : [])
    .map(mapArticle)
    .filter((article): article is SchoolHomeArticle => article !== null);
}

export async function getSchoolHome(): Promise<SchoolHomeData> {
  const response = await httpClient.get<unknown>({ url: BASE });
  if (isFailure(response)) {
    throw new Error(response.error?.message ?? "Failed to load school home");
  }
  const record = asRecord(response.data);
  if (!record) throw new Error("Invalid school home response");
  return {
    schoolId: readString(record, "schoolId"),
    schoolName: readString(record, "schoolName"),
    schoolLogoUrl: resolveFileUrl(readNullableString(record, "schoolLogoUrl")),
    hasUnreadNotifications: readBoolean(record, "hasUnreadNotifications"),
    kpis: mapKpis(record.kpis),
    competitionCenter: mapCompetition(record.competitionCenter),
    latestAnnouncements: (Array.isArray(record.latestAnnouncements)
      ? record.latestAnnouncements
      : []
    )
      .map(mapAnnouncement)
      .filter((item): item is SchoolHomeAnnouncement => item !== null),
    latestArticles: mapArticles(record.latestArticles),
    articlesTotalCount: readNumber(record, "articlesTotalCount"),
  };
}

export async function getSchoolHomeArticles(
  params: GetSchoolHomeArticlesParams,
): Promise<SchoolHomeArticlesPage> {
  const response = await httpClient.get<unknown>({
    url: `${BASE}/articles`,
    params: {
      pageNumber: params.pageNumber,
      pageSize: params.pageSize,
      status: params.status === "all" ? undefined : params.status,
    },
  });
  if (isFailure(response)) {
    throw new Error(response.error?.message ?? "Failed to load school articles");
  }
  const items = mapArticles(response.data);
  const pagination = parseXPaginationHeader(response.headers ?? {});
  return {
    items,
    currentPage: pagination?.currentPage ?? params.pageNumber,
    pageSize: pagination?.pageSize ?? params.pageSize,
    totalCount: pagination?.totalCount ?? items.length,
    totalPages: pagination?.totalPages ?? 1,
  };
}

export async function hideSchoolHomeArticle(id: string): Promise<SchoolHomeArticle> {
  const response = await httpClient.post<unknown>({
    url: `${BASE}/articles/${encodeURIComponent(id)}/hide`,
    data: {},
  });
  if (isFailure(response)) {
    throw new Error(response.error?.message ?? "Failed to hide article");
  }
  const article = mapArticle(response.data);
  if (!article) throw new Error("Invalid article response");
  return article;
}

export async function deleteSchoolHomeArticle(id: string): Promise<void> {
  const response = await httpClient.delete<unknown>({
    url: `${BASE}/articles/${encodeURIComponent(id)}`,
  });
  if (isFailure(response)) {
    throw new Error(response.error?.message ?? "Failed to delete article");
  }
}
