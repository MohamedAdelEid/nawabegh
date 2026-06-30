import { httpClient } from "@/shared/infrastructure/http/httpClient";
import {
  parseXPaginationHeader,
  type XPaginationMeta,
} from "@/shared/infrastructure/http/xPagination";
import type { BackendApiResponse, BackendStatus } from "@/shared/domain/types/api.types";

export type SchoolKpis = {
  totalSchools: number;
  activeSchools: number;
  totalTeachers: number;
  totalStudents: number;
};

export type SchoolKpisResult = {
  status: BackendStatus | string;
  message?: string;
  errorMessage?: string;
  validationErrors?: Record<string, string[]> | null;
  data: SchoolKpis | null;
};

export type CreateSchoolPayload = {
  name: string;
  logoUrl: string;
  phoneNumber: string;
  address: string;
  email: string;
  description: string;
  city: string;
  country: string;
  countryId: number;
  points: number;
  performanceLevel: string;
  establishmentDate: string;
  loginEmail: string;
  loginPassword: string;
  // subscriptionPlanId: string;
};

export type CreatedSchool = {
  id: string;
  name: string;
  logoUrl: string;
  phoneNumber: string;
  address: string;
  email: string;
  description: string;
  city: string;
  country: string;
  countryId: number;
  points: number;
  performanceLevel: string;
  establishmentDate: string;
  subscriptionPlanId: string;
  status: string;
  createdAt: string;
};

export type CreateSchoolResult = {
  status: BackendStatus | string;
  message?: string;
  errorMessage?: string;
  validationErrors?: Record<string, string[]> | null;
  data: CreatedSchool | null;
};

export type SchoolDetail = {
  id: string;
  name: string;
  logoUrl: string;
  phoneNumber: string;
  address: string;
  description: string;
  email: string;
  city: string;
  country: string;
  countryId: number;
  points: number;
  performanceLevel: string;
  establishmentDate: string;
  subscriptionPlanId: string;
  subscriptionPlanName: string;
  status: string;
  statusCode: number;
  studentCount: number;
  teacherCount: number;
  createdAt: string;
  updatedAt: string;
};

export type SchoolDetailResult = {
  status: BackendStatus | string;
  message?: string;
  errorMessage?: string;
  validationErrors?: Record<string, string[]> | null;
  data: SchoolDetail | null;
};

export type UpdateSchoolPayload = {
  id: string;
  name: string;
  logoUrl: string;
  phoneNumber: string;
  address: string;
  description: string;
  email: string;
  city: string;
  country: string;
  countryId: number;
  points: number;
  performanceLevel: string;
  establishmentDate: string;
  // subscriptionPlanId: string;
  status: number;
};

export type UpdateSchoolResult = {
  status: BackendStatus | string;
  message?: string;
  errorMessage?: string;
  validationErrors?: Record<string, string[]> | null;
  data: SchoolDetail | null;
};

export type DeleteSchoolResult = {
  status: BackendStatus | string;
  message?: string;
  errorMessage?: string;
  validationErrors?: Record<string, string[]> | null;
  data: Record<string, never> | null;
};

