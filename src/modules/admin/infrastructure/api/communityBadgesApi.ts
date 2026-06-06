import type { BackendApiResponse, BackendStatus } from "@/shared/domain/types/api.types";
import { httpClient } from "@/shared/infrastructure/http/httpClient";
import {
  parseXPaginationHeader,
  type XPaginationMeta,
} from "@/shared/infrastructure/http/xPagination";
import { normalizeBadgeColor } from "@/modules/admin/domain/utils/communityBadgeMappers";
import type {
  CommunityBadgePayload,
  CommunityBadgeRow,
  CommunityBadgeTablePage,
} from "@/modules/admin/domain/types/communityBadges.types";

const BASE = "/api/v1/admin/CommunityBadges";

export type CommunityBadgesApiResult<T> = {
  status: BackendStatus | string;
  message?: string;
  errorMessage?: string;
  validationErrors?: Record<string, string[]> | null;
  data: T | null;
};

export type GetCommunityBadgesParams = {
  pageNumber: number;
  pageSize: number;
  keyword?: string;
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

function buildErrorResult<T>(error: unknown, fallbackMessage: string): CommunityBadgesApiResult<T> {
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

function mapBadgeRow(item: unknown): CommunityBadgeRow | null {
  const record = asRecord(item);
  if (!record) return null;
  const id = readString(record, ["id"]);
  if (!id) return null;

  const colorRaw = readString(record, ["color"], "#C7AF6E");
  const iconUrlRaw = readString(record, ["iconUrl"], "");

  return {
    id,
    name: readString(record, ["name"], "—"),
    description: readString(record, ["description"], ""),
    color: normalizeBadgeColor(colorRaw),
    level: readNumber(record, ["level"]) ?? 1,
    activityType: readNumber(record, ["activityType"]) ?? 1,
    minCount: readNumber(record, ["minCount"]) ?? 0,
    iconUrl: iconUrlRaw.trim() ? iconUrlRaw : null,
    enabled: readBoolean(record, ["enabled"], true),
    earnerCount: readNumber(record, ["earnerCount"]) ?? 0,
  };
}

function extractPageMeta(
  data: unknown,
  params: GetCommunityBadgesParams,
  rowCount: number,
  headerMeta: XPaginationMeta | null,
): Omit<CommunityBadgeTablePage, "rows"> {
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

export async function getCommunityBadgesPage(
  params: GetCommunityBadgesParams,
): Promise<CommunityBadgesApiResult<CommunityBadgeTablePage>> {
  try {
    const response = await httpClient.get<unknown>({
      url: `${BASE}/page`,
      params: {
        pageNumber: params.pageNumber,
        pageSize: params.pageSize,
        ...(params.keyword?.trim() ? { keyword: params.keyword.trim() } : {}),
      },
    });

    const headerMeta = parseXPaginationHeader(response.headers ?? {});
    const rows = extractListRows(response.data)
      .map(mapBadgeRow)
      .filter((row): row is CommunityBadgeRow => row !== null);
    const meta = extractPageMeta(response.data, params, rows.length, headerMeta);

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      validationErrors: response.error?.validationErrors ?? null,
      data: { rows, ...meta },
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to load community badges");
  }
}

export async function getCommunityBadge(
  id: string,
): Promise<CommunityBadgesApiResult<CommunityBadgeRow>> {
  try {
    const response = await httpClient.get<unknown>({
      url: `${BASE}/${encodeURIComponent(id)}`,
    });

    const envelope = asRecord(response.data);
    const nested = envelope ? asRecord(envelope.data) : null;
    const badge = mapBadgeRow(nested ?? envelope);

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      validationErrors: response.error?.validationErrors ?? null,
      data: badge,
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to load community badge");
  }
}

export async function createCommunityBadge(
  payload: CommunityBadgePayload,
): Promise<CommunityBadgesApiResult<CommunityBadgeRow>> {
  try {
    const response = await httpClient.post<unknown>({
      url: `${BASE}/create`,
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
    return buildErrorResult(error, "Failed to create community badge");
  }
}

export async function updateCommunityBadge(
  id: string,
  payload: CommunityBadgePayload,
): Promise<CommunityBadgesApiResult<CommunityBadgeRow>> {
  try {
    const response = await httpClient.put<unknown>({
      url: `${BASE}/${encodeURIComponent(id)}/update`,
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
    return buildErrorResult(error, "Failed to update community badge");
  }
}

export async function deleteCommunityBadge(
  id: string,
): Promise<CommunityBadgesApiResult<null>> {
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
    return buildErrorResult(error, "Failed to delete community badge");
  }
}

export async function toggleCommunityBadge(
  id: string,
): Promise<CommunityBadgesApiResult<CommunityBadgeRow>> {
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
    return buildErrorResult(error, "Failed to toggle community badge");
  }
}
