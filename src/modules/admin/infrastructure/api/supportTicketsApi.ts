import type { BackendApiResponse, BackendStatus } from "@/shared/domain/types/api.types";
import { httpClient } from "@/shared/infrastructure/http/httpClient";
import {
  parseXPaginationHeader,
  type XPaginationMeta,
} from "@/shared/infrastructure/http/xPagination";
import {
  SUPPORT_TICKET_STATUS,
  type AddSupportTicketMessagePayload,
  type CreateSupportTicketPayload,
  type SupportTicketDetail,
  type SupportTicketMessage,
  type SupportTicketPriority,
  type SupportTicketRow,
  type SupportTicketStats,
  type SupportTicketStatus,
  type SupportTicketTablePage,
} from "@/modules/admin/domain/types/supportTickets.types";
import type { SupportTicketsFilterState } from "@/modules/admin/domain/types/supportTicketsFilters.types";

const BASE = "/api/v1/SupportTickets";

export type SupportTicketsApiResult<T> = {
  status: BackendStatus | string;
  message?: string;
  errorMessage?: string;
  validationErrors?: Record<string, string[]> | null;
  data: T | null;
};

export type GetSupportTicketsParams = {
  status?: number;
  priority?: number;
  search?: string;
  pageNumber: number;
  pageSize: number;
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

function readBoolean(record: UnknownRecord | null, keys: string[], fallback = false): boolean {
  if (!record) return fallback;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "boolean") return value;
  }
  return fallback;
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

