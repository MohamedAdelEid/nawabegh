import type { BackendApiResponse, BackendStatus } from "@/shared/domain/types/api.types";
import { httpClient } from "@/shared/infrastructure/http/httpClient";
import {
  parseXPaginationHeader,
  type XPaginationMeta,
} from "@/shared/infrastructure/http/xPagination";

type UnknownRecord = Record<string, unknown>;

export type GradesApiResult<T> = {
  status: BackendStatus | string;
  message?: string;
  errorMessage?: string;
  validationErrors?: Record<string, string[]> | null;
  data: T | null;
};

export type GradeListItem = {
  id: number;
  educationLevelId: number;
  educationLevelNameAr: string;
  educationLevelNameEn: string;
  countryId: number;
  countryNameAr: string;
  countryNameEn: string;
  nameAr: string;
  nameEn: string;
  order: number;
  studentCount: number;
};

export type GradeListPage = {
  rows: GradeListItem[];
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

export type GetGradesParams = {
  countryId?: number;
  educationLevelId?: number;
  keyword?: string;
  pageNumber: number;
  pageSize: number;
};

export type CreateGradePayload = {
  educationLevelId: number;
  nameAr: string;
  nameEn: string;
  order: number;
};

export type UpdateGradePayload = CreateGradePayload & {
  id: number;
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

function extractPageMeta(
  data: unknown,
  params: GetGradesParams,
  rowCount: number,
  headerMeta: XPaginationMeta | null,
): Omit<GradeListPage, "rows"> {
  if (headerMeta) {
    return {
      currentPage: headerMeta.currentPage,
      pageSize: headerMeta.pageSize,
      totalItems: headerMeta.totalCount,
      totalPages: headerMeta.totalPages,
    };
  }

  const record = asRecord(data);
  const totalItems =
    readNumber(record, ["totalCount", "total", "count", "totalItems"]) ?? rowCount;
  const currentPage =
    readNumber(record, ["pageNumber", "page", "currentPage"]) ?? params.pageNumber;
  const pageSize = readNumber(record, ["pageSize", "limit", "size"]) ?? params.pageSize;
  const totalPages =
    readNumber(record, ["totalPages", "pagesCount"]) ??
    Math.max(1, Math.ceil(totalItems / Math.max(pageSize, 1)));

  return { currentPage, pageSize, totalItems, totalPages };
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

function buildErrorResult<T>(error: unknown, fallbackMessage: string): GradesApiResult<T> {
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

function mapGradeItem(item: unknown): GradeListItem | null {
  const record = asRecord(item);
  if (!record) return null;
  const id = readNumber(record, ["id"]);
  if (id === null) return null;

  return {
    id,
    educationLevelId: readNumber(record, ["educationLevelId"]) ?? 0,
    educationLevelNameAr: readString(record, ["educationLevelNameAr"], "—"),
    educationLevelNameEn: readString(record, ["educationLevelNameEn"], "—"),
    countryId: readNumber(record, ["countryId"]) ?? 0,
    countryNameAr: readString(record, ["countryNameAr"], "—"),
    countryNameEn: readString(record, ["countryNameEn"], "—"),
    nameAr: readString(record, ["nameAr"], "—"),
    nameEn: readString(record, ["nameEn"], "—"),
    order: readNumber(record, ["order"]) ?? 0,
    studentCount: readNumber(record, ["studentCount"]) ?? 0,
  };
}

function buildListQueryParams(params: GetGradesParams): Record<string, string | number> {
  const query: Record<string, string | number> = {
    pageNumber: params.pageNumber,
    pageSize: params.pageSize,
  };

  const keyword = params.keyword?.trim();
  if (keyword) query.keyword = keyword;

  if (params.countryId !== undefined && Number.isFinite(params.countryId)) {
    query.countryId = params.countryId;
  }

  if (params.educationLevelId !== undefined && Number.isFinite(params.educationLevelId)) {
    query.educationLevelId = params.educationLevelId;
  }

  return query;
}

export async function getGrades(params: GetGradesParams): Promise<GradesApiResult<GradeListPage>> {
  try {
    const response = await httpClient.get<unknown>({
      url: "/api/v1/Grades",
      params: buildListQueryParams(params),
    });

    const headerMeta = parseXPaginationHeader(response.headers ?? {});
    const rows = extractListRows(response.data)
      .map(mapGradeItem)
      .filter((row): row is GradeListItem => row !== null);
    const meta = extractPageMeta(response.data, params, rows.length, headerMeta);

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      validationErrors: response.error?.validationErrors ?? null,
      data: { rows, ...meta },
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to load grades");
  }
}

export async function createGrade(
  payload: CreateGradePayload,
): Promise<GradesApiResult<GradeListItem>> {
  try {
    const response = await httpClient.post<unknown>({
      url: "/api/v1/Grades",
      data: payload,
    });

    const envelope = asRecord(response.data);
    const nested = envelope ? asRecord(envelope.data) : null;
    const created = mapGradeItem(nested ?? envelope);

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      validationErrors: response.error?.validationErrors ?? null,
      data: created,
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to create grade");
  }
}

export async function updateGrade(
  id: number,
  payload: UpdateGradePayload,
): Promise<GradesApiResult<GradeListItem>> {
  try {
    const response = await httpClient.put<unknown>({
      url: `/api/v1/Grades/${id}`,
      data: payload,
    });

    const envelope = asRecord(response.data);
    const nested = envelope ? asRecord(envelope.data) : null;
    const updated = mapGradeItem(nested ?? envelope);

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      validationErrors: response.error?.validationErrors ?? null,
      data: updated,
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to update grade");
  }
}

export async function deleteGrade(id: number): Promise<GradesApiResult<null>> {
  try {
    const response = await httpClient.delete<unknown>({
      url: `/api/v1/Grades/${id}`,
    });

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      validationErrors: response.error?.validationErrors ?? null,
      data: null,
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to delete grade");
  }
}
