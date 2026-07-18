import { httpClient } from "@/shared/infrastructure/http/httpClient";
import {
  parseXPaginationHeader,
  type XPaginationMeta,
} from "@/shared/infrastructure/http/xPagination";
import type { BackendApiResponse, BackendStatus } from "@/shared/domain/types/api.types";
import axiosClient from "@/shared/infrastructure/http/axiosClient";
import { resolveApiUrl } from "@/shared/infrastructure/http/resolveApiUrl";
import { getToken } from "@/shared/infrastructure/http/tokenStore";

export enum SchoolStatus {
  PendingConfirmation = 0,
  Confirmed = 1,
  Suspended = 2,
}

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
  description?: string;
  logoUrl?: string;
  countryId: number;
  city?: string;
  address?: string;
  phoneNumber?: string;
  email: string;
  loginPassword: string;
  educationLevelIds?: number[];
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
  isActive: boolean;
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
  isActive: boolean;
  educationLevelIds: number[];
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
  id?: string;
  name: string;
  description?: string;
  logoUrl?: string;
  countryId: number;
  city?: string;
  address?: string;
  phoneNumber?: string;
  email: string;
  loginPassword?: string;
  educationLevelIds?: number[];
  status?: SchoolStatus;
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
  performanceLevel?: string;
  status?: SchoolStatus;
  pageNumber: number;
  pageSize: number;
}

export interface SchoolTableRow {
  id: string;
  schoolName: string;
  logoUrl: string;
  city: string;
  address: string;
  country: string;
  studentCount: string;
  points: number;
  totalPoints: string;
  ranking: number | null;
  performance: string;
  performanceStatus: "excellent" | "veryGood" | "good" | "neutral";
  foundedAt: string;
  status: string;
  statusCode: SchoolStatus;
  isActive: boolean;
  flag: string;
}

export type SchoolStatusResult = {
  status: BackendStatus | string;
  message?: string;
  errorMessage?: string;
  validationErrors?: Record<string, string[]> | null;
  data: { id: string; status: string; isActive: boolean } | null;
};

export type SchoolActionResult = {
  status: BackendStatus | string;
  message?: string;
  errorMessage?: string;
  validationErrors?: Record<string, string[]> | null;
  data: unknown;
};

export type SchoolImportRowStatus = "Valid" | "Invalid" | "Imported" | "Failed";

export type SchoolImportPreviewRow = {
  rowIndex: number;
  name: string;
  email: string;
  country: string;
  city: string;
  performanceLevel: string;
  status: SchoolImportRowStatus;
  errors: string[];
};

export type SchoolImportJob = {
  jobId: string;
  totalCount: number;
  validCount: number;
  invalidCount: number;
  importedCount: number;
  failedCount: number;
  expiresAtUtc: string;
  rows: SchoolImportPreviewRow[];
  currentPage: number;
  pageSize: number;
  totalPages: number;
};

export type SchoolImportFilters = {
  keyword?: string;
  country?: string;
  performanceLevel?: string;
  status?: SchoolImportRowStatus;
  pageNumber: number;
  pageSize: number;
};

export type SchoolImportJobResult = {
  status: BackendStatus | string;
  message?: string;
  errorMessage?: string;
  validationErrors?: Record<string, string[]> | null;
  data: SchoolImportJob | null;
};

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

function readBoolean(record: UnknownRecord | null, keys: string[]): boolean | null {
  if (!record) return null;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "boolean") return value;
  }
  return null;
}

function readStringArray(record: UnknownRecord | null, keys: string[]): string[] {
  return (readArray(record, keys) ?? []).filter(
    (value): value is string => typeof value === "string",
  );
}

