type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as UnknownRecord;
}

function readNumber(record: UnknownRecord | null, keys: string[]) {
  if (!record) return null;

  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() !== "") {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
  }

  return null;
}

function readBoolean(record: UnknownRecord | null, keys: string[], fallback: boolean) {
  if (!record) return fallback;

  for (const key of keys) {
    const value = record[key];
    if (typeof value === "boolean") return value;
    if (value === "true") return true;
    if (value === "false") return false;
  }

  return fallback;
}

export type XPaginationMeta = {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
};

export function parseXPaginationHeader(
  headers: Record<string, string | undefined>,
): XPaginationMeta | null {
  const raw =
    headers["x-pagination"] ??
    headers["X-Pagination"] ??
    Object.entries(headers).find(([key]) => key.toLowerCase() === "x-pagination")?.[1];

  if (!raw?.trim()) return null;

  try {
    const record = asRecord(JSON.parse(raw));
    if (!record) return null;

    const currentPage = readNumber(record, ["CurrentPage", "currentPage"]) ?? 1;
    const totalPages = readNumber(record, ["TotalPages", "totalPages"]) ?? 1;
    const pageSize = readNumber(record, ["PageSize", "pageSize"]) ?? 10;
    const totalCount =
      readNumber(record, ["TotalCount", "totalCount", "totalItems", "total"]) ?? 0;

    return {
      currentPage,
      totalPages: Math.max(1, totalPages),
      pageSize: Math.max(1, pageSize),
      totalCount: Math.max(0, totalCount),
      hasPrevious: readBoolean(record, ["HasPrevious", "hasPrevious"], currentPage > 1),
      hasNext: readBoolean(
        record,
        ["HasNext", "hasNext"],
        currentPage < Math.max(1, totalPages),
      ),
    };
  } catch {
    return null;
  }
}
