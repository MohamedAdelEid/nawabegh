import type { BackendApiResponse, BackendStatus } from "@/shared/domain/types/api.types";
import { httpClient } from "@/shared/infrastructure/http/httpClient";

type UnknownRecord = Record<string, unknown>;

export type SubjectApiResult<T> = {
  status: BackendStatus | string;
  message?: string;
  errorMessage?: string;
  data: T | null;
};

/** Subject row from `GET /api/v1/Subject` paged response. */
export type SubjectListItem = {
  id: number;
  nameAr: string;
  nameEn: string;
  iconUrl: string | null;
  coursesCount: number;
  teachersCount: number;
  createdAt: string | null;
};

export type CreateSubjectPayload = {
  nameAr: string;
  nameEn: string;
  iconUrl: string;
};

export type UpdateSubjectPayload = CreateSubjectPayload & {
  id: number;
};

export type SubjectPageParams = {
  keyword?: string;
  pageNumber: number;
  pageSize: number;
};

export type SubjectListPage = {
  rows: SubjectListItem[];
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
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

function readNullableString(record: UnknownRecord | null, keys: string[]): string | null {
  const value = readString(record, keys, "");
  return value.trim() ? value : null;
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

function buildErrorResult<T>(error: unknown, fallbackMessage: string): SubjectApiResult<T> {
  const axiosError = asRecord(error);
  const response = asRecord(axiosError?.response);
  const responseData = asRecord(response?.data);
  const dataEnvelope = responseData as BackendApiResponse<unknown> | null;
  const httpStatusCode = readNumber(response, ["status"]);

  const detailMessage =
    readString(responseData, ["detail", "title"], "") ||
    dataEnvelope?.error?.message ||
    (typeof axiosError?.message === "string" ? axiosError.message : fallbackMessage);

  return {
    status:
      (typeof dataEnvelope?.status === "string" ? dataEnvelope.status : undefined) ??
      mapHttpStatus(httpStatusCode),
    message: typeof dataEnvelope?.message === "string" ? dataEnvelope.message : undefined,
    errorMessage: detailMessage,
    data: null,
  };
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
  params: SubjectPageParams,
  rowCount: number,
): Omit<SubjectListPage, "rows"> {
  const record = asRecord(data);
  const totalItems =
    readNumber(record, ["totalCount", "total", "count", "totalItems"]) ?? rowCount;
  const currentPage =
    readNumber(record, ["pageNumber", "page", "currentPage"]) ?? params.pageNumber;
  const pageSize = readNumber(record, ["pageSize", "limit", "size"]) ?? params.pageSize;
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

function mapSubjectItem(item: unknown): SubjectListItem | null {
  const record = asRecord(item);
  if (!record) return null;
  const id = readNumber(record, ["id"]);
  if (id === null) return null;

  return {
    id,
    nameAr: readString(record, ["nameAr", "name_AR"], "—"),
    nameEn: readString(record, ["nameEn", "name_EN"], "—"),
    iconUrl: readNullableString(record, ["iconUrl", "iconURL"]),
    coursesCount: readNumber(record, ["coursesCount"]) ?? 0,
    teachersCount: readNumber(record, ["teachersCount"]) ?? 0,
    createdAt: readNullableString(record, ["createdAt", "created_at"]),
  };
}

export async function getSubjectsPage(
  params: SubjectPageParams,
): Promise<SubjectApiResult<SubjectListPage>> {
  try {
    const response = await httpClient.get<unknown>({
      url: "/api/v1/Subject",
      params: {
        keyword: params.keyword ?? "",
        pageNumber: params.pageNumber,
        pageSize: params.pageSize,
      },
    });

    const rows = extractListRows(response.data)
      .map(mapSubjectItem)
      .filter((row): row is SubjectListItem => row !== null);
    const meta = extractPageMeta(response.data, params, rows.length);

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: {
        rows,
        ...meta,
      },
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to load subjects");
  }
}

export async function createSubject(
  payload: CreateSubjectPayload,
): Promise<SubjectApiResult<SubjectListItem>> {
  try {
    const response = await httpClient.post<unknown>({
      url: "/api/v1/Subject",
      data: payload,
    });

    const envelope = asRecord(response.data);
    const nested = envelope ? asRecord(envelope.data) : null;
    const created = mapSubjectItem(nested ?? envelope);

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: created,
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to create subject");
  }
}

export async function updateSubject(
  id: number,
  payload: UpdateSubjectPayload,
): Promise<SubjectApiResult<SubjectListItem>> {
  try {
    const response = await httpClient.put<unknown>({
      url: `/api/v1/Subject/${id}`,
      data: payload,
    });

    const envelope = asRecord(response.data);
    const nested = envelope ? asRecord(envelope.data) : null;
    const updated = mapSubjectItem(nested ?? envelope);

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: updated,
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to update subject");
  }
}

export async function deleteSubject(id: number): Promise<SubjectApiResult<null>> {
  try {
    const response = await httpClient.delete<unknown>({
      url: `/api/v1/Subject/${id}`,
    });

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: null,
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to delete subject");
  }
}