function readNumberArray(record: UnknownRecord | null, keys: string[]): number[] {
  return (readArray(record, keys) ?? [])
    .map((value) => (typeof value === "number" ? value : Number(value)))
    .filter((value) => Number.isFinite(value));
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
  const address = readString(record, ["address"]) ?? "";
  const country = readString(record, ["country", "countryName"]) ?? "";
  const logoUrl = readString(record, ["logoUrl"]) ?? "";
  const studentCount = formatNumber(
    readNumber(record, ["studentsCount", "studentCount", "totalStudents"]),
  );
  const points = readNumber(record, ["totalPoints", "points", "pointsTotal"]) ?? 0;
  const totalPoints = formatNumber(points);
  const ranking = readNumber(record, ["rank", "ranking", "order"]);
  const performance =
    readString(record, ["performanceLevel", "performance", "levelName"]) ?? "—";
  const foundedAt = readString(record, [
    "establishmentDate",
    "foundedAt",
    "creationDate",
    "createdAt",
    "establishedDate",
  ]) ?? "—";
  const status = readString(record, ["statusName", "status", "state"]) ?? "—";
  const statusCode = parseSchoolStatusCode(record?.status ?? record?.statusCode);
  const isActive =
    readBoolean(record, ["isActive"]) ?? statusCode === SchoolStatus.Confirmed;
  const idValue =
    readString(record, ["id", "schoolId"]) ??
    String(readNumber(record, ["id", "schoolId"]) ?? `${pageNumber}-${pageSize}-${index}`);

  return {
    id: idValue,
    schoolName,
    logoUrl,
    city,
    address,
    country,
    studentCount,
    points,
    totalPoints,
    ranking,
    performance,
    performanceStatus: inferStatus(performance),
    foundedAt,
    status,
    statusCode,
    isActive,
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

function parseSchoolStatusCode(status: unknown): SchoolStatus {
  if (typeof status === "number" && Number.isFinite(status)) {
    return status as SchoolStatus;
  }
  if (typeof status === "string") {
    const trimmed = status.trim();
    if (trimmed && !Number.isNaN(Number(trimmed))) {
      return Number(trimmed) as SchoolStatus;
    }
    const normalized = trimmed.toLowerCase();
    if (normalized === "confirmed" || normalized === "active" || normalized === "نشط") {
      return SchoolStatus.Confirmed;
    }
    if (
      normalized === "suspended" ||
      normalized === "inactive" ||
      normalized.includes("غير نشط")
    ) {
      return SchoolStatus.Suspended;
    }
  }
  return SchoolStatus.PendingConfirmation;
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
    isActive:
      readBoolean(record, ["isActive"]) ??
      parseSchoolStatusCode(record["status"]) === SchoolStatus.Confirmed,
    educationLevelIds: readNumberArray(record, ["educationLevelIds"]),
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
    isActive:
      readBoolean(record, ["isActive"]) ??
      parseSchoolStatusCode(record["status"]) === SchoolStatus.Confirmed,
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

export async function updateSchoolStatus(
  id: string,
  isActive: boolean,
): Promise<SchoolStatusResult> {
  try {
    const response = await httpClient.patch<unknown>({
      url: `/api/v1/School/${encodeURIComponent(id)}/status`,
      data: { isActive },
    });
    const record = asRecord(response.data);
    const status = readString(record, ["status"]) ?? "";
    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      validationErrors: response.error?.validationErrors ?? null,
      data: {
        id: readString(record, ["id"]) ?? id,
        status,
        isActive:
          readBoolean(record, ["isActive"]) ??
          parseSchoolStatusCode(status) === SchoolStatus.Confirmed,
      },
    };
  } catch (error) {
    const axiosError = asRecord(error);
    const response = asRecord(axiosError?.response);
    const data = asRecord(response?.data) as BackendApiResponse<unknown> | null;
    return {
      status:
        (data?.status as BackendStatus | string | undefined) ??
        mapHttpStatus(readNumber(response, ["status"])),
      message: data?.message,
      errorMessage:
        data?.error?.message ??
        (axiosError?.message as string | undefined) ??
        "Failed to update school status",
      validationErrors: data?.error?.validationErrors ?? null,
      data: null,
    };
  }
}

export async function sendSchoolCredentials(id: string): Promise<SchoolActionResult> {
  try {
    const response = await httpClient.post<unknown>({
      url: `/api/v1/School/${encodeURIComponent(id)}/send-credentials`,
    });
    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      validationErrors: response.error?.validationErrors ?? null,
      data: response.data,
    };
  } catch (error) {
    const axiosError = asRecord(error);
    const response = asRecord(axiosError?.response);
    const data = asRecord(response?.data) as BackendApiResponse<unknown> | null;
    return {
      status:
        (data?.status as BackendStatus | string | undefined) ??
        mapHttpStatus(readNumber(response, ["status"])),
      message: data?.message,
      errorMessage:
        data?.error?.message ??
        (axiosError?.message as string | undefined) ??
        "Failed to send school credentials",
      validationErrors: data?.error?.validationErrors ?? null,
      data: null,
    };
  }
}

function downloadBlob(blob: Blob, fileName: string): void {
  const objectUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(objectUrl);
}

export async function exportSchools(
  params: Omit<GetSchoolsParams, "pageNumber" | "pageSize">,
): Promise<void> {
  const response = await axiosClient.get<Blob>(resolveApiUrl("/api/v1/School/export"), {
    params: buildSchoolListQueryParams({ ...params, pageNumber: 1, pageSize: 1 }),
    responseType: "blob",
  });
  const date = new Date().toISOString().slice(0, 10);
  downloadBlob(response.data, `schools-${date}.xlsx`);
}

export async function downloadSchoolImportTemplate(): Promise<void> {
  const response = await axiosClient.get<Blob>(
    resolveApiUrl("/api/v1/School/import/template"),
    { responseType: "blob" },
  );
  downloadBlob(response.data, "schools-import-template.xlsx");
}

function readRecordValue(record: UnknownRecord | null, keys: string[]): unknown {
  if (!record) return undefined;
  const lowerKeyMap = new Map(
    Object.keys(record).map((key) => [key.toLowerCase(), key] as const),
  );
  for (const key of keys) {
    if (key in record) return record[key];
    const actualKey = lowerKeyMap.get(key.toLowerCase());
    if (actualKey) return record[actualKey];
  }
  return undefined;
}

function readFlexibleString(record: UnknownRecord | null, keys: string[]): string | null {
  const value = readRecordValue(record, keys);
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return null;
}

function readFlexibleNumber(record: UnknownRecord | null, keys: string[]): number | null {
  const value = readRecordValue(record, keys);
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() && !Number.isNaN(Number(value))) {
    return Number(value);
  }
  return null;
}

