import type { BackendApiResponse, BackendStatus } from "@/shared/domain/types/api.types";
import { httpClient } from "@/shared/infrastructure/http/httpClient";

type UnknownRecord = Record<string, unknown>;

export type HotspotApiResult<T> = {
  status: BackendStatus | string;
  message?: string;
  errorMessage?: string;
  data: T | null;
};

export type InteractiveBookHotspot = {
  id: string;
  interactiveBookId: string;
  title: string;
  pageNumber: number;
  xPosition: number;
  yPosition: number;
  width: number;
  height: number;
  videoUrl: string;
  isActive: boolean;
  visibility: number;
};

/** Partial payload from `POST /api/v1/Hotspot/{id}/toggle-activation`. */
export type HotspotActivationToggle = {
  id: string;
  isActive: boolean;
};

export type CreateHotspotPayload = {
  interactiveBookId: string;
  title: string;
  pageNumber: number;
  xPosition: number;
  yPosition: number;
  width: number;
  height: number;
  videoUrl: string;
  isActive: boolean;
  visibility: number;
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

function readNumber(record: UnknownRecord | null, keys: string[], fallback = 0): number {
  if (!record) return fallback;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() !== "" && !Number.isNaN(Number(value))) {
      return Number(value);
    }
  }
  return fallback;
}

function readBoolean(record: UnknownRecord | null, keys: string[], fallback = false): boolean {
  if (!record) return fallback;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "boolean") return value;
  }
  return fallback;
}

function mapVisibility(record: UnknownRecord | null): number {
  if (!record) return 0;
  const value = record.visibility;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (
      normalized === "visible" ||
      normalized === "published" ||
      normalized === "everyone" ||
      normalized === "0"
    ) {
      return 0;
    }
    if (normalized === "hidden" || normalized === "1") return 1;
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
}

/** Hotspot is shown to students when active and visibility is visible (0). */
export function isHotspotVisibleToStudents(hotspot: InteractiveBookHotspot): boolean {
  return hotspot.isActive && hotspot.visibility === 0;
}

function buildErrorResult<T>(error: unknown, fallbackMessage: string): HotspotApiResult<T> {
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

function mapHotspotActivationToggle(record: UnknownRecord | null): HotspotActivationToggle | null {
  if (!record) return null;
  const id = readString(record, ["id"], "").trim();
  if (!id) return null;

  return {
    id,
    isActive: readBoolean(record, ["isActive"], false),
  };
}

function mapHotspot(record: UnknownRecord | null): InteractiveBookHotspot | null {
  if (!record) return null;
  const id = readString(record, ["id"], "").trim();
  const interactiveBookId = readString(record, ["interactiveBookId"], "").trim();
  if (!id || !interactiveBookId) return null;

  return {
    id,
    interactiveBookId,
    title: readString(record, ["title"], "—"),
    pageNumber: readNumber(record, ["pageNumber"], 1),
    xPosition: readNumber(record, ["xPosition"], 0),
    yPosition: readNumber(record, ["yPosition"], 0),
    width: readNumber(record, ["width"], 6),
    height: readNumber(record, ["height"], 6),
    videoUrl: readString(record, ["videoUrl"], ""),
    isActive: readBoolean(record, ["isActive"], true),
    visibility: mapVisibility(record),
  };
}

function unwrapHotspotRecord(payload: unknown): UnknownRecord | null {
  const root = asRecord(payload);
  if (!root) return null;
  if (readString(root, ["id"], "")) return root;
  const nested = asRecord(root.data);
  if (nested && readString(nested, ["id"], "")) return nested;
  return null;
}

function unwrapHotspotsList(payload: unknown): unknown[] {
  const root = asRecord(payload);
  if (!root) return [];
  if (Array.isArray(root)) return root;
  if (Array.isArray(root.data)) return root.data as unknown[];
  const nested = asRecord(root.data);
  if (Array.isArray(nested?.items)) return nested.items as unknown[];
  if (Array.isArray(nested?.hotspots)) return nested.hotspots as unknown[];
  return [];
}

function mapHotspotList(payload: unknown): InteractiveBookHotspot[] {
  return unwrapHotspotsList(payload)
    .map((item) => mapHotspot(asRecord(item)))
    .filter((row): row is InteractiveBookHotspot => row !== null);
}

/**
 * Lists hotspots for an interactive book (`GET /api/v1/Hotspot/book/{interactiveBookId}`).
 * Response: `{ data: HotspotDto[] }`.
 */
export async function getHotspotsByInteractiveBookId(
  interactiveBookId: string,
): Promise<HotspotApiResult<InteractiveBookHotspot[]>> {
  const trimmed = interactiveBookId.trim();
  if (!trimmed) {
    return { status: "Error", errorMessage: "Interactive book id is required", data: null };
  }

  try {
    const response = await httpClient.get<unknown>({
      url: `/api/v1/Hotspot/book/${encodeURIComponent(trimmed)}`,
    });
    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: mapHotspotList(response.data),
    };
  } catch (bookPathError) {
    try {
      const response = await httpClient.get<unknown>({
        url: "/api/v1/Hotspot",
        params: { interactiveBookId: trimmed },
      });
      return {
        status: response.status,
        message: response.message,
        errorMessage: response.error?.message,
        data: mapHotspotList(response.data),
      };
    } catch (error) {
      const failed = buildErrorResult<InteractiveBookHotspot[]>(error, "Failed to load hotspots");
      return { ...failed, data: failed.data ?? [] };
    }
  }
}

