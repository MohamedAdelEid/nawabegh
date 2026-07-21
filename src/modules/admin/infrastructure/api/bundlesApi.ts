import type { CourseListItemDto } from "@/modules/admin/infrastructure/api/courseApi";
import { getCoursesPage } from "@/modules/admin/infrastructure/api/courseApi";
import type { BackendApiResponse, BackendStatus } from "@/shared/domain/types/api.types";
import type { AccessDurationDays } from "@/shared/domain/types/accessDuration.types";
import { httpClient } from "@/shared/infrastructure/http/httpClient";
import { parseXPaginationHeader, type XPaginationMeta } from "@/shared/infrastructure/http/xPagination";

const BUNDLES_BASE = "/api/v1/admin/bundles";

type UnknownRecord = Record<string, unknown>;

export type BundleStatus = 0 | 1;

export type BundlesApiResult<T> = {
  status: BackendStatus | string;
  message?: string;
  errorMessage?: string;
  data: T | null;
};

export type BundleAdminStats = {
  totalBundles: number;
  activeBundles: number;
  inactiveBundles: number;
  averageCompletionPercent: number;
};

export type BundleAdminListItem = {
  id: string;
  name: string;
  courseCount: number;
  bundlePrice: number;
  coursesTotalPrice: number;
  accessDurationDays: AccessDurationDays;
  status: BundleStatus;
  isPublished: boolean;
  createdAt: string | null;
};

export type BundleCourseDto = {
  courseId: string;
  title: string;
  coverImageUrl: string | null;
  coursePriceAtCreation: number;
};

export type BundleAdminDetail = {
  id: string;
  name: string;
  description: string | null;
  coverImageUrl: string | null;
  bundlePrice: number;
  coursesTotalPrice: number;
  savings: number;
  savingsPercent: number;
  accessDurationDays: AccessDurationDays;
  status: BundleStatus;
  isPublished: boolean;
  createdAt: string | null;
  courses: BundleCourseDto[];
};

export type BundleListParams = {
  keyword?: string;
  status?: BundleStatus;
  isPublished?: boolean;
  createdFromUtc?: string;
  createdToUtc?: string;
  minPrice?: number;
  maxPrice?: number;
  pageNumber: number;
  pageSize: number;
};

export type BundleListPage = {
  items: BundleAdminListItem[];
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
};

export type CreateBundlePayload = {
  name: string;
  description?: string | null;
  coverImageUrl?: string | null;
  bundlePrice: number;
  accessDurationDays?: AccessDurationDays;
  status: BundleStatus;
  isPublished: boolean;
  courseIds: string[];
};

export type UpdateBundlePayload = {
  name: string;
  description?: string | null;
  coverImageUrl?: string | null;
  bundlePrice: number;
  accessDurationDays?: AccessDurationDays;
  isPublished: boolean;
  courseIds?: string[];
};

export type BundleExploreCourse = {
  id: string;
  title: string;
  coverImageUrl: string | null;
  originalPrice: number;
  discountedPrice: number;
};

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

function readNullableString(record: UnknownRecord | null, keys: string[]): string | null {
  const value = readString(record, keys, "").trim();
  return value || null;
}

function readNumber(record: UnknownRecord | null, keys: string[], fallback?: number): number | null {
  if (!record) return fallback ?? null;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() !== "" && !Number.isNaN(Number(value))) {
      return Number(value);
    }
  }
  return fallback ?? null;
}