function readFlexibleArray(record: UnknownRecord | null, keys: string[]): unknown[] | null {
  const value = readRecordValue(record, keys);
  return Array.isArray(value) ? value : null;
}

function readFlexibleStringArray(record: UnknownRecord | null, keys: string[]): string[] {
  const value = readRecordValue(record, keys);
  if (!Array.isArray(value)) {
    if (typeof value === "string" && value.trim()) return [value.trim()];
    return [];
  }
  return value
    .map((item) => {
      if (typeof item === "string") return item;
      const itemRecord = asRecord(item);
      return (
        readFlexibleString(itemRecord, ["message", "error", "description", "text"]) ?? ""
      );
    })
    .filter((item) => item.trim().length > 0);
}

function unwrapImportPayload(data: unknown): UnknownRecord | null {
  let current = asRecord(data);
  for (let depth = 0; depth < 3 && current; depth += 1) {
    const jobId = readFlexibleString(current, ["jobId", "id"]);
    const rows = readFlexibleArray(current, [
      "rows",
      "items",
      "records",
      "previewRows",
      "preview",
      "schools",
    ]);
    if (jobId || rows) return current;
    current = asRecord(current.data);
  }
  return asRecord(data);
}

function mapSchoolImportRow(
  value: unknown,
  fallbackIndex: number,
): SchoolImportPreviewRow | null {
  const record = asRecord(value);
  if (!record) return null;
  const rowIndex =
    readFlexibleNumber(record, [
      "rowIndex",
      "row",
      "index",
      "lineNumber",
      "rowNumber",
      "excelRow",
    ]) ?? fallbackIndex;
  const rawStatus = readFlexibleString(record, ["status", "rowStatus", "state"]) ?? "Invalid";
  const normalizedStatus = rawStatus.trim();
  const allowedStatuses: SchoolImportRowStatus[] = [
    "Valid",
    "Invalid",
    "Imported",
    "Failed",
  ];
  const statusMatch = allowedStatuses.find(
    (status) => status.toLowerCase() === normalizedStatus.toLowerCase(),
  );
  const status = statusMatch ?? "Invalid";
  return {
    rowIndex,
    name: readFlexibleString(record, ["name", "schoolName", "nameAr"]) ?? "",
    email: readFlexibleString(record, ["email", "schoolEmail", "mail"]) ?? "",
    country: readFlexibleString(record, ["country", "countryName", "countryCode"]) ?? "",
    city: readFlexibleString(record, ["city", "cityName"]) ?? "",
    performanceLevel:
      readFlexibleString(record, ["performanceLevel", "performance", "level"]) ?? "",
    status,
    errors: readFlexibleStringArray(record, ["errors", "errorMessages", "validationErrors"]),
  };
}

