import type { BackendApiResponse, BackendStatus } from "@/shared/domain/types/api.types";
import type {
  InteractiveBookStatusId,
  InteractiveBookTableRow,
} from "@/modules/admin/domain/data/interactiveBooksDashboardData";
import { httpClient } from "@/shared/infrastructure/http/httpClient";

export type InteractiveBooksApiResult<T> = {
  status: BackendStatus | string;
  message?: string;
  errorMessage?: string;
  data: T | null;
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

function readArray(record: UnknownRecord | null, keys: string[]): unknown[] {
  if (!record) return [];
  for (const key of keys) {
    const value = record[key];
    if (Array.isArray(value)) return value;
  }
  return [];
}

function buildErrorResult<T>(error: unknown, fallbackMessage: string): InteractiveBooksApiResult<T | null> {
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

export function mapInteractiveBookStatus(status: string | null | undefined): InteractiveBookStatusId {
  const s = (status ?? "").trim().toLowerCase();
  if (s === "published") return "published";
  return "draft";
}

function mapInteractiveBookRecord(record: UnknownRecord | null): InteractiveBookTableRow | null {
  if (!record) return null;
  const id = readString(record, ["id"], "");
  if (!id) return null;

  const pdfFileName = readString(
    record,
    ["pdfFileName", "fileName", "pdf", "documentFileName"],
    "",
  ).trim();

  return {
    id,
    title: readString(record, ["title"], "—"),
    courseTitle: readString(record, ["courseTitle"], "—"),
    gradeName: readString(record, ["gradeName"], "—"),
    pageCount: readNumber(record, ["pageCount"]) ?? 0,
    hotspotCount: readNumber(record, ["hotspotCount"]) ?? 0,
    activeHotspotCount: readNumber(record, ["activeHotspotCount"]) ?? 0,
    statusId: mapInteractiveBookStatus(readString(record, ["status"], "")),
    createdAt: readString(record, ["createdAt"], ""),
    ...(pdfFileName ? { pdfFileName } : {}),
  };
}

/**
 * Lists interactive books (`GET /api/v1/InteractiveBook`).
 * Response envelope: `{ data: InteractiveBookDto[] }` (array may be at root `data` or nested).
 */
export async function getInteractiveBooks(): Promise<InteractiveBooksApiResult<InteractiveBookTableRow[]>> {
  try {
    const response = await httpClient.get<unknown>({
      url: "/api/v1/InteractiveBook",
    });
    const root = asRecord(response.data);
    let rowsRaw: unknown[] = [];
    if (Array.isArray(root?.data)) {
      rowsRaw = root.data as unknown[];
    } else {
      const inner = asRecord(root?.data);
      rowsRaw = readArray(inner ?? root, ["items", "books", "results"]);
    }

    const rows = rowsRaw
      .map((item) => mapInteractiveBookRecord(asRecord(item)))
      .filter((row): row is InteractiveBookTableRow => row !== null);

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: rows,
    };
  } catch (error) {
    const failed = buildErrorResult<InteractiveBookTableRow[]>(error, "Failed to load interactive books");
    return { ...failed, data: failed.data ?? [] };
  }
}
