import type { BackendApiResponse, BackendStatus } from "@/shared/domain/types/api.types";
import { httpClient, serializeRepeatParams } from "@/shared/infrastructure/http/httpClient";
import {
  parseXPaginationHeader,
  type XPaginationMeta,
} from "@/shared/infrastructure/http/xPagination";
import {
  AD_MANAGEMENT_SEED_KPIS,
  AD_MANAGEMENT_SEED_ROWS,
  getAdManagementSeedDetail,
} from "@/modules/admin/domain/data/adManagementSeedData";
import type {
  AdAnalytics,
  AdDetail,
  AdKpis,
  AdTablePage,
  AdTableRow,
  CreateAdApiPayload,
  UpdateAdPayload,
} from "@/modules/admin/domain/types/adManagement.types";
import type { AdManagementFilterState } from "@/modules/admin/domain/types/adManagementFilters.types";

const ADS_BASE = "/api/admin/ads";

export type AdsApiResult<T> = {
  status: BackendStatus | string;
  message?: string;
  errorMessage?: string;
  validationErrors?: Record<string, string[]> | null;
  data: T | null;
};

export type GetAdsParams = {
  keyword?: string;
  type?: string;
  placement?: string;
  status?: string;
  sortBy?: string;
  sortDir?: string;
  pageNumber: number;
  pageSize: number;
};

const DEFAULT_ADS_SORT_BY = "createdAt";
const DEFAULT_ADS_SORT_DIR = "desc";

export type AdsTableResult = AdsApiResult<AdTablePage>;

type UnknownRecord = Record<string, unknown>;

const USE_MOCK = process.env.NEXT_PUBLIC_ADS_USE_MOCK === "true";

function asRecord(value: unknown): UnknownRecord | null {
  return value !== null && typeof value === "object" ? (value as UnknownRecord) : null;
}

function readString(record: UnknownRecord | null, keys: string[], fallback = ""): string {
  if (!record) return fallback;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return fallback;
}

function readNumber(record: UnknownRecord | null, keys: string[]): number | null {
  if (!record) return null;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() && !Number.isNaN(Number(value))) {
      return Number(value);
    }
  }
  return null;
}