function extractImportRows(record: UnknownRecord | null): unknown[] {
  if (!record) return [];
  const direct = readFlexibleArray(record, [
    "rows",
    "items",
    "records",
    "previewRows",
    "preview",
    "schools",
  ]);
  if (direct) return direct;

  const nestedPreview = asRecord(readRecordValue(record, ["preview", "result", "page"]));
  return (
    readFlexibleArray(nestedPreview, ["rows", "items", "records", "previewRows"]) ?? []
  );
}

function mapSchoolImportJob(data: unknown, fallbackJobId = ""): SchoolImportJob | null {
  const record = unwrapImportPayload(data);
  if (!record) return null;
  const jobId = readFlexibleString(record, ["jobId", "id"]) ?? fallbackJobId;
  if (!jobId) return null;
  const rows = extractImportRows(record)
    .map((row, index) => mapSchoolImportRow(row, index + 1))
    .filter((row): row is SchoolImportPreviewRow => row !== null);
  const totalCount =
    readFlexibleNumber(record, ["totalCount", "total", "rowCount", "count"]) ?? rows.length;
  const pageSize =
    readFlexibleNumber(record, ["pageSize", "limit", "size"]) ?? Math.max(rows.length, 1);
  const validRows = rows.filter((row) => row.status === "Valid").length;
  const invalidRows = rows.filter((row) => row.status === "Invalid").length;
  const importedRows = rows.filter((row) => row.status === "Imported").length;
  const failedRows = rows.filter((row) => row.status === "Failed").length;
  return {
    jobId,
    totalCount,
    validCount:
      readFlexibleNumber(record, ["validCount", "valid", "validRows"]) ?? validRows,
    invalidCount:
      readFlexibleNumber(record, ["invalidCount", "invalid", "invalidRows"]) ?? invalidRows,
    importedCount:
      readFlexibleNumber(record, ["importedCount", "imported", "importedRows"]) ??
      importedRows,
    failedCount:
      readFlexibleNumber(record, ["failedCount", "failed", "failedRows"]) ?? failedRows,
    expiresAtUtc: readFlexibleString(record, ["expiresAtUtc", "expiresAt"]) ?? "",
    rows,
    currentPage: readFlexibleNumber(record, ["pageNumber", "currentPage", "page"]) ?? 1,
    pageSize,
    totalPages:
      readFlexibleNumber(record, ["totalPages", "pagesCount"]) ??
      Math.max(1, Math.ceil(totalCount / Math.max(pageSize, 1))),
  };
}