export interface GetSchoolsParams {
  keyword?: string;
  city?: string;
  country?: string;
  points?: number;
  performanceLevel?: string;
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

function mapSchoolKpisPayload(data: unknown): SchoolKpis | null {
  const record = asRecord(data);
  if (!record) return null;
  return {
    totalSchools: readNumber(record, ["totalSchools"]) ?? 0,
    activeSchools: readNumber(record, ["activeSchools"]) ?? 0,
    totalTeachers: readNumber(record, ["totalTeachers"]) ?? 0,
    totalStudents: readNumber(record, ["totalStudents"]) ?? 0,
  };
}

function parseSchoolStatusCode(status: unknown): number {
  if (typeof status === "number" && Number.isFinite(status)) {
    return status;
  }
  if (typeof status === "string") {
    const trimmed = status.trim();
    if (trimmed && !Number.isNaN(Number(trimmed))) {
      return Number(trimmed);
    }
    const normalized = trimmed.toLowerCase();
    if (normalized.includes("active") || normalized.includes("نشط")) return 0;
    if (normalized.includes("inactive") || normalized.includes("غير")) return 1;
  }
  return 0;
}

function mapSchoolDetail(data: unknown): SchoolDetail | null {
  const record = asRecord(data);
  if (!record) return null;
  const id = readString(record, ["id"]);
  if (!id) return null;

  return {
    id,
    name: readString(record, ["name"]) ?? "",
    logoUrl: readString(record, ["logoUrl"]) ?? "",
    phoneNumber: readString(record, ["phoneNumber"]) ?? "",
    address: readString(record, ["address"]) ?? "",
    description: readString(record, ["description"]) ?? "",
    email: readString(record, ["email"]) ?? "",
    city: readString(record, ["city", "cityName"]) ?? "",
    country: readString(record, ["country", "countryName"]) ?? "",
    countryId: readNumber(record, ["countryId"]) ?? 0,
    points: readNumber(record, ["points"]) ?? 0,
    performanceLevel: readString(record, ["performanceLevel"]) ?? "",
    establishmentDate: readString(record, ["establishmentDate"]) ?? "",
    subscriptionPlanId: readString(record, ["subscriptionPlanId"]) ?? "",
    subscriptionPlanName: readString(record, ["subscriptionPlanName"]) ?? "",
    status: readString(record, ["status", "statusName"]) ?? "",
    statusCode: parseSchoolStatusCode(record["status"]),
    studentCount: readNumber(record, ["studentCount", "studentsCount"]) ?? 0,
    teacherCount: readNumber(record, ["teacherCount", "teachersCount"]) ?? 0,
    createdAt: readString(record, ["createdAt"]) ?? "",
    updatedAt: readString(record, ["updatedAt"]) ?? "",
  };
}

function mapCreatedSchool(data: unknown): CreatedSchool | null {
  const record = asRecord(data);
  if (!record) return null;
  const id = readString(record, ["id"]);
  if (!id) return null;
  return {
    id,
    name: readString(record, ["name"]) ?? "",
    logoUrl: readString(record, ["logoUrl"]) ?? "",
    phoneNumber: readString(record, ["phoneNumber"]) ?? "",
    address: readString(record, ["address"]) ?? "",
    email: readString(record, ["email"]) ?? "",
    description: readString(record, ["description"]) ?? "",
    city: readString(record, ["city"]) ?? "",
    country: readString(record, ["country"]) ?? "",
    countryId: readNumber(record, ["countryId"]) ?? 0,
    points: readNumber(record, ["points"]) ?? 0,
    performanceLevel: readString(record, ["performanceLevel"]) ?? "",
    establishmentDate: readString(record, ["establishmentDate"]) ?? "",
    subscriptionPlanId: readString(record, ["subscriptionPlanId"]) ?? "",
    status: readString(record, ["status"]) ?? "",
    createdAt: readString(record, ["createdAt"]) ?? "",
  };
}

export async function getSchoolKpis(): Promise<SchoolKpisResult> {
  try {
    const response = await httpClient.get<unknown>({
      url: "/api/v1/School/kpis",
    });

    const payload = asRecord(response.data);
    const nested = payload ? asRecord(payload["data"]) : null;
    const kpis = mapSchoolKpisPayload(nested ?? payload);

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      validationErrors: response.error?.validationErrors ?? null,
      data: kpis,
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
        "Failed to load school KPIs",
      validationErrors: data?.error?.validationErrors ?? null,
      data: null,
    };
  }
}

export async function createSchool(
  payload: CreateSchoolPayload,
): Promise<CreateSchoolResult> {
  try {
    const response = await httpClient.post<unknown>({
      url: "/api/v1/School",
      data: payload,
    });

    const envelope = asRecord(response.data);
    const nested = envelope ? asRecord(envelope["data"]) : null;
    const created = mapCreatedSchool(nested ?? envelope);

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      validationErrors: response.error?.validationErrors ?? null,
      data: created,
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
        "Failed to create school",
      validationErrors: data?.error?.validationErrors ?? null,
      data: null,
    };
  }
}

export async function getSchoolById(id: string): Promise<SchoolDetailResult> {
  try {
    const response = await httpClient.get<unknown>({
      url: `/api/v1/School/${encodeURIComponent(id)}`,
    });

    const envelope = asRecord(response.data);
    const nested = envelope ? asRecord(envelope["data"]) : null;
    const detail = mapSchoolDetail(nested ?? envelope);

    return {
      status: response.status,
      message: response.message,
      errorMessage: detail ? undefined : response.error?.message,
      validationErrors: response.error?.validationErrors ?? null,
      data: detail,
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
        "Failed to load school",
      validationErrors: data?.error?.validationErrors ?? null,
      data: null,
    };
  }
}