/**
 * Lists hotspots for a single page (`GET /api/v1/Hotspot/book/{interactiveBookId}/page/{pageNumber}`).
 */
export async function getHotspotsByPage(
  interactiveBookId: string,
  pageNumber: number,
  options?: { activeOnly?: boolean },
): Promise<HotspotApiResult<InteractiveBookHotspot[]>> {
  const bookId = interactiveBookId.trim();
  if (!bookId) {
    return { status: "Error", errorMessage: "Interactive book id is required", data: null };
  }
  if (!Number.isFinite(pageNumber) || pageNumber < 1) {
    return { status: "Error", errorMessage: "Page number must be at least 1", data: null };
  }

  try {
    const response = await httpClient.get<unknown>({
      url: `/api/v1/Hotspot/book/${encodeURIComponent(bookId)}/page/${pageNumber}`,
      ...(options?.activeOnly !== undefined && { params: { activeOnly: options.activeOnly } }),
    });
    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: mapHotspotList(response.data),
    };
  } catch (error) {
    const failed = buildErrorResult<InteractiveBookHotspot[]>(error, "Failed to load page hotspots");
    return { ...failed, data: failed.data ?? [] };
  }
}

/**
 * Creates a hotspot (`POST /api/v1/Hotspot`).
 */
export async function createHotspot(
  payload: CreateHotspotPayload,
): Promise<HotspotApiResult<InteractiveBookHotspot>> {
  try {
    const response = await httpClient.post<unknown>({
      url: "/api/v1/Hotspot",
      data: payload,
    });
    const root = asRecord(response.data);
    const nested = asRecord(root?.data);
    const hotspot = mapHotspot(nested ?? root);

    if (!hotspot) {
      return {
        status: response.status,
        message: response.message,
        errorMessage: response.error?.message ?? "Failed to create hotspot",
        data: null,
      };
    }

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: hotspot,
    };
  } catch (error) {
    return buildErrorResult<InteractiveBookHotspot>(error, "Failed to create hotspot");
  }
}

/**
 * Deletes a hotspot (`DELETE /api/v1/Hotspot/{id}`).
 */
export async function deleteHotspot(hotspotId: string): Promise<HotspotApiResult<boolean>> {
  const trimmed = hotspotId.trim();
  if (!trimmed) {
    return { status: "Error", errorMessage: "Hotspot id is required", data: null };
  }

  try {
    const response = await httpClient.delete<unknown>({
      url: `/api/v1/Hotspot/${encodeURIComponent(trimmed)}`,
    });
    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: !response.error?.message,
    };
  } catch (error) {
    return buildErrorResult<boolean>(error, "Failed to delete hotspot");
  }
}

/**
 * Toggles hotspot active state (`POST /api/v1/Hotspot/{id}/toggle-activation`).
 */
export async function toggleHotspotActivation(
  hotspotId: string,
): Promise<HotspotApiResult<HotspotActivationToggle>> {
  const trimmed = hotspotId.trim();
  if (!trimmed) {
    return { status: "Error", errorMessage: "Hotspot id is required", data: null };
  }

  try {
    const response = await httpClient.patch<unknown>({
      url: `/api/v1/Hotspot/${encodeURIComponent(trimmed)}/toggle-activation`,
      data: {},
    });
    const toggle = mapHotspotActivationToggle(unwrapHotspotRecord(response.data));

    if (!toggle) {
      return {
        status: response.status,
        message: response.message,
        errorMessage: response.error?.message ?? "Failed to toggle hotspot",
        data: null,
      };
    }

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: toggle,
    };
  } catch (error) {
    return buildErrorResult<HotspotActivationToggle>(error, "Failed to toggle hotspot");
  }
}