export async function uploadSchoolImport(file: File): Promise<SchoolImportJobResult> {
  try {
    const formData = new FormData();
    formData.append("file", file);
    // Avoid forcing Content-Type without boundary — let axios set multipart boundary.
    const response = await axiosClient.post<BackendApiResponse<unknown>>(
      resolveApiUrl("/api/v1/School/import/upload"),
      formData,
      {
        timeout: 0,
        headers: { "Content-Type": undefined },
      },
    );
    const payload = response.data;
    return {
      status: payload.status,
      message: payload.message,
      errorMessage: payload.error?.message,
      validationErrors: payload.error?.validationErrors ?? null,
      data: mapSchoolImportJob(payload.data ?? payload),
    };
  } catch (error) {
    const axiosError = asRecord(error);
    const response = asRecord(axiosError?.response);
    const data = asRecord(response?.data) as BackendApiResponse<unknown> | null;
    return {
      status:
        (data?.status as BackendStatus | string | undefined) ??
        mapHttpStatus(readNumber(response, ["status"])),
      message: data?.message,
      errorMessage:
        data?.error?.message ??
        (axiosError?.message as string | undefined) ??
        "Failed to upload school import",
      validationErrors: data?.error?.validationErrors ?? null,
      data: null,
    };
  }
}

export async function getSchoolImportJob(
  jobId: string,
  filters: SchoolImportFilters,
): Promise<SchoolImportJobResult> {
  try {
    const response = await httpClient.get<unknown>({
      url: `/api/v1/School/import/jobs/${encodeURIComponent(jobId)}`,
      params: filters,
    });
    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      validationErrors: response.error?.validationErrors ?? null,
      data: mapSchoolImportJob(response.data, jobId),
    };
  } catch (error) {
    const axiosError = asRecord(error);
    const response = asRecord(axiosError?.response);
    const data = asRecord(response?.data) as BackendApiResponse<unknown> | null;
    return {
      status:
        (data?.status as BackendStatus | string | undefined) ??
        mapHttpStatus(readNumber(response, ["status"])),
      message: data?.message,
      errorMessage:
        data?.error?.message ??
        (axiosError?.message as string | undefined) ??
        "Failed to load school import",
      validationErrors: data?.error?.validationErrors ?? null,
      data: null,
    };
  }
}

export async function startSchoolImport(
  jobId: string,
  rowIndexes?: number[],
): Promise<SchoolActionResult> {
  try {
    const response = await httpClient.post<unknown>({
      url: `/api/v1/School/import/jobs/${encodeURIComponent(jobId)}/start`,
      data: rowIndexes?.length ? { rowIndexes } : {},
    });
    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      validationErrors: response.error?.validationErrors ?? null,
      data: response.data,
    };
  } catch (error) {
    const axiosError = asRecord(error);
    const response = asRecord(axiosError?.response);
    const data = asRecord(response?.data) as BackendApiResponse<unknown> | null;
    return {
      status:
        (data?.status as BackendStatus | string | undefined) ??
        mapHttpStatus(readNumber(response, ["status"])),
      message: data?.message,
      errorMessage:
        data?.error?.message ??
        (axiosError?.message as string | undefined) ??
        "Failed to start school import",
      validationErrors: data?.error?.validationErrors ?? null,
      data: null,
    };
  }
}

export type SchoolImportStreamHandlers = {
  onProgress?: (data: {
    processed?: number;
    total?: number;
    percent?: number;
    currentEmail?: string;
  }) => void;
  onRow?: (data: {
    rowIndex: number;
    success: boolean;
    schoolId?: string;
    email?: string;
    error?: string;
  }) => void;
  onCompleted?: (data: {
    succeeded: number;
    failed: number;
    total: number;
  }) => void;
  onError?: (error: Error) => void;
};