export async function updateSchool(
  id: string,
  payload: UpdateSchoolPayload,
): Promise<UpdateSchoolResult> {
  try {
    const response = await httpClient.put<unknown>({
      url: `/api/v1/School/${encodeURIComponent(id)}`,
      data: payload,
    });

    const envelope = asRecord(response.data);
    const nested = envelope ? asRecord(envelope["data"]) : null;
    const updated = mapSchoolDetail(nested ?? envelope);

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      validationErrors: response.error?.validationErrors ?? null,
      data: updated,
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
        "Failed to update school",
      validationErrors: data?.error?.validationErrors ?? null,
      data: null,
    };
  }
}

export async function deleteSchool(id: string): Promise<DeleteSchoolResult> {
  try {
    const response = await httpClient.delete<unknown>({
      url: `/api/v1/School/${encodeURIComponent(id)}`,
    });

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      validationErrors: response.error?.validationErrors ?? null,
      data: {},
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
        "Failed to delete school",
      validationErrors: data?.error?.validationErrors ?? null,
      data: null,
    };
  }
}

function mapSchoolListPage(
  data: unknown,
  params: GetSchoolsParams,
  headerMeta: XPaginationMeta | null,
): SchoolTablePage | null {
  const rowsRaw = data ? extractRows(data) : [];
  const rows = rowsRaw.map((item, index) =>
    mapSchoolRow(item, index, params.pageNumber, params.pageSize),
  );

  if (headerMeta) {
    return {
      rows,
      currentPage: headerMeta.currentPage,
      pageSize: headerMeta.pageSize,
      totalItems: headerMeta.totalCount,
      totalPages: headerMeta.totalPages,
    };
  }

  const pageMeta = extractPageMeta(data, params, rows.length);
  return {
    rows,
    ...pageMeta,
  };
}

function buildSchoolListQueryParams(params: GetSchoolsParams): Record<string, string | number> {
  const query: Record<string, string | number> = {
    pageNumber: params.pageNumber,
    pageSize: params.pageSize,
  };

  const keyword = params.keyword?.trim();
  if (keyword) query.keyword = keyword;

  const city = params.city?.trim();
  if (city) query.city = city;

  const country = params.country?.trim();
  if (country) query.country = country;

  if (params.points !== undefined && Number.isFinite(params.points)) {
    query.points = params.points;
  }

  const performanceLevel = params.performanceLevel?.trim();
  if (performanceLevel) query.performanceLevel = performanceLevel;

  return query;
}

export async function getSchools(params: GetSchoolsParams): Promise<SchoolTableResult> {
  try {
    const response = await httpClient.get<unknown>({
      url: "/api/v1/School",
      params: buildSchoolListQueryParams(params),
    });

    const headerMeta = parseXPaginationHeader(response.headers ?? {});
    const page = mapSchoolListPage(response.data, params, headerMeta);

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      validationErrors: response.error?.validationErrors ?? null,
      page,
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

export type SchoolFilterOption = {
  id: string;
  name: string;
};

export type SchoolFilterOptionsResult = {
  status: BackendStatus | string;
  message?: string;
  errorMessage?: string;
  validationErrors?: Record<string, string[]> | null;
  data: SchoolFilterOption[] | null;
};

/** Loads schools from GET /api/v1/School for filter dropdowns. */
export async function getSchoolFilterOptions(
  params: {
    keyword?: string;
    country?: string;
    pageNumber?: number;
    pageSize?: number;
  } = {},
): Promise<SchoolFilterOptionsResult> {
  const result = await getSchools({
    keyword: params.keyword,
    country: params.country,
    pageNumber: params.pageNumber ?? 1,
    pageSize: params.pageSize ?? 500,
  });

  if (!result.page) {
    return {
      status: result.status,
      message: result.message,
      errorMessage: result.errorMessage,
      validationErrors: result.validationErrors ?? null,
      data: null,
    };
  }

  return {
    status: result.status,
    message: result.message,
    errorMessage: result.errorMessage,
    validationErrors: result.validationErrors ?? null,
    data: result.page.rows.map((row) => ({
      id: row.id,
      name: row.schoolName,
    })),
  };
}
