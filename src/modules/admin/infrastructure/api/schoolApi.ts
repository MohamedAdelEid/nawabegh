import { httpClient } from "@/shared/infrastructure/http/httpClient";
import type { BackendApiResponse, BackendStatus } from "@/shared/domain/types/api.types";

export interface GetSchoolsParams {
  keyword?: string;
  pageNumber: number;
  pageSize: number;
}

export interface SchoolTableRow {
  id: string;
  schoolName: string;
  city: string;
  studentCount: string;
  totalPoints: string;
  ranking: number | null;
  performance: string;
  performanceStatus: "excellent" | "veryGood" | "good" | "neutral";
  foundedAt: string;
  status: string;
  flag: string;
}

export interface SchoolTablePage {
  rows: SchoolTableRow[];
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface SchoolTableResult {
  status: BackendStatus | string;
  message?: string;
  errorMessage?: string;
  validationErrors?: Record<string, string[]> | null;
  page: SchoolTablePage | null;
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

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord | null {
  return value !== null && typeof value === "object" ? (value as UnknownRecord) : null;
}

function readString(record: UnknownRecord | null, keys: string[]): string | null {
  if (!record) return null;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return null;
}

function readNumber(record: UnknownRecord | null, keys: string[]): number | null {
  if (!record) return null;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
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

function formatNumber(value: number | null, fallback = "—"): string {
  return value === null ? fallback : new Intl.NumberFormat("en-US").format(value);
}

function inferStatus(value: string | null): SchoolTableRow["performanceStatus"] {
  if (!value) return "neutral";
  const normalized = value.toLowerCase();
  if (normalized.includes("ممتاز") || normalized.includes("excellent")) return "excellent";
  if (normalized.includes("جيد") || normalized.includes("very good")) return "veryGood";
  if (normalized.includes("good") || normalized.includes("جيد")) return "good";
  return "neutral";
}

function inferFlag(city: string): string {
  const normalized = city.toLowerCase();
  if (normalized.includes("riyadh") || normalized.includes("الرياض")) return "🇸🇦";
  if (normalized.includes("abha") || normalized.includes("أبها")) return "🇸🇦";
  if (normalized.includes("manama") || normalized.includes("المنامة")) return "🇧🇭";
  if (normalized.includes("cairo") || normalized.includes("القاهرة")) return "🇪🇬";
  return "🏫";
}

function extractRows(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;

  const record = asRecord(data);
  if (!record) return [];

  return (
    readArray(record, ["items", "records", "results", "data", "schools", "list"]) ?? []
  );
}

function extractPageMeta(
  data: unknown,
  params: GetSchoolsParams,
  rowCount: number,
): Omit<SchoolTablePage, "rows"> {
  const record = asRecord(data);
  const totalItems =
    readNumber(record, ["totalCount", "total", "count", "totalItems"]) ?? rowCount;
  const currentPage =
    readNumber(record, ["pageNumber", "page", "currentPage"]) ?? params.pageNumber;
  const pageSize =
    readNumber(record, ["pageSize", "limit", "size"]) ?? params.pageSize;
  const totalPages =
    readNumber(record, ["totalPages", "pagesCount"]) ??
    Math.max(1, Math.ceil(totalItems / Math.max(pageSize, 1)));

  return {
    currentPage,
    pageSize,
    totalItems,
    totalPages,
  };
}

function mapSchoolRow(item: unknown, index: number, pageNumber: number, pageSize: number): SchoolTableRow {
  const record = asRecord(item);
  const schoolName =
    readString(record, ["name", "nameAr", "schoolName", "title", "schoolNameAr"]) ?? "—";
  const city =
    readString(record, ["cityName", "cityNameAr", "city", "address", "regionName"]) ?? "—";
  const studentCount = formatNumber(
    readNumber(record, ["studentsCount", "studentCount", "totalStudents"]),
  );
  const totalPoints = formatNumber(
    readNumber(record, ["totalPoints", "points", "pointsTotal"]),
  );
  const ranking = readNumber(record, ["rank", "ranking", "order"]);
  const performance =
    readString(record, ["performanceLevel", "performance", "levelName"]) ?? "—";
  const foundedAt =
    readString(record, ["foundedAt", "creationDate", "createdAt", "establishedDate"]) ?? "—";
  const status = readString(record, ["statusName", "status", "state"]) ?? "—";
  const idValue =
    readString(record, ["id", "schoolId"]) ??
    String(readNumber(record, ["id", "schoolId"]) ?? `${pageNumber}-${pageSize}-${index}`);

  return {
    id: idValue,
    schoolName,
    city,
    studentCount,
    totalPoints,
    ranking,
    performance,
    performanceStatus: inferStatus(performance),
    foundedAt,
    status,
    flag: inferFlag(city),
  };
}

export async function getSchools(params: GetSchoolsParams): Promise<SchoolTableResult> {
  try {
    const response = await httpClient.get<unknown>({
      url: "/api/v1/School",
      params: {
        keyword: params.keyword ?? "",
        pageNumber: params.pageNumber,
        pageSize: params.pageSize,
      },
    });

    const rowsRaw = response.data ? extractRows(response.data) : [];
    const rows = rowsRaw.map((item, index) =>
      mapSchoolRow(item, index, params.pageNumber, params.pageSize),
    );
    const pageMeta = extractPageMeta(response.data, params, rows.length);

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      validationErrors: response.error?.validationErrors ?? null,
      page: {
        rows,
        ...pageMeta,
      },
    };
  } catch (error) {
    const axiosError = asRecord(error);
    const response = asRecord(axiosError?.response);
    const httpStatusCode = readNumber(response, ["status"]);
    const data = asRecord(response?.data) as BackendApiResponse<unknown> | null;

    return {
      status:
        (data?.status as BackendStatus | string | undefined) ??
        mapHttpStatus(httpStatusCode),
      message: data?.message,
      errorMessage:
        data?.error?.message ??
        (axiosError?.message as string | undefined) ??
        "Unexpected error",
      validationErrors: data?.error?.validationErrors ?? null,
      page: null,
    };
  }
}