function buildSchoolImportStreamUrl(jobId: string): string {
  const path = resolveApiUrl(
    `/api/v1/School/import/jobs/${encodeURIComponent(jobId)}/stream`,
  );
  const baseUrl = axiosClient.defaults.baseURL || window.location.origin;
  return new URL(path, `${baseUrl.replace(/\/+$/, "")}/`).toString();
}

function parseSseChunk(
  chunk: string,
  handlers: SchoolImportStreamHandlers,
): void {
  const blocks = chunk.split("\n\n");
  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;

    let eventName = "message";
    const dataLines: string[] = [];
    for (const line of trimmed.split("\n")) {
      if (line.startsWith("event:")) {
        eventName = line.slice(6).trim();
      } else if (line.startsWith("data:")) {
        dataLines.push(line.slice(5).trim());
      }
    }
    if (dataLines.length === 0) continue;

    try {
      const data = JSON.parse(dataLines.join("\n")) as Record<string, unknown>;
      if (eventName === "progress") {
        handlers.onProgress?.(data as Parameters<NonNullable<SchoolImportStreamHandlers["onProgress"]>>[0]);
      } else if (eventName === "row") {
        handlers.onRow?.(data as Parameters<NonNullable<SchoolImportStreamHandlers["onRow"]>>[0]);
      } else if (eventName === "completed") {
        handlers.onCompleted?.(
          data as Parameters<NonNullable<SchoolImportStreamHandlers["onCompleted"]>>[0],
        );
      } else if (eventName === "error") {
        const message =
          typeof data.message === "string"
            ? data.message
            : typeof data.error === "string"
              ? data.error
              : "Import stream error";
        handlers.onError?.(new Error(message));
      }
    } catch {
      // Ignore malformed SSE payloads and keep reading.
    }
  }
}

/** Prefer Bearer auth via fetch — EventSource cannot set Authorization and query-token often 401s. */
export async function subscribeSchoolImportStream(
  jobId: string,
  handlers: SchoolImportStreamHandlers,
  signal?: AbortSignal,
): Promise<void> {
  const token = await getToken();
  if (!token) {
    handlers.onError?.(new Error("Missing access token"));
    return;
  }

  const response = await fetch(buildSchoolImportStreamUrl(jobId), {
    method: "GET",
    headers: {
      Accept: "text/event-stream",
      Authorization: `Bearer ${token}`,
    },
    signal,
    cache: "no-store",
  });

  if (!response.ok) {
    handlers.onError?.(
      new Error(`Import stream failed with status ${response.status}`),
    );
    return;
  }

  if (!response.body) {
    handlers.onError?.(new Error("Import stream returned an empty body"));
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split("\n\n");
    buffer = parts.pop() ?? "";
    for (const part of parts) {
      parseSseChunk(part, handlers);
    }
  }

  if (buffer.trim()) {
    parseSseChunk(buffer, handlers);
  }
}

/** @deprecated Prefer subscribeSchoolImportStream (Bearer). Kept for compatibility. */
export async function getSchoolImportStreamUrl(jobId: string): Promise<string> {
  const url = new URL(buildSchoolImportStreamUrl(jobId));
  const token = await getToken();
  if (token) url.searchParams.set("access_token", token);
  return url.toString();
}

function mapSchoolListPage(
  data: unknown,
  params: GetSchoolsParams,
  headerMeta: XPaginationMeta | null,
): SchoolTablePage | null {
  const rowsRaw = data ? extractRows(data) : [];
  const rows = rowsRaw
    .map((item, index) => mapSchoolRow(item, index, params.pageNumber, params.pageSize))
    .sort((left, right) => right.points - left.points)
    .map((row, index) => ({
      ...row,
      ranking: (params.pageNumber - 1) * params.pageSize + index + 1,
    }));

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

  const performanceLevel = params.performanceLevel?.trim();
  if (performanceLevel) query.performanceLevel = performanceLevel;

  if (params.status !== undefined) query.status = params.status;

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
