import type { BackendApiResponse, BackendStatus } from "@/shared/domain/types/api.types";
import { httpClient } from "@/shared/infrastructure/http/httpClient";
import {
  parseXPaginationHeader,
  type XPaginationMeta,
} from "@/shared/infrastructure/http/xPagination";

type UnknownRecord = Record<string, unknown>;

export type EducationLevelsApiResult<T> = {
  status: BackendStatus | string;
  message?: string;
  errorMessage?: string;
  validationErrors?: Record<string, string[]> | null;
  data: T | null;
};

export type EducationLevelListItem = {
  id: number;
  countryId: number;
  countryNameAr: string;
  countryNameEn: string;
  nameAr: string;
  nameEn: string;
  order: number;
  gradeCount: number;
};

export type EducationLevelListPage = {
  rows: EducationLevelListItem[];
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

export type GetEducationLevelsParams = {
  countryId?: number;
  keyword?: string;
  pageNumber: number;
  pageSize: number;
};

export type CreateEducationLevelPayload = {
  countryId: number;
  nameAr: string;
  nameEn: string;
  order: number;
};

export type UpdateEducationLevelPayload = CreateEducationLevelPayload & {
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
  params: GetEducationLevelsParams,
  rowCount: number,
  headerMeta: XPaginationMeta | null,
): Omit<EducationLevelListPage, "rows"> {
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

function buildErrorResult<T>(error: unknown, fallbackMessage: string): EducationLevelsApiResult<T> {
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

function mapEducationLevelItem(item: unknown): EducationLevelListItem | null {
  const record = asRecord(item);
  if (!record) return null;
  const id = readNumber(record, ["id"]);
  if (id === null) return null;

  return {
    id,
    countryId: readNumber(record, ["countryId"]) ?? 0,
    countryNameAr: readString(record, ["countryNameAr"], "—"),
    countryNameEn: readString(record, ["countryNameEn"], "—"),
    nameAr: readString(record, ["nameAr"], "—"),
    nameEn: readString(record, ["nameEn"], "—"),
    order: readNumber(record, ["order"]) ?? 0,
    gradeCount: readNumber(record, ["gradeCount"]) ?? 0,
  };
}

function buildListQueryParams(params: GetEducationLevelsParams): Record<string, string | number> {
  const query: Record<string, string | number> = {
    pageNumber: params.pageNumber,
    pageSize: params.pageSize,
  };

  const keyword = params.keyword?.trim();
  if (keyword) query.keyword = keyword;

  if (params.countryId !== undefined && Number.isFinite(params.countryId)) {
    query.countryId = params.countryId;
  }

  return query;
}

export async function getEducationLevels(
  params: GetEducationLevelsParams,
): Promise<EducationLevelsApiResult<EducationLevelListPage>> {
  try {
    const response = await httpClient.get<unknown>({
      url: "/api/v1/EducationLevels",
      params: buildListQueryParams(params),
    });

    const headerMeta = parseXPaginationHeader(response.headers ?? {});
    const rows = extractListRows(response.data)
      .map(mapEducationLevelItem)
      .filter((row): row is EducationLevelListItem => row !== null);
    const meta = extractPageMeta(response.data, params, rows.length, headerMeta);

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      validationErrors: response.error?.validationErrors ?? null,
      data: { rows, ...meta },
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to load education levels");
  }
}

export async function createEducationLevel(
  payload: CreateEducationLevelPayload,
): Promise<EducationLevelsApiResult<EducationLevelListItem>> {
  try {
    const response = await httpClient.post<unknown>({
      url: "/api/v1/EducationLevels",
      data: payload,
    });

    const envelope = asRecord(response.data);
    const nested = envelope ? asRecord(envelope.data) : null;
    const created = mapEducationLevelItem(nested ?? envelope);

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      validationErrors: response.error?.validationErrors ?? null,
      data: created,
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to create education level");
  }
}

export async function updateEducationLevel(
  id: number,
  payload: UpdateEducationLevelPayload,
): Promise<EducationLevelsApiResult<EducationLevelListItem>> {
  try {
    const response = await httpClient.put<unknown>({
      url: `/api/v1/EducationLevels/${id}`,
      data: payload,
    });

    const envelope = asRecord(response.data);
    const nested = envelope ? asRecord(envelope.data) : null;
    const updated = mapEducationLevelItem(nested ?? envelope);

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      validationErrors: response.error?.validationErrors ?? null,
      data: updated,
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to update education level");
  }
}

export async function deleteEducationLevel(id: number): Promise<EducationLevelsApiResult<null>> {
  try {
    const response = await httpClient.delete<unknown>({
      url: `/api/v1/EducationLevels/${id}`,
    });

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      validationErrors: response.error?.validationErrors ?? null,
      data: null,
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to delete education level");
  }
}
