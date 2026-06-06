import type { BackendApiResponse, BackendStatus } from "@/shared/domain/types/api.types";
import { httpClient } from "@/shared/infrastructure/http/httpClient";
import {
  parseXPaginationHeader,
  type XPaginationMeta,
} from "@/shared/infrastructure/http/xPagination";
import type {
  AchievementBadgeAnalytics,
  AchievementBadgeAnalyticsByBadge,
  AchievementBadgePayload,
  AchievementBadgeRow,
  AchievementBadgeTablePage,
} from "@/modules/admin/domain/types/achievementBadges.types";

const BASE = "/api/v1/admin/achievement-badges";

export type AchievementBadgesApiResult<T> = {
  status: BackendStatus | string;
  message?: string;
  errorMessage?: string;
  validationErrors?: Record<string, string[]> | null;
  data: T | null;
};

export type GetAchievementBadgesParams = {
  includeInactive?: boolean;
  pageNumber: number;
  pageSize: number;
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
  }
  return fallback;
}

function extractListRows(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  const record = asRecord(data);
  if (!record) return [];
  if (Array.isArray(record.data)) return record.data as unknown[];
  for (const key of ["items", "results", "records", "list", "rows"]) {
    const value = record[key];
    if (Array.isArray(value)) return value;
  }
  return [];
}

function mapHttpStatus(statusCode: number | null): BackendStatus | "Error" {
  switch (statusCode) {
    case 400:
      return "BadRequest";
    case 401:
      return "Unauthorized";
    case 403:
      return "Forbidden";
    case 404:
      return "NotFound";
    case 409:
      return "Conflict";
    default:
      return "Error";
  }
}

function buildErrorResult<T>(error: unknown, fallbackMessage: string): AchievementBadgesApiResult<T> {
  const axiosError = asRecord(error);
  const response = asRecord(axiosError?.response);
  const responseData = asRecord(response?.data) as BackendApiResponse<unknown> | null;
  const httpStatusCode = readNumber(response, ["status"]);

  return {
    status:
      (typeof responseData?.status === "string" ? responseData.status : undefined) ??
      mapHttpStatus(httpStatusCode),
    message: typeof responseData?.message === "string" ? responseData.message : undefined,
    errorMessage:
      responseData?.error?.message ??
      (typeof axiosError?.message === "string" ? axiosError.message : fallbackMessage),
    validationErrors: responseData?.error?.validationErrors ?? null,
    data: null,
  };
}

function mapBadgeRow(item: unknown): AchievementBadgeRow | null {
  const record = asRecord(item);
  if (!record) return null;
  const id = readString(record, ["id"]);
  if (!id) return null;

  return {
    id,
    name: readString(record, ["name"], "—"),
    description: readString(record, ["description"], ""),
    iconUrl: readString(record, ["iconUrl"], ""),
    requiredPoints: readNumber(record, ["requiredPoints"]) ?? 0,
    isActive: readBoolean(record, ["isActive"], true),
    earnedCount: readNumber(record, ["earnedCount"]) ?? 0,
    createdAt: readString(record, ["createdAt"], ""),
  };
}

function mapAnalyticsByBadge(item: unknown): AchievementBadgeAnalyticsByBadge | null {
  const record = asRecord(item);
  if (!record) return null;
  const badgeId = readString(record, ["badgeId", "id"]);
  if (!badgeId) return null;

  return {
    badgeId,
    name: readString(record, ["name"], "—"),
    iconUrl: readString(record, ["iconUrl"], ""),
    requiredPoints: readNumber(record, ["requiredPoints"]) ?? 0,
    earnedCount: readNumber(record, ["earnedCount"]) ?? 0,
    lastAwardedAt: readString(record, ["lastAwardedAt"], "") || null,
  };
}

function mapAnalytics(data: unknown): AchievementBadgeAnalytics | null {
  const record = asRecord(data);
  if (!record) return null;

  const nested = asRecord(record.data) ?? record;
  const byBadgeRaw = nested.byBadge;
  const byBadge = (Array.isArray(byBadgeRaw) ? byBadgeRaw : [])
    .map(mapAnalyticsByBadge)
    .filter((row): row is AchievementBadgeAnalyticsByBadge => row !== null);

  return {
    totalBadgesActive: readNumber(nested, ["totalBadgesActive"]) ?? 0,
    totalBadgesAwarded: readNumber(nested, ["totalBadgesAwarded"]) ?? 0,
    byBadge,
  };
}