function readNullableNumber(record: UnknownRecord | null, keys: string[]): number | null {
  if (!record) return null;
  for (const key of keys) {
    if (!(key in record)) continue;
    const value = record[key];
    if (value === null) return null;
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

function readArray(record: UnknownRecord | null, keys: string[]): unknown[] | null {
  if (!record) return null;
  for (const key of keys) {
    const value = record[key];
    if (Array.isArray(value)) return value;
  }
  return null;
}

function extractEnvelopeData(data: unknown): unknown {
  const record = asRecord(data);
  return record?.data ?? data;
}

function extractListRows(data: unknown): unknown[] {
  const payload = extractEnvelopeData(data);
  if (Array.isArray(payload)) return payload;
  const record = asRecord(payload);
  const nested =
    readArray(record, ["items", "rows", "data", "results"]) ??
    readArray(asRecord(record?.data), ["items", "rows"]);
  return nested ?? [];
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

function buildErrorResult<T>(error: unknown, fallbackMessage: string): BundlesApiResult<T> {
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
    data: null,
  };
}

function mapBundleStatus(value: unknown): BundleStatus {
  const num = typeof value === "number" ? value : Number(value);
  return num === 1 ? 1 : 0;
}

function mapListItem(record: UnknownRecord): BundleAdminListItem | null {
  const id = readString(record, ["id"], "").trim();
  const name = readString(record, ["name"], "").trim();
  if (!id || !name) return null;

  return {
    id,
    name,
    courseCount: readNumber(record, ["courseCount"]) ?? 0,
    bundlePrice: readNumber(record, ["bundlePrice"]) ?? 0,
    coursesTotalPrice: readNumber(record, ["coursesTotalPrice"]) ?? 0,
    accessDurationDays: readNullableNumber(record, ["accessDurationDays"]),
    status: mapBundleStatus(readNumber(record, ["status"])),
    isPublished: readBoolean(record, ["isPublished"]),
    createdAt: readNullableString(record, ["createdAt"]),
  };
}

function mapBundleCourse(record: UnknownRecord): BundleCourseDto | null {
  const courseId = readString(record, ["courseId", "id"], "").trim();
  const title = readString(record, ["title", "name"], "").trim();
  if (!courseId) return null;

  return {
    courseId,
    title: title || courseId,
    coverImageUrl: readNullableString(record, ["coverImageUrl", "thumbnailUrl"]),
    coursePriceAtCreation: readNumber(record, ["coursePriceAtCreation", "price"]) ?? 0,
  };
}

function mapDetail(record: UnknownRecord): BundleAdminDetail | null {
  const id = readString(record, ["id"], "").trim();
  const name = readString(record, ["name"], "").trim();
  if (!id || !name) return null;

  const courses =
    readArray(record, ["courses"])?.map((item) => mapBundleCourse(asRecord(item) ?? {})) ?? [];
  const normalizedCourses = courses.filter((course): course is BundleCourseDto => course !== null);

  return {
    id,
    name,
    description: readNullableString(record, ["description"]),
    coverImageUrl: readNullableString(record, ["coverImageUrl"]),
    bundlePrice: readNumber(record, ["bundlePrice"]) ?? 0,
    coursesTotalPrice: readNumber(record, ["coursesTotalPrice"]) ?? 0,
    savings: readNumber(record, ["savings"]) ?? 0,
    savingsPercent: readNumber(record, ["savingsPercent"]) ?? 0,
    accessDurationDays: readNullableNumber(record, ["accessDurationDays"]),
    status: mapBundleStatus(readNumber(record, ["status"])),
    isPublished: readBoolean(record, ["isPublished"]),
    createdAt: readNullableString(record, ["createdAt"]),
    courses: normalizedCourses,
  };
}

function mapStats(record: UnknownRecord): BundleAdminStats {
  return {
    totalBundles: readNumber(record, ["totalBundles"]) ?? 0,
    activeBundles: readNumber(record, ["activeBundles"]) ?? 0,
    inactiveBundles: readNumber(record, ["inactiveBundles"]) ?? 0,
    averageCompletionPercent: readNumber(record, ["averageCompletionPercent"]) ?? 0,
  };
}

function mapExploreCourse(record: UnknownRecord): BundleExploreCourse | null {
  const id = readString(record, ["id", "courseId"], "").trim();
  const title = readString(record, ["title", "name", "courseTitle"], "").trim();
  if (!id) return null;

  const originalPrice = readNumber(record, ["originalPrice", "basePrice"]) ?? 0;
  const discountedPrice = readNumber(record, ["discountedPrice", "offerPrice"]) ?? 0;

  return {
    id,
    title: title || id,
    coverImageUrl: readNullableString(record, ["coverImageUrl", "thumbnailUrl"]),
    originalPrice,
    discountedPrice,
  };
}

function extractPageMeta(
  params: BundleListParams,
  rowCount: number,
  headerMeta: XPaginationMeta | null,
  fallbackTotal?: number,
): Omit<BundleListPage, "items"> {
  const currentPage = headerMeta?.currentPage ?? params.pageNumber;
  const pageSize = headerMeta?.pageSize ?? params.pageSize;
  const totalItems =
    headerMeta?.totalCount ??
    (fallbackTotal !== undefined ? fallbackTotal : undefined) ??
    (rowCount < pageSize ? (currentPage - 1) * pageSize + rowCount : currentPage * pageSize);
  const totalPages = headerMeta?.totalPages ?? Math.max(1, Math.ceil(totalItems / pageSize));
  const hasNextPage = headerMeta?.hasNext ?? rowCount >= pageSize;

  return {
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    hasNextPage,
  };
}

export function resolveCoursePrice(course: Pick<BundleExploreCourse, "discountedPrice" | "originalPrice">): number {
  return course.discountedPrice > 0 ? course.discountedPrice : course.originalPrice;
}

export function sumCoursePrices(courses: Array<Pick<BundleExploreCourse, "discountedPrice" | "originalPrice">>): number {
  return courses.reduce((total, course) => total + resolveCoursePrice(course), 0);
}

export async function getBundleStats(): Promise<BundlesApiResult<BundleAdminStats>> {
  try {
    const response = await httpClient.get<unknown>({ url: `${BUNDLES_BASE}/stats` });
    const payload = asRecord(extractEnvelopeData(response.data));
    if (!payload) {
      return {
        status: response.status,
        message: response.message,
        errorMessage: response.error?.message ?? "Invalid stats response",
        data: null,
      };
    }

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: mapStats(payload),
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to load bundle statistics");
  }
}

export async function getBundlesPage(
  params: BundleListParams,
  options?: { fallbackTotalItems?: number },
): Promise<BundlesApiResult<BundleListPage>> {
  try {
    const response = await httpClient.get<unknown>({
      url: BUNDLES_BASE,
      params: {
        pageNumber: params.pageNumber,
        pageSize: params.pageSize,
        ...(params.keyword?.trim() ? { keyword: params.keyword.trim() } : {}),
        ...(params.status !== undefined ? { status: params.status } : {}),
        ...(params.isPublished !== undefined ? { isPublished: params.isPublished } : {}),
        ...(params.createdFromUtc ? { createdFromUtc: params.createdFromUtc } : {}),
        ...(params.createdToUtc ? { createdToUtc: params.createdToUtc } : {}),
        ...(params.minPrice !== undefined ? { minPrice: params.minPrice } : {}),
        ...(params.maxPrice !== undefined ? { maxPrice: params.maxPrice } : {}),
      },
    });

    const items = extractListRows(response.data)
      .map((item) => mapListItem(asRecord(item) ?? {}))
      .filter((row): row is BundleAdminListItem => row !== null);
    const headerMeta = parseXPaginationHeader(response.headers ?? {});
    const meta = extractPageMeta(params, items.length, headerMeta, options?.fallbackTotalItems);

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: { items, ...meta },
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to load bundles");
  }
}

export async function getBundleById(bundleId: string): Promise<BundlesApiResult<BundleAdminDetail>> {
  try {
    const response = await httpClient.get<unknown>({
      url: `${BUNDLES_BASE}/${encodeURIComponent(bundleId)}`,
    });
    const payload = asRecord(extractEnvelopeData(response.data));
    const detail = payload ? mapDetail(payload) : null;
    if (!detail) {
      return {
        status: response.status,
        message: response.message,
        errorMessage: response.error?.message ?? "Bundle was not found",
        data: null,
      };
    }

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: detail,
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to load bundle");
  }
}

export async function createBundle(payload: CreateBundlePayload): Promise<BundlesApiResult<BundleAdminDetail>> {
  try {
    const response = await httpClient.post<unknown>({
      url: BUNDLES_BASE,
      data: payload,
    });
    const detail = mapDetail(asRecord(extractEnvelopeData(response.data)) ?? {});
    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: detail,
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to create bundle");
  }
}

export async function updateBundle(
  bundleId: string,
  payload: UpdateBundlePayload,
): Promise<BundlesApiResult<BundleAdminDetail>> {
  try {
    const response = await httpClient.put<unknown>({
      url: `${BUNDLES_BASE}/${encodeURIComponent(bundleId)}`,
      data: payload,
    });
    const detail = mapDetail(asRecord(extractEnvelopeData(response.data)) ?? {});
    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: detail,
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to update bundle");
  }
}

export async function deleteBundle(bundleId: string): Promise<BundlesApiResult<boolean>> {
  try {
    const response = await httpClient.delete<unknown>({
      url: `${BUNDLES_BASE}/${encodeURIComponent(bundleId)}`,
    });
    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: !response.error?.message,
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to delete bundle");
  }
}

export async function publishBundle(bundleId: string): Promise<BundlesApiResult<BundleAdminDetail>> {
  try {
    const response = await httpClient.post<unknown>({
      url: `${BUNDLES_BASE}/${encodeURIComponent(bundleId)}/publish`,
    });
    const detail = mapDetail(asRecord(extractEnvelopeData(response.data)) ?? {});
    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: detail,
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to publish bundle");
  }
}

export async function unpublishBundle(bundleId: string): Promise<BundlesApiResult<BundleAdminDetail>> {
  try {
    const response = await httpClient.post<unknown>({
      url: `${BUNDLES_BASE}/${encodeURIComponent(bundleId)}/unpublish`,
    });
    const detail = mapDetail(asRecord(extractEnvelopeData(response.data)) ?? {});
    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: detail,
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to unpublish bundle");
  }
}

export async function updateBundleStatus(
  bundleId: string,
  status: BundleStatus,
): Promise<BundlesApiResult<BundleAdminDetail>> {
  try {
    const response = await httpClient.patch<unknown>({
      url: `${BUNDLES_BASE}/${encodeURIComponent(bundleId)}/status`,
      data: { status },
    });
    const detail = mapDetail(asRecord(extractEnvelopeData(response.data)) ?? {});
    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: detail,
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to update bundle status");
  }
}

export async function getBundleExploreCourses(params?: {
  pageNumber?: number;
  pageSize?: number;
  keyword?: string;
}): Promise<BundlesApiResult<BundleExploreCourse[]>> {
  try {
    const response = await getCoursesPage({
      pageNumber: params?.pageNumber ?? 1,
      pageSize: params?.pageSize ?? 50,
      ...(params?.keyword?.trim() ? { keyword: params.keyword.trim() } : {}),
    });

    const courses =
      response.data?.rows.map((course: CourseListItemDto) => ({
        id: course.id,
        title: course.title,
        coverImageUrl: course.coverImageUrl,
        originalPrice: course.originalPrice,
        discountedPrice: course.discountedPrice,
      })) ?? [];

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.errorMessage,
      data: courses,
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to load courses");
  }
}