function buildErrorResult<T>(error: unknown, fallbackMessage: string): SupportTicketsApiResult<T> {
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

function mapAttachment(item: unknown) {
  const record = asRecord(item);
  if (!record) return null;

  const url = readString(record, ["url"]);
  if (!url) return null;

  return {
    id: readString(record, ["id"], "") || undefined,
    url,
    fileName: readString(record, ["fileName", "filename"], "file"),
    mimeType: readString(record, ["mimeType", "contentType"], "application/octet-stream"),
    sizeInBytes: readNumber(record, ["sizeInBytes", "size"]) ?? 0,
  };
}

function extractCreatedTicketId(data: unknown): string | null {
  if (typeof data === "string" && data.trim()) return data.trim();

  const record = asRecord(data);
  if (!record) return null;

  const nestedData = record.data;
  if (typeof nestedData === "string" && nestedData.trim()) return nestedData.trim();

  const id = readString(record, ["id"]);
  if (id) return id;

  const row = mapTicketRow(asRecord(nestedData) ?? record);
  return row?.id ?? null;
}

function buildCreatedTicketRow(
  id: string,
  payload: CreateSupportTicketPayload,
): SupportTicketRow {
  return {
    id,
    ticketNumber: "—",
    subject: payload.subject,
    status: SUPPORT_TICKET_STATUS.open,
    priority: payload.priority,
    createdByName: "—",
    assignedAdminName: "—",
    lastMessageAt: "",
    createdAt: new Date().toISOString(),
  };
}

function mapTicketRow(item: unknown): SupportTicketRow | null {
  const record = asRecord(item);
  if (!record) return null;

  const id = readString(record, ["id"]);
  if (!id) return null;

  const status = readNumber(record, ["status"]) ?? 1;
  const priority = readNumber(record, ["priority"]) ?? 2;

  return {
    id,
    ticketNumber: readString(record, ["ticketNumber"], "—"),
    subject: readString(record, ["subject"], "—"),
    status: status as SupportTicketStatus,
    priority: priority as SupportTicketPriority,
    createdByName: readString(record, ["createdByName"], "—"),
    assignedAdminName: readString(record, ["assignedAdminName"], "—"),
    lastMessageAt: readString(record, ["lastMessageAt"], ""),
    createdAt: readString(record, ["createdAt"], ""),
  };
}

function mapMessage(item: unknown): SupportTicketMessage | null {
  const record = asRecord(item);
  if (!record) return null;

  const id = readString(record, ["id"]);
  if (!id) return null;

  const attachmentsRaw = record.attachments;
  const attachments = (Array.isArray(attachmentsRaw) ? attachmentsRaw : [])
    .map(mapAttachment)
    .filter((attachment): attachment is NonNullable<typeof attachment> => attachment !== null);

  return {
    id,
    senderId: readString(record, ["senderId"], ""),
    senderName: readString(record, ["senderName"], "—"),
    message: readString(record, ["message"], ""),
    isInternalNote: readBoolean(record, ["isInternalNote"], false),
    createdAt: readString(record, ["createdAt"], ""),
    attachments,
  };
}

function mapTicketDetail(data: unknown): SupportTicketDetail | null {
  const record = asRecord(data);
  if (!record) return null;

  const nested = asRecord(record.data) ?? record;
  const id = readString(nested, ["id"]);
  if (!id) return null;

  const status = readNumber(nested, ["status"]) ?? 1;
  const priority = readNumber(nested, ["priority"]) ?? 2;
  const messagesRaw = nested.messages;
  const messages = (Array.isArray(messagesRaw) ? messagesRaw : [])
    .map(mapMessage)
    .filter((message): message is SupportTicketMessage => message !== null);

  const assignedAdminId = readString(nested, ["assignedAdminId"], "") || null;

  return {
    id,
    ticketNumber: readString(nested, ["ticketNumber"], "—"),
    subject: readString(nested, ["subject"], "—"),
    description: readString(nested, ["description"], ""),
    status: status as SupportTicketStatus,
    priority: priority as SupportTicketPriority,
    createdByUserId: readString(nested, ["createdByUserId"], ""),
    createdByName: readString(nested, ["createdByName"], "—"),
    assignedAdminId,
    assignedAdminName: readString(nested, ["assignedAdminName"], "") || null,
    closedAt: readString(nested, ["closedAt"], "") || null,
    createdAt: readString(nested, ["createdAt"], ""),
    lastMessageAt: readString(nested, ["lastMessageAt"], ""),
    messages,
  };
}

function extractPageMeta(
  data: unknown,
  params: GetSupportTicketsParams,
  rowCount: number,
  headerMeta: XPaginationMeta | null,
): Omit<SupportTicketTablePage, "rows"> {
  if (headerMeta) {
    return {
      currentPage: headerMeta.currentPage,
      pageSize: headerMeta.pageSize,
      totalItems: headerMeta.totalCount,
      totalPages: headerMeta.totalPages,
    };
  }

  const record = asRecord(data);
  const nested = asRecord(record?.data) ?? record;
  const totalItems =
    readNumber(nested, ["totalCount", "total", "count", "totalItems"]) ?? rowCount;
  const currentPage =
    readNumber(nested, ["pageNumber", "page", "currentPage"]) ?? params.pageNumber;
  const pageSize = readNumber(nested, ["pageSize", "limit", "size"]) ?? params.pageSize;
  const totalPages =
    readNumber(nested, ["totalPages", "pagesCount"]) ??
    Math.max(1, Math.ceil(totalItems / Math.max(pageSize, 1)));

  return { currentPage, pageSize, totalItems, totalPages };
}

function buildListQueryParams(params: GetSupportTicketsParams): Record<string, string | number> {
  const query: Record<string, string | number> = {
    pageNumber: params.pageNumber,
    pageSize: params.pageSize,
  };

  if (params.status != null) query.status = params.status;
  if (params.priority != null) query.priority = params.priority;
  if (params.search?.trim()) query.search = params.search.trim();

  return query;
}

export function filtersToQueryParams(
  filters: SupportTicketsFilterState,
  search: string,
): Pick<GetSupportTicketsParams, "status" | "priority" | "search"> {
  const result: Pick<GetSupportTicketsParams, "status" | "priority" | "search"> = {};

  if (filters.status !== "all") {
    const status = Number(filters.status);
    if (!Number.isNaN(status)) result.status = status;
  }

  if (filters.priority !== "all") {
    const priority = Number(filters.priority);
    if (!Number.isNaN(priority)) result.priority = priority;
  }

  if (search.trim()) result.search = search.trim();

  return result;
}

export async function getSupportTickets(
  params: GetSupportTicketsParams,
): Promise<SupportTicketsApiResult<SupportTicketTablePage>> {
  try {
    const response = await httpClient.get<unknown>({
      url: `${BASE}/admin`,
      params: buildListQueryParams(params),
    });

    const headerMeta = parseXPaginationHeader(response.headers ?? {});
    const rows = extractListRows(response.data)
      .map(mapTicketRow)
      .filter((row): row is SupportTicketRow => row !== null);
    const meta = extractPageMeta(response.data, params, rows.length, headerMeta);

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      validationErrors: response.error?.validationErrors ?? null,
      data: { rows, ...meta },
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to load support tickets");
  }
}

export async function getSupportTicketStats(): Promise<SupportTicketsApiResult<SupportTicketStats>> {
  try {
    const [openResult, inProgressResult, closedResult, totalResult] = await Promise.all([
      getSupportTickets({ status: 1, pageNumber: 1, pageSize: 1 }),
      getSupportTickets({ status: 2, pageNumber: 1, pageSize: 1 }),
      getSupportTickets({ status: 3, pageNumber: 1, pageSize: 1 }),
      getSupportTickets({ pageNumber: 1, pageSize: 1 }),
    ]);

    const firstError =
      openResult.errorMessage ??
      inProgressResult.errorMessage ??
      closedResult.errorMessage ??
      totalResult.errorMessage;

    if (firstError && !openResult.data && !totalResult.data) {
      return {
        status: openResult.status,
        errorMessage: firstError,
        data: null,
      };
    }

    return {
      status: "Success",
      data: {
        open: openResult.data?.totalItems ?? 0,
        inProgress: inProgressResult.data?.totalItems ?? 0,
        closed: closedResult.data?.totalItems ?? 0,
        total: totalResult.data?.totalItems ?? 0,
      },
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to load support ticket stats");
  }
}

export async function getSupportTicketById(
  ticketId: string,
): Promise<SupportTicketsApiResult<SupportTicketDetail>> {
  try {
    const response = await httpClient.get<unknown>({
      url: `${BASE}/${encodeURIComponent(ticketId)}`,
    });

    const detail = mapTicketDetail(response.data);

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      validationErrors: response.error?.validationErrors ?? null,
      data: detail,
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to load support ticket");
  }
}

export async function createSupportTicket(
  payload: CreateSupportTicketPayload,
): Promise<SupportTicketsApiResult<SupportTicketRow>> {
  try {
    const response = await httpClient.post<string>({
      url: BASE,
      data: payload,
    });

    const ticketId = extractCreatedTicketId(response.data);
    if (!ticketId) {
      return {
        status: response.status,
        message: response.message,
        errorMessage: response.error?.message || "Failed to create support ticket",
        validationErrors: response.error?.validationErrors ?? null,
        data: null,
      };
    }

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message || undefined,
      validationErrors: response.error?.validationErrors ?? null,
      data: buildCreatedTicketRow(ticketId, payload),
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to create support ticket");
  }
}

export async function addSupportTicketMessage(
  ticketId: string,
  payload: AddSupportTicketMessagePayload,
): Promise<SupportTicketsApiResult<SupportTicketMessage>> {
  try {
    const response = await httpClient.post<unknown>({
      url: `${BASE}/${encodeURIComponent(ticketId)}/messages`,
      data: {
        message: payload.message,
        isInternalNote: payload.isInternalNote,
        attachments: payload.attachments,
      },
    });

    const envelope = asRecord(response.data);
    const nested = envelope ? asRecord(envelope.data) : null;
    const created = mapMessage(nested ?? envelope);

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      validationErrors: response.error?.validationErrors ?? null,
      data: created,
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to send reply");
  }
}

async function resolveTicketMutationResult(
  ticketId: string,
  response: BackendApiResponse<boolean | unknown>,
  fallbackError: string,
): Promise<SupportTicketsApiResult<SupportTicketDetail>> {
  const detail = mapTicketDetail(response.data);
  if (detail) {
    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message || undefined,
      validationErrors: response.error?.validationErrors ?? null,
      data: detail,
    };
  }

  if (response.data !== true && response.status !== "Success") {
    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message || fallbackError,
      validationErrors: response.error?.validationErrors ?? null,
      data: null,
    };
  }

  const refreshed = await getSupportTicketById(ticketId);
  return {
    status: response.status,
    message: response.message ?? refreshed.message,
    errorMessage: refreshed.errorMessage,
    validationErrors: refreshed.validationErrors ?? null,
    data: refreshed.data,
  };
}

export async function updateSupportTicketStatus(
  ticketId: string,
  status: SupportTicketStatus,
): Promise<SupportTicketsApiResult<SupportTicketDetail>> {
  try {
    const response = await httpClient.patch<boolean>({
      url: `${BASE}/${encodeURIComponent(ticketId)}/status`,
      data: { status },
    });

    return resolveTicketMutationResult(ticketId, response, "Failed to update ticket status");
  } catch (error) {
    return buildErrorResult(error, "Failed to update ticket status");
  }
}

export async function assignSupportTicket(
  ticketId: string,
  assignedAdminId?: string,
): Promise<SupportTicketsApiResult<SupportTicketDetail>> {
  try {
    const response = await httpClient.patch<boolean>({
      url: `${BASE}/${encodeURIComponent(ticketId)}/assign`,
      data: assignedAdminId ? { assignedAdminId } : {},
    });

    return resolveTicketMutationResult(ticketId, response, "Failed to assign ticket");
  } catch (error) {
    return buildErrorResult(error, "Failed to assign ticket");
  }
}