function readArray(record: UnknownRecord | null, keys: string[]): unknown[] | null {
  if (!record) return null;
  for (const key of keys) {
    const value = record[key];
    if (Array.isArray(value)) return value;
  }
  return null;
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

function buildErrorResult<T>(error: unknown, fallbackMessage: string): AdsApiResult<T> {
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

function normalizeType(value: string): AdTableRow["type"] {
  const normalized = value.toLowerCase();
  if (normalized.includes("popup") || normalized.includes("منبث")) return "popup";
  if (normalized.includes("card") || normalized.includes("بطاق")) return "card";
  return "banner";
}

function normalizeStatus(value: string): AdTableRow["status"] {
  const normalized = value.toLowerCase();
  if (normalized.includes("schedule") || normalized.includes("مجدول")) return "scheduled";
  if (normalized.includes("expir") || normalized.includes("منته")) return "expired";
  if (normalized.includes("draft") || normalized.includes("مسود")) return "draft";
  if (normalized.includes("pause") || normalized.includes("موقوف")) return "paused";
  return "active";
}

function normalizeAudiences(record: UnknownRecord | null): AdTableRow["audiences"] {
  const raw =
    readArray(record, ["audiences", "targetAudiences", "audience"]) ??
    [];
  const audiences: AdTableRow["audiences"] = [];
  for (const item of raw) {
    const value =
      typeof item === "string"
        ? item
        : readString(asRecord(item), ["id", "name", "code"], "");
    const normalized = value.toLowerCase();
    if (normalized.includes("student") || normalized.includes("طالب")) audiences.push("students");
    else if (normalized.includes("teacher") || normalized.includes("معلم")) audiences.push("teachers");
    else if (normalized.includes("parent") || normalized.includes("ولي")) audiences.push("parents");
    else if (normalized.includes("all") || normalized.includes("الكل")) audiences.push("all");
  }
  return audiences.length > 0 ? [...new Set(audiences)] : ["all"];
}

function mapAdRow(item: unknown, index: number): AdTableRow {
  const record = asRecord(item);
  const id = readString(record, ["id", "adId", "Id"], `ad-${index + 1}`);
  return {
    id,
    displayId: readString(record, ["displayId", "code", "referenceId", "Code"], `ADV-${id.slice(0, 4)}`),
    title: readString(record, ["title", "name", "Title"], "—"),
    thumbnailUrl: readString(record, ["thumbnailUrl", "mediaUrl", "imageUrl", "MediaUrl"], ""),
    type: normalizeType(readString(record, ["type", "displayType", "adType", "Type"], "banner")),
    audiences: normalizeAudiences(record),
    status: normalizeStatus(readString(record, ["status", "lifecycleStatus", "Status"], "active")),
    createdAt: readString(record, ["createdAt", "publishedAt", "CreatedAt", "CreatedAtUtc"], ""),
    views: readNumber(record, ["views", "viewCount", "totalViews", "Views", "ViewCount"]) ?? 0,
    clicks: readNumber(record, ["clicks", "clickCount", "totalClicks", "Clicks", "ClickCount"]) ?? 0,
  };
}

function extractRows(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  const record = asRecord(data);
  if (!record) return [];
  return readArray(record, ["items", "records", "results", "data", "ads", "list"]) ?? [];
}

function mapAdListPage(
  data: unknown,
  params: GetAdsParams,
  headerMeta?: XPaginationMeta | null,
): AdTablePage {
  const rows = extractRows(data).map(mapAdRow);
  const record = asRecord(data);
  const totalItems =
    headerMeta?.totalCount ??
    readNumber(record, ["totalCount", "total", "count", "totalItems"]) ??
    rows.length;
  const currentPage =
    headerMeta?.currentPage ??
    readNumber(record, ["pageNumber", "page", "currentPage"]) ??
    params.pageNumber;
  const pageSize =
    headerMeta?.pageSize ?? readNumber(record, ["pageSize", "limit", "size"]) ?? params.pageSize;
  const totalPages =
    headerMeta?.totalPages ??
    readNumber(record, ["totalPages", "pagesCount"]) ??
    Math.max(1, Math.ceil(totalItems / Math.max(pageSize, 1)));

  return {
    rows,
    currentPage,
    pageSize,
    totalItems,
    totalPages,
  };
}

function unwrapAdRecord(data: unknown): UnknownRecord | null {
  const record = asRecord(data);
  if (!record) return null;
  return asRecord(record.data) ?? record;
}

function readIdList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item === "string" && item.trim()) return item.trim();
      if (typeof item === "number" && Number.isFinite(item)) return String(item);
      return "";
    })
    .filter(Boolean);
}

