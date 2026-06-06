import type { BackendApiResponse, BackendStatus } from "@/shared/domain/types/api.types";
import { resolveFileUrl } from "@/shared/infrastructure/files/fileUrl";
import { httpClient } from "@/shared/infrastructure/http/httpClient";
import {
  parseXPaginationHeader,
  type XPaginationMeta,
} from "@/shared/infrastructure/http/xPagination";

type UnknownRecord = Record<string, unknown>;

export type QuestionBankApiResult<T> = {
  status: BackendStatus | string;
  message?: string;
  errorMessage?: string;
  data: T | null;
};

export type QuestionBankSummary = {
  totalQuestions: number;
  approved: number;
  pendingApproval: number;
  draft: number;
  rejected: number;
  archived: number;
};

export type QuestionBankEnumOption = {
  value: number;
  name: string;
  displayNameEn: string;
  displayNameAr: string;
};

export type QuestionBankEnums = {
  statuses: QuestionBankEnumOption[];
  difficultyLevels: QuestionBankEnumOption[];
  questionTypes: QuestionBankEnumOption[];
};

export type QuestionBankPageParams = {
  keyword?: string;
  pageNumber: number;
  pageSize: number;
  subjectId?: number;
  difficulty?: number;
  status?: number;
};

export type QuestionBankListRow = {
  id: string;
  subjectId: number | null;
  subjectName: string;
  questionSnippet: string;
  difficultyLevel: number | null;
  questionType: number | null;
  status: number | null;
};

