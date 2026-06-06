import type { BackendApiResponse, BackendStatus } from "@/shared/domain/types/api.types";
import type {
  InteractiveBookDetail,
  InteractiveBookStatusId,
  InteractiveBookTableRow,
} from "@/modules/admin/domain/data/interactiveBooksDashboardData";
import { httpClient } from "@/shared/infrastructure/http/httpClient";
import { parseXPaginationHeader } from "@/shared/infrastructure/http/xPagination";

export type InteractiveBooksApiResult<T> = {
  status: BackendStatus | string;
  message?: string;
  errorMessage?: string;
  data: T | null;
};

type UnknownRecord = Record<string, unknown>;
type InteractiveBooksSummaryValue = number | null;
type InteractiveBooksSummary = Record<string, InteractiveBooksSummaryValue>;

export type InteractiveBooksListData = {
  rows: InteractiveBookTableRow[];
  summary: InteractiveBooksSummary;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  hasPrevious: boolean;
  hasNext: boolean;
};

export type GetInteractiveBooksParams = {
  pageNumber: number;
  pageSize: number;
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

function readArray(record: UnknownRecord | null, keys: string[]): unknown[] {
  if (!record) return [];
  for (const key of keys) {
    const value = record[key];
    if (Array.isArray(value)) return value;
  }
  return [];
}

function readSummary(record: UnknownRecord | null, keys: string[]): InteractiveBooksSummary {
  if (!record) return {};
  for (const key of keys) {
    const value = asRecord(record[key]);
    if (!value) continue;

    const entries = Object.entries(value).reduce<InteractiveBooksSummary>((acc, [entryKey, entryValue]) => {
      if (typeof entryValue === "number" && Number.isFinite(entryValue)) {
        acc[entryKey] = entryValue;
        return acc;
      }
      if (typeof entryValue === "string" && entryValue.trim() !== "" && !Number.isNaN(Number(entryValue))) {
        acc[entryKey] = Number(entryValue);
        return acc;
      }
      if (entryValue === null) {
        acc[entryKey] = null;
      }
      return acc;
    }, {});

    if (Object.keys(entries).length > 0) return entries;
  }
  return {};
}

function buildErrorResult<T>(error: unknown, fallbackMessage: string): InteractiveBooksApiResult<T> {
  const axiosError = asRecord(error);
  const response = asRecord(axiosError?.response);
  const responseData = asRecord(response?.data);
  const dataEnvelope = responseData as BackendApiResponse<unknown> | null;

  const detailMessage =
    readString(responseData, ["detail", "title"], "") ||
    dataEnvelope?.error?.message ||
    (typeof axiosError?.message === "string" ? axiosError.message : fallbackMessage);

  return {
    status: (typeof dataEnvelope?.status === "string" ? dataEnvelope.status : undefined) ?? "Error",
    message: typeof dataEnvelope?.message === "string" ? dataEnvelope.message : undefined,
    errorMessage: detailMessage,
    data: null,
  };
}

export function mapInteractiveBookStatus(status: string | number | null | undefined): InteractiveBookStatusId {
  if (typeof status === "number") {
    return status === 1 ? "published" : "draft";
  }
  const s = (status ?? "").trim().toLowerCase();
  if (s === "published" || s === "1") return "published";
  return "draft";
}

/** `POST /api/v1/InteractiveBook` request body. */
export type CreateInteractiveBookPayload = {
  title: string;
  courseId: string;
  gradeId: number;
  pdfFileName: string;
  pdfUrl: string;
  pageCount: number;
  /** `0` = draft, `1` = published (API convention). */
  status: number;
};

function mapInteractiveBookRecord(record: UnknownRecord | null): InteractiveBookTableRow | null {
  if (!record) return null;
  const id = readString(record, ["id"], "");
  if (!id) return null;

  const pdfFileName = readString(
    record,
    ["pdfFileName", "fileName", "pdf", "documentFileName"],
    "",
  ).trim();
  const courseId = readString(record, ["courseId"], "");

  return {
    id,
    title: readString(record, ["title"], "—"),
    courseId,
    courseTitle: readString(record, ["courseTitle"], "—"),
    gradeId: readNumber(record, ["gradeId"]) ?? 0,
    gradeName: readString(record, ["gradeName"], "—"),
    pageCount: readNumber(record, ["pageCount"]) ?? 0,
    hotspotCount: readNumber(record, ["hotspotCount"]) ?? 0,
    activeHotspotCount: readNumber(record, ["activeHotspotCount"]) ?? 0,
    statusId: mapInteractiveBookStatus(readString(record, ["status"], "")),
    createdAt: readString(record, ["createdAt"], ""),
    ...(pdfFileName ? { pdfFileName } : {}),
  };
}

function mapInteractiveBookDetail(record: UnknownRecord | null): InteractiveBookDetail | null {
  const base = mapInteractiveBookRecord(record);
  if (!base || !record) return null;

  const pdfUrl = readString(record, ["pdfUrl"], "").trim();
  const updatedAt = readString(record, ["updatedAt"], "");

  return {
    ...base,
    pdfUrl,
    updatedAt,
  };
}

function unwrapSingleRecord(payload: unknown): UnknownRecord | null {
  const root = asRecord(payload);
  if (!root) return null;
  if (readString(root, ["id"], "")) return root;

  // `{ isSuccess: true, data: { id, pdfUrl, ... } }` (InteractiveBook/course)
  const nested = asRecord(root.data);
  if (nested && readString(nested, ["id"], "")) return nested;

  return null;
}

/**
 * Lists interactive books (`GET /api/v1/InteractiveBook`).
 * Response envelope: `{ data: InteractiveBookDto[] }` (array may be at root `data` or nested).
 */
export async function getInteractiveBooks(
  params: GetInteractiveBooksParams,
): Promise<InteractiveBooksApiResult<InteractiveBooksListData>> {
  try {
    const response = await httpClient.get<unknown>({
      url: "/api/v1/InteractiveBook",
      params: {
        pageNumber: params.pageNumber,
        pageSize: params.pageSize,
      },
    });
    const root = asRecord(response.data);
    const nested = asRecord(root?.data);
    let rowsRaw: unknown[] = [];
    if (Array.isArray(root?.data)) {
      rowsRaw = root.data as unknown[];
    } else {
      rowsRaw = readArray(nested ?? root, ["items", "books", "results"]);
    }

    const rows = rowsRaw
      .map((item) => mapInteractiveBookRecord(asRecord(item)))
      .filter((row): row is InteractiveBookTableRow => row !== null);
    const summaryFromRoot = readSummary(root, ["summary"]);
    const summaryFromNested = readSummary(nested, ["summary"]);
    const summary = { ...summaryFromNested, ...summaryFromRoot };
    const headerMeta = parseXPaginationHeader(response.headers);
    const totalItems = headerMeta?.totalCount ?? rows.length;
    const pageSize = headerMeta?.pageSize ?? Math.max(1, params.pageSize);
    const currentPage = headerMeta?.currentPage ?? Math.max(1, params.pageNumber);
    const totalPages =
      headerMeta?.totalPages ?? Math.max(1, Math.ceil(totalItems / Math.max(pageSize, 1)));
    const hasPrevious = headerMeta?.hasPrevious ?? currentPage > 1;
    const hasNext = headerMeta?.hasNext ?? currentPage < totalPages;

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: { rows, summary, currentPage, totalPages, pageSize, totalItems, hasPrevious, hasNext },
    };
  } catch (error) {
    const failed = buildErrorResult<InteractiveBooksListData>(error, "Failed to load interactive books");
    return {
      ...failed,
      data: failed.data ?? {
        rows: [],
        summary: {},
        currentPage: Math.max(1, params.pageNumber),
        totalPages: 1,
        pageSize: Math.max(1, params.pageSize),
        totalItems: 0,
        hasPrevious: false,
        hasNext: false,
      },
    };
  }
}