function mapAdDetail(data: unknown): AdDetail | null {
  const record = unwrapAdRecord(data);
  if (!record) return null;

  const id = readString(record, ["id", "adId", "Id"], "");
  if (!id) return null;

  const row = mapAdRow(record, 0);
  const targeting = asRecord(record.targeting);

  const schoolIds = readIdList(
    readArray(targeting, ["schoolIds"]) ?? readArray(record, ["schoolIds"]),
  );
  const gradeLevelIds = readIdList(
    readArray(targeting, ["gradeIds"]) ?? readArray(record, ["gradeIds"]),
  );
  const subjectIds = readIdList(
    readArray(targeting, ["subjectIds"]) ?? readArray(record, ["subjectIds"]),
  );

  const schoolLabels =
    (readArray(record, ["schoolLabels", "schools"]) ?? [])
      .map((item) =>
        typeof item === "string" ? item : readString(asRecord(item), ["name", "label"], ""),
      )
      .filter(Boolean) as string[];
  const gradeLevelLabels =
    (readArray(record, ["gradeLevelLabels", "grades"]) ?? [])
      .map((item) =>
        typeof item === "string" ? item : readString(asRecord(item), ["name", "label"], ""),
      )
      .filter(Boolean) as string[];
  const subjectLabels =
    (readArray(record, ["subjectLabels", "subjects"]) ?? [])
      .map((item) =>
        typeof item === "string" ? item : readString(asRecord(item), ["name", "label"], ""),
      )
      .filter(Boolean) as string[];

  const startAt = readString(record, ["startAtUtc", "startAt", "startDate", "StartAtUtc"], "");
  const endAt = readString(record, ["endAtUtc", "endAt", "endDate", "EndAtUtc"], "");
  const status = normalizeStatus(readString(record, ["status", "lifecycleStatus", "Status"], "active"));
  const publishModeFromField = readString(record, ["publishMode"], "");
  const publishMode: AdDetail["publishMode"] = publishModeFromField.includes("schedule")
    ? "schedule"
    : status === "scheduled" || Boolean(startAt && endAt)
      ? "schedule"
      : "now";

  return {
    ...row,
    id,
    displayId: readString(record, ["displayId", "code", "referenceId", "Code"], id.slice(0, 8).toUpperCase()),
    description: readString(record, ["description", "body"], ""),
    ctaText: readString(record, ["ctaText", "actionButtonText"], ""),
    ctaUrl: readString(record, ["ctaUrl", "actionUrl", "targetUrl"], ""),
    mediaUrl: readString(record, ["mediaUrl", "thumbnailUrl", "imageUrl"], row.thumbnailUrl),
    placement: readString(record, ["placement", "Placement"], "") as AdDetail["placement"],
    frequencyType: readString(record, ["frequencyType", "FrequencyType"], "unlimited") as AdDetail["frequencyType"],
    status,
    schoolIds,
    schoolLabels,
    gradeLevelIds,
    gradeLevelLabels,
    subjectIds,
    subjectLabels,
    publishMode,
    startAt,
    endAt,
    timezone: readString(record, ["timezone"], "Asia/Riyadh"),
    createdAt: readString(record, ["createdAt", "publishedAt", "CreatedAt", "CreatedAtUtc"], startAt),
    createdBy: readString(record, ["createdBy", "authorName"], ""),
    ctr: readNumber(record, ["ctr", "engagementRate"]) ?? 0,
    daysRemaining: readNumber(record, ["daysRemaining", "remainingDays"]) ?? 0,
    viewsTrend: readNumber(record, ["viewsTrend"]) ?? undefined,
    clicksTrend: readNumber(record, ["clicksTrend"]) ?? undefined,
  };
}

function mapAdKpis(data: unknown): AdKpis | null {
  const record = asRecord(data);
  if (!record) return null;
  return {
    activeAds: readNumber(record, ["activeAds", "activeCount"]) ?? 0,
    scheduledAds: readNumber(record, ["scheduledAds", "scheduledCount"]) ?? 0,
    totalViews: readNumber(record, ["totalViews", "viewsTotal"]) ?? 0,
    engagementRate: readNumber(record, ["engagementRate", "ctr"]) ?? 0,
    activeAdsTrend: readNumber(record, ["activeAdsTrend"]) ?? undefined,
    totalViewsTrend: readNumber(record, ["totalViewsTrend"]) ?? undefined,
    engagementRateTrend: readNumber(record, ["engagementRateTrend"]) ?? undefined,
  };
}

function mapAdAnalytics(data: unknown): AdAnalytics | null {
  const record = asRecord(data);
  if (!record) return null;

  const dailyRaw = readArray(record, ["daily", "Daily"]) ?? [];
  const daily = dailyRaw
    .map((item) => {
      const row = asRecord(item);
      if (!row) return null;
      return {
        day: readString(row, ["day", "Day"], ""),
        impressions: readNumber(row, ["impressions", "Impressions"]) ?? 0,
        clicks: readNumber(row, ["clicks", "Clicks"]) ?? 0,
        uniqueUsers: readNumber(row, ["uniqueUsers", "UniqueUsers"]) ?? 0,
      };
    })
    .filter((row): row is AdAnalytics["daily"][number] => Boolean(row?.day));

  return {
    impressions: readNumber(record, ["impressions", "Impressions"]) ?? 0,
    clicks: readNumber(record, ["clicks", "Clicks"]) ?? 0,
    ctrPercentage: readNumber(record, ["ctrPercentage", "CtrPercentage", "ctr"]) ?? 0,
    uniqueUsers: readNumber(record, ["uniqueUsers", "UniqueUsers"]) ?? 0,
    daily,
  };
}

export function mergeAdDetailWithAnalytics(detail: AdDetail, analytics: AdAnalytics): AdDetail {
  return {
    ...detail,
    views: analytics.impressions,
    clicks: analytics.clicks,
    ctr: analytics.ctrPercentage,
  };
}