export type QuestionBankListPage = {
  rows: QuestionBankListRow[];
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

export type QuestionBankChoice = {
  id: string;
  text: string;
  isCorrect: boolean;
  order: number;
  imageUrl: string | null;
};

export type CreateQuestionBankChoicePayload = {
  text: string;
  isCorrect: boolean;
  order: number;
  imageUrl: string;
};

export type CreateQuestionBankPayload = {
  subjectId: number;
  questionText: string;
  hint: string;
  explanation: string;
  attachmentUrl: string;
  difficultyLevel: number;
  questionType: number;
  choices: CreateQuestionBankChoicePayload[];
  submitForReview: boolean;
};

export type QuestionBankQuestionDetail = {
  id: string;
  subjectId: number | null;
  subjectName: string;
  questionText: string;
  hint: string | null;
  explanation: string | null;
  attachmentUrl: string | null;
  difficultyLevel: number | null;
  questionType: number | null;
  status: number | null;
  authorUserId: string | null;
  submittedAtUtc: string | null;
  reviewedByUserId: string | null;
  reviewedAtUtc: string | null;
  moderationNotes: string | null;
  choices: QuestionBankChoice[];
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

function buildErrorResult<T>(error: unknown, fallbackMessage: string): QuestionBankApiResult<T> {
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

function mapEnumOption(item: unknown): QuestionBankEnumOption | null {
  const record = asRecord(item);
  if (!record) return null;

  const value = readNumber(record, ["value"]);
  if (value === null) return null;

  return {
    value,
    name: readString(record, ["name"]),
    displayNameEn: readString(record, ["displayNameEn"]),
    displayNameAr: readString(record, ["displayNameAr"]),
  };
}

function mapSummary(data: unknown): QuestionBankSummary | null {
  const record = asRecord(data);
  if (!record) return null;

  return {
    totalQuestions: readNumber(record, ["totalQuestions"]) ?? 0,
    approved: readNumber(record, ["approved"]) ?? 0,
    pendingApproval: readNumber(record, ["pendingApproval"]) ?? 0,
    draft: readNumber(record, ["draft"]) ?? 0,
    rejected: readNumber(record, ["rejected"]) ?? 0,
    archived: readNumber(record, ["archived"]) ?? 0,
  };
}

function mapEnums(data: unknown): QuestionBankEnums | null {
  const record = asRecord(data);
  if (!record) return null;

  const statuses = readArray(record, ["statuses"])
    .map(mapEnumOption)
    .filter((item): item is QuestionBankEnumOption => item !== null);
  const difficultyLevels = readArray(record, ["difficultyLevels"])
    .map(mapEnumOption)
    .filter((item): item is QuestionBankEnumOption => item !== null);
  const questionTypes = readArray(record, ["questionTypes"])
    .map(mapEnumOption)
    .filter((item): item is QuestionBankEnumOption => item !== null);

  return {
    statuses,
    difficultyLevels,
    questionTypes,
  };
}

function mapListRow(item: unknown): QuestionBankListRow | null {
  const record = asRecord(item);
  if (!record) return null;

  const id = readString(record, ["id"]);
  if (!id) return null;

  return {
    id,
    subjectId: readNumber(record, ["subjectId"]),
    subjectName: readString(record, ["subjectName"], "—"),
    questionSnippet: readString(record, ["questionSnippet"], "—"),
    difficultyLevel: readNumber(record, ["difficultyLevel"]),
    questionType: readNumber(record, ["questionType"]),
    status: readNumber(record, ["status"]),
  };
}

function readNullableString(record: UnknownRecord | null, keys: string[]): string | null {
  const value = readString(record, keys, "");
  return value.trim() ? value : null;
}

function mapChoice(item: unknown): QuestionBankChoice | null {
  const record = asRecord(item);
  if (!record) return null;
  const id = readString(record, ["id"]);
  if (!id) return null;

  return {
    id,
    text: readString(record, ["text"], ""),
    isCorrect: record.isCorrect === true,
    order: readNumber(record, ["order"]) ?? 0,
    imageUrl: resolveFileUrl(readNullableString(record, ["imageUrl"])),
  };
}

function mapQuestionDetail(data: unknown): QuestionBankQuestionDetail | null {
  const record = asRecord(data);
  if (!record) return null;

  const id = readString(record, ["id"]);
  if (!id) return null;

  const choices = readArray(record, ["choices"])
    .map(mapChoice)
    .filter((item): item is QuestionBankChoice => item !== null)
    .sort((a, b) => a.order - b.order);

  return {
    id,
    subjectId: readNumber(record, ["subjectId"]),
    subjectName: readString(record, ["subjectName"], "—"),
    questionText: readString(record, ["questionText"], "—"),
    hint: readNullableString(record, ["hint"]),
    explanation: readNullableString(record, ["explanation"]),
    attachmentUrl: resolveFileUrl(readNullableString(record, ["attachmentUrl"])),
    difficultyLevel: readNumber(record, ["difficultyLevel"]),
    questionType: readNumber(record, ["questionType"]),
    status: readNumber(record, ["status"]),
    authorUserId: readNullableString(record, ["authorUserId"]),
    submittedAtUtc: readNullableString(record, ["submittedAtUtc"]),
    reviewedByUserId: readNullableString(record, ["reviewedByUserId"]),
    reviewedAtUtc: readNullableString(record, ["reviewedAtUtc"]),
    moderationNotes: readNullableString(record, ["moderationNotes"]),
    choices,
  };
}

function extractListRows(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  const record = asRecord(data);
  if (!record) return [];

  if (Array.isArray(record.data)) return record.data as unknown[];
  return readArray(record, ["items", "results", "records", "list", "rows"]);
}

function extractPageMeta(
  data: unknown,
  params: QuestionBankPageParams,
  rowCount: number,
): Omit<QuestionBankListPage, "rows"> {
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

export async function getQuestionBankSummary(): Promise<QuestionBankApiResult<QuestionBankSummary>> {
  try {
    const response = await httpClient.get<unknown>({
      url: "/api/v1/QuestionBank/summary",
    });

    const root = asRecord(response.data);
    const nested = asRecord(root?.data) ?? root;
    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: mapSummary(nested),
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to load question bank summary");
  }
}

export async function getQuestionBankEnums(): Promise<QuestionBankApiResult<QuestionBankEnums>> {
  try {
    const response = await httpClient.get<unknown>({
      url: "/api/v1/QuestionBank/enums",
    });

    const root = asRecord(response.data);
    const nested = asRecord(root?.data) ?? root;
    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: mapEnums(nested),
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to load question bank enums");
  }
}

function mapQuestionBankListPage(
  data: unknown,
  params: QuestionBankPageParams,
  headerMeta: XPaginationMeta | null,
): QuestionBankListPage | null {
  const rows = extractListRows(data)
    .map(mapListRow)
    .filter((item): item is QuestionBankListRow => item !== null);

  if (headerMeta) {
    return {
      rows,
      currentPage: headerMeta.currentPage,
      pageSize: headerMeta.pageSize,
      totalItems: headerMeta.totalCount,
      totalPages: headerMeta.totalPages,
    };
  }

  const meta = extractPageMeta(data, params, rows.length);
  return {
    rows,
    ...meta,
  };
}

export async function getQuestionBankPage(
  params: QuestionBankPageParams,
): Promise<QuestionBankApiResult<QuestionBankListPage>> {
  try {
    const response = await httpClient.get<unknown>({
      url: "/api/v1/QuestionBank/page",
      params: {
        keyword: params.keyword ?? "",
        pageNumber: params.pageNumber,
        pageSize: params.pageSize,
        ...(params.subjectId !== undefined ? { subjectId: params.subjectId } : {}),
        ...(params.difficulty !== undefined ? { difficulty: params.difficulty } : {}),
        ...(params.status !== undefined ? { status: params.status } : {}),
      },
    });

    const headerMeta = parseXPaginationHeader(response.headers ?? {});
    const page = mapQuestionBankListPage(response.data, params, headerMeta);

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: page,
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to load questions");
  }
}

export async function getQuestionBankQuestionById(
  id: string,
): Promise<QuestionBankApiResult<QuestionBankQuestionDetail>> {
  try {
    const response = await httpClient.get<unknown>({
      url: `/api/v1/QuestionBank/${encodeURIComponent(id)}`,
    });
    const root = asRecord(response.data);
    const nested = asRecord(root?.data) ?? root;
    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: mapQuestionDetail(nested),
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to load question details");
  }
}

export async function deleteQuestionBankQuestion(
  id: string,
): Promise<QuestionBankApiResult<Record<string, never>>> {
  try {
    const response = await httpClient.delete<unknown>({
      url: `/api/v1/QuestionBank/${encodeURIComponent(id)}`,
    });
    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: {},
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to delete question");
  }
}

function readCreatedQuestionId(data: unknown): string | null {
  if (typeof data === "string" && data.trim()) return data.trim();
  if (typeof data === "number" && Number.isFinite(data)) return String(data);
  const record = asRecord(data);
  if (!record) return null;
  const id = readString(record, ["id", "Id"], "").trim();
  return id || null;
}

/** Axios returns the backend envelope on `response.data`, not the created id at the top level. */
function mapCreateQuestionResponse(body: unknown): QuestionBankApiResult<string> {
  const root = asRecord(body);
  if (!root) {
    return {
      status: "Error",
      errorMessage: "Invalid create response",
      data: null,
    };
  }

  const nested = root.data;
  const createdId = readCreatedQuestionId(nested) ?? readCreatedQuestionId(root);
  const errorRecord = asRecord(root.error);
  const errorMessage = typeof errorRecord?.message === "string" ? errorRecord.message : undefined;

  const status =
    (typeof root.status === "string" ? root.status : undefined) ?? (errorMessage ? "Error" : "Success");
  const message = typeof root.message === "string" ? root.message : undefined;

  return {
    status,
    message,
    errorMessage,
    data: createdId,
  };
}

export async function createQuestionBankQuestion(
  payload: CreateQuestionBankPayload,
): Promise<QuestionBankApiResult<string>> {
  try {
    console.log(payload);
    const response = await httpClient.post<unknown>({
      url: "/api/v1/QuestionBank",
      data: payload,
    });
    const mapped = mapCreateQuestionResponse(response.data);
    if (mapped.errorMessage) {
      return mapped;
    }
    if (!mapped.data) {
      return {
        ...mapped,
        status: "Error",
        errorMessage: mapped.message ?? "Could not read created question id",
        data: null,
      };
    }
    return mapped;
  } catch (error) {
    return buildErrorResult(error, "Failed to create question");
  }
}