/**
 * Loads the interactive book for a course (`GET /api/v1/InteractiveBook/course/{courseId}`).
 * Response envelope: `{ data: InteractiveBookDto }`.
 */
export async function getInteractiveBookByCourseId(
  courseId: string,
): Promise<InteractiveBooksApiResult<InteractiveBookDetail>> {
  const trimmed = courseId.trim();
  if (!trimmed) {
    return {
      status: "Error",
      errorMessage: "Course id is required",
      data: null,
    };
  }

  try {
    const response = await httpClient.get<unknown>({
      url: `/api/v1/InteractiveBook/course/${encodeURIComponent(trimmed)}`,
    });
    const record = unwrapSingleRecord(response.data);
    const book = mapInteractiveBookDetail(record);

    if (!book) {
      return {
        status: response.status,
        message: response.message,
        errorMessage: response.error?.message ?? "Interactive book not found",
        data: null,
      };
    }

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: book,
    };
  } catch (error) {
    return buildErrorResult<InteractiveBookDetail>(error, "Failed to load interactive book");
  }
}

/**
 * Creates an interactive book (`POST /api/v1/InteractiveBook`).
 * Response envelope: `{ data: InteractiveBookDto }`.
 */
export async function createInteractiveBook(
  payload: CreateInteractiveBookPayload,
): Promise<InteractiveBooksApiResult<InteractiveBookDetail>> {
  try {
    const response = await httpClient.post<unknown>({
      url: "/api/v1/InteractiveBook",
      data: payload,
    });
    const record = unwrapSingleRecord(response.data);
    const book = mapInteractiveBookDetail(record);

    if (!book) {
      return {
        status: response.status,
        message: response.message,
        errorMessage: response.error?.message ?? "Failed to create interactive book",
        data: null,
      };
    }

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: book,
    };
  } catch (error) {
    return buildErrorResult<InteractiveBookDetail>(error, "Failed to create interactive book");
  }
}