function buildListQueryParams(params: GetAdsParams): Record<string, unknown> {
  return {
    keyword: params.keyword?.trim() || undefined,
    type: params.type && params.type !== "all" ? params.type : undefined,
    placement: params.placement && params.placement !== "all" ? params.placement : undefined,
    status: params.status && params.status !== "all" ? params.status : undefined,
    sortBy: params.sortBy ?? DEFAULT_ADS_SORT_BY,
    sortDir: params.sortDir ?? DEFAULT_ADS_SORT_DIR,
    pageNumber: params.pageNumber,
    pageSize: params.pageSize,
  };
}

function filterSeedRows(params: GetAdsParams): AdTablePage {
  let rows = [...AD_MANAGEMENT_SEED_ROWS];
  const keyword = params.keyword?.trim().toLowerCase();
  if (keyword) {
    rows = rows.filter(
      (row) =>
        row.title.toLowerCase().includes(keyword) ||
        row.displayId.toLowerCase().includes(keyword),
    );
  }
  if (params.type && params.type !== "all") {
    rows = rows.filter((row) => row.type === params.type);
  }
  if (params.placement && params.placement !== "all") {
    rows = rows.filter((row) => row.type === params.placement?.toLowerCase());
  }
  if (params.status && params.status !== "all") {
    rows = rows.filter((row) => row.status === params.status);
  }

  const totalItems = rows.length;
  const pageSize = params.pageSize;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(params.pageNumber, totalPages);
  const start = (currentPage - 1) * pageSize;

  return {
    rows: rows.slice(start, start + pageSize),
    currentPage,
    pageSize,
    totalItems,
    totalPages,
  };
}

export async function getAds(params: GetAdsParams): Promise<AdsTableResult> {
  if (USE_MOCK) {
    return {
      status: "Success",
      data: filterSeedRows(params),
    };
  }

  try {
    const response = await httpClient.get<unknown>({
      url: ADS_BASE,
      params: buildListQueryParams(params),
      paramsSerializer: serializeRepeatParams,
    });
    const headerMeta = parseXPaginationHeader(response.headers ?? {});
    const page = mapAdListPage(response.data, params, headerMeta);

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      validationErrors: response.error?.validationErrors ?? null,
      data: page,
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to load ads");
  }
}

export async function getAdKpis(): Promise<AdsApiResult<AdKpis>> {
  if (USE_MOCK) {
    return { status: "Success", data: AD_MANAGEMENT_SEED_KPIS };
  }

  try {
    const response = await httpClient.get<unknown>({ url: `${ADS_BASE}/kpis` });
    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      validationErrors: response.error?.validationErrors ?? null,
      data: mapAdKpis(response.data),
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to load ad KPIs");
  }
}