function extractPageMeta(
  data: unknown,
  params: GetAchievementBadgesParams,
  rowCount: number,
  headerMeta: XPaginationMeta | null,
): Omit<AchievementBadgeTablePage, "rows"> {
  if (headerMeta) {
    return {
      currentPage: headerMeta.currentPage,
      pageSize: headerMeta.pageSize,
      totalItems: headerMeta.totalCount,
      totalPages: headerMeta.totalPages,
    };
  }

  const record = asRecord(data);
  const nested = asRecord(record?.data) ?? record;
  const totalItems =
    readNumber(nested, ["totalCount", "total", "count", "totalItems"]) ?? rowCount;
  const currentPage =
    readNumber(nested, ["pageNumber", "page", "currentPage"]) ?? params.pageNumber;
  const pageSize = readNumber(nested, ["pageSize", "limit", "size"]) ?? params.pageSize;
  const totalPages =
    readNumber(nested, ["totalPages", "pagesCount"]) ??
    Math.max(1, Math.ceil(totalItems / Math.max(pageSize, 1)));

  return { currentPage, pageSize, totalItems, totalPages };
}

function buildListQueryParams(params: GetAchievementBadgesParams): Record<string, string | number | boolean> {
  return {
    includeInactive: params.includeInactive ?? false,
    pageNumber: params.pageNumber,
    pageSize: params.pageSize,
  };
}

export async function getAchievementBadges(
  params: GetAchievementBadgesParams,
): Promise<AchievementBadgesApiResult<AchievementBadgeTablePage>> {
  try {
    const response = await httpClient.get<unknown>({
      url: BASE,
      params: buildListQueryParams(params),
    });

    const headerMeta = parseXPaginationHeader(response.headers ?? {});
    const rows = extractListRows(response.data)
      .map(mapBadgeRow)
      .filter((row): row is AchievementBadgeRow => row !== null);
    const meta = extractPageMeta(response.data, params, rows.length, headerMeta);

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      validationErrors: response.error?.validationErrors ?? null,
      data: { rows, ...meta },
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to load achievement badges");
  }
}

export async function getAchievementBadgeAnalytics(): Promise<
  AchievementBadgesApiResult<AchievementBadgeAnalytics>
> {
  try {
    const response = await httpClient.get<unknown>({
      url: `${BASE}/analytics`,
    });

    const analytics = mapAnalytics(response.data);

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      validationErrors: response.error?.validationErrors ?? null,
      data: analytics,
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to load badge analytics");
  }
}

export async function createAchievementBadge(
  payload: AchievementBadgePayload,
): Promise<AchievementBadgesApiResult<AchievementBadgeRow>> {
  try {
    const response = await httpClient.post<unknown>({
      url: BASE,
      data: payload,
    });

    const envelope = asRecord(response.data);
    const nested = envelope ? asRecord(envelope.data) : null;
    const created = mapBadgeRow(nested ?? envelope);

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      validationErrors: response.error?.validationErrors ?? null,
      data: created,
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to create achievement badge");
  }
}

export async function updateAchievementBadge(
  id: string,
  payload: AchievementBadgePayload,
): Promise<AchievementBadgesApiResult<AchievementBadgeRow>> {
  try {
    const response = await httpClient.put<unknown>({
      url: `${BASE}/${encodeURIComponent(id)}`,
      data: payload,
    });

    const envelope = asRecord(response.data);
    const nested = envelope ? asRecord(envelope.data) : null;
    const updated = mapBadgeRow(nested ?? envelope);

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      validationErrors: response.error?.validationErrors ?? null,
      data: updated,
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to update achievement badge");
  }
}

export async function deleteAchievementBadge(
  id: string,
): Promise<AchievementBadgesApiResult<null>> {
  try {
    const response = await httpClient.delete<unknown>({
      url: `${BASE}/${encodeURIComponent(id)}`,
    });

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      validationErrors: response.error?.validationErrors ?? null,
      data: null,
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to delete achievement badge");
  }
}

export async function toggleAchievementBadge(
  id: string,
): Promise<AchievementBadgesApiResult<AchievementBadgeRow>> {
  try {
    const response = await httpClient.patch<unknown>({
      url: `${BASE}/${encodeURIComponent(id)}/toggle`,
    });

    const envelope = asRecord(response.data);
    const nested = envelope ? asRecord(envelope.data) : null;
    const updated = mapBadgeRow(nested ?? envelope);

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      validationErrors: response.error?.validationErrors ?? null,
      data: updated,
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to toggle achievement badge");
  }
}

export async function recalculateAchievementBadges(): Promise<AchievementBadgesApiResult<null>> {
  try {
    const response = await httpClient.post<unknown>({
      url: `${BASE}/recalculate`,
    });

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      validationErrors: response.error?.validationErrors ?? null,
      data: null,
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to recalculate achievement badges");
  }
}