export async function getAdById(adId: string): Promise<AdsApiResult<AdDetail>> {
  if (USE_MOCK) {
    return {
      status: "Success",
      data: getAdManagementSeedDetail(adId),
    };
  }

  try {
    const response = await httpClient.get<unknown>({
      url: `${ADS_BASE}/${encodeURIComponent(adId)}`,
    });

    const detail = mapAdDetail(response.data);

    return {
      status: response.status,
      message: response.message,
      errorMessage: detail ? undefined : response.error?.message,
      validationErrors: response.error?.validationErrors ?? null,
      data: detail,
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to load ad");
  }
}

export async function getAdAnalytics(adId: string): Promise<AdsApiResult<AdAnalytics>> {
  if (USE_MOCK) {
    const seed = getAdManagementSeedDetail(adId);
    if (!seed) {
      return { status: "NotFound", errorMessage: "Ad not found", data: null };
    }
    return {
      status: "Success",
      data: {
        impressions: seed.views,
        clicks: seed.clicks,
        ctrPercentage: seed.ctr,
        uniqueUsers: Math.round(seed.views * 0.75),
        daily: [],
      },
    };
  }

  try {
    const response = await httpClient.get<unknown>({
      url: `${ADS_BASE}/${encodeURIComponent(adId)}/analytics`,
    });

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      validationErrors: response.error?.validationErrors ?? null,
      data: mapAdAnalytics(response.data),
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to load ad analytics");
  }
}

function extractAdId(data: unknown): string | null {
  if (typeof data === "string" && data.trim()) return data.trim();

  const record = asRecord(data);
  if (!record) return null;

  const directId = readString(record, ["id", "adId", "Id"], "");
  if (directId) return directId;

  for (const key of ["data", "result", "ad"]) {
    const nested = record[key];
    if (typeof nested === "string" && nested.trim()) return nested.trim();
    const nestedRecord = asRecord(nested);
    const nestedId = nestedRecord ? readString(nestedRecord, ["id", "adId", "Id"], "") : "";
    if (nestedId) return nestedId;
  }

  return null;
}

function buildCreatedAdDetail(id: string, payload: CreateAdApiPayload): AdDetail {
  return {
    id,
    displayId: id.slice(0, 8).toUpperCase(),
    title: payload.title,
    description: payload.description,
    ctaText: payload.ctaText,
    ctaUrl: payload.ctaUrl,
    mediaUrl: payload.mediaUrl,
    placement: payload.placement as AdDetail["placement"],
    frequencyType: payload.frequencyType,
    type: normalizeType(payload.type),
    audiences: ["all"],
    status: "draft",
    schoolIds: payload.schoolIds,
    schoolLabels: [],
    gradeLevelIds: payload.gradeIds.map(String),
    gradeLevelLabels: [],
    subjectIds: payload.subjectIds.map(String),
    subjectLabels: [],
    publishMode: "now",
    startAt: payload.startAtUtc,
    endAt: payload.endAtUtc,
    timezone: payload.timezone,
    createdAt: new Date().toISOString(),
    createdBy: "",
    views: 0,
    clicks: 0,
    ctr: 0,
    daysRemaining: 0,
  };
}

export async function createAd(payload: CreateAdApiPayload): Promise<AdsApiResult<AdDetail>> {
  try {
    const response = await httpClient.post<unknown>({ url: ADS_BASE, data: payload });
    const id = extractAdId(response.data);
    const mapped = mapAdDetail(response.data);

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      validationErrors: response.error?.validationErrors ?? null,
      data: id
        ? mapped
          ? { ...mapped, id }
          : buildCreatedAdDetail(id, payload)
        : mapped,
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to create ad");
  }
}

export async function publishAd(adId: string): Promise<AdsApiResult<AdDetail>> {
  if (USE_MOCK) {
    return {
      status: "Success",
      data: getAdManagementSeedDetail(adId),
    };
  }

  try {
    const response = await httpClient.post<unknown>({
      url: `${ADS_BASE}/${encodeURIComponent(adId)}/publish`,
      data: {},
    });
    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      validationErrors: response.error?.validationErrors ?? null,
      data: mapAdDetail(response.data),
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to publish ad");
  }
}

export async function updateAd(payload: UpdateAdPayload): Promise<AdsApiResult<AdDetail>> {
  try {
    const { id, ...body } = payload;
    const response = await httpClient.put<unknown>({
      url: `${ADS_BASE}/${encodeURIComponent(id)}`,
      data: body,
    });
    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      validationErrors: response.error?.validationErrors ?? null,
      data: mapAdDetail(response.data),
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to update ad");
  }
}

export async function deleteAd(adId: string): Promise<AdsApiResult<Record<string, never>>> {
  try {
    const response = await httpClient.delete<unknown>({
      url: `${ADS_BASE}/${encodeURIComponent(adId)}`,
    });
    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      validationErrors: response.error?.validationErrors ?? null,
      data: {},
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to delete ad");
  }
}

export async function pauseAd(adId: string): Promise<AdsApiResult<AdDetail>> {
  try {
    const response = await httpClient.post<unknown>({
      url: `${ADS_BASE}/${encodeURIComponent(adId)}/pause`,
      data: {},
    });
    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      validationErrors: response.error?.validationErrors ?? null,
      data: mapAdDetail(response.data),
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to pause ad");
  }
}

export function filtersToQueryParams(filters: AdManagementFilterState): Partial<GetAdsParams> {
  return {
    keyword: filters.keyword.trim() || undefined,
    type: filters.type === "all" ? undefined : filters.type,
    placement: filters.placement === "all" ? undefined : filters.placement,
    status: filters.status === "all" ? undefined : filters.status,
  };
}
