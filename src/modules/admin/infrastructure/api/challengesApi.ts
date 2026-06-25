import type { BackendStatus } from "@/shared/domain/types/api.types";
import { getApiErrorMessage } from "@/shared/infrastructure/api/apiResponse.utils";
import { httpClient } from "@/shared/infrastructure/http/httpClient";

type UnknownRecord = Record<string, unknown>;

export type ChallengeApiResult<T> = {
  status: BackendStatus | string;
  message?: string;
  errorMessage?: string;
  data: T | null;
};

export type ChallengeAttachmentPayload = {
  fileUrl: string;
  fileName: string;
  fileExtension: string;
  fileSizeBytes: number;
};

export type CreateChallengePayload = {
  stationId: string;
  title: string;
  type: number;
  durationMinutes: number;
  questionCount: number;
  difficulty: number;
  challengeDate: string;
  startTime: string;
  endTime: string;
  timeZoneId: string;
  aiSourceFileUrl: string;
  attachments: ChallengeAttachmentPayload[];
};

export type UpdateChallengePayload = CreateChallengePayload & {
  id: string;
};

export type CreatedChallenge = {
  id: string;
  stationId: string;
  title: string;
};

export type ChallengeAttachment = {
  fileUrl: string;
  fileName: string;
  fileExtension: string;
  fileSizeBytes: number;
};

export type Challenge = {
  id: string;
  stationId: string;
  title: string;
  type: number;
  durationMinutes: number;
  questionCount: number;
  difficulty: number;
  challengeDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  timeZoneId: string;
  aiSourceFileUrl: string;
  attachments: ChallengeAttachment[];
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

function extractEnvelopeData(data: unknown): unknown {
  const record = asRecord(data);
  return record?.data ?? data;
}

function mapSupportedTimezones(data: unknown): string[] {
  const toTimezoneStrings = (items: unknown[]): string[] =>
    items.filter((item): item is string => typeof item === "string" && item.trim() !== "");

  if (Array.isArray(data)) {
    return toTimezoneStrings(data);
  }

  const envelope = extractEnvelopeData(data);
  if (Array.isArray(envelope)) {
    return toTimezoneStrings(envelope);
  }

  // httpClient spreads bare array responses into { 0: "Asia/Riyadh", 1: "...", headers: "..." }
  const record = asRecord(data);
  if (record) {
    const numericKeys = Object.keys(record).filter((key) => /^\d+$/.test(key));
    if (numericKeys.length > 0) {
      return toTimezoneStrings(
        numericKeys
          .sort((a, b) => Number(a) - Number(b))
          .map((key) => record[key]),
      );
    }
  }

  return [];
}

function readArray(record: UnknownRecord | null, keys: string[]): unknown[] {
  if (!record) return [];
  for (const key of keys) {
    const value = record[key];
    if (Array.isArray(value)) return value;
  }
  return [];
}

function mapChallengeAttachment(data: unknown): ChallengeAttachment | null {
  const record = asRecord(data);
  if (!record) return null;
  const fileUrl = readString(record, ["fileUrl"], "").trim();
  if (!fileUrl) return null;

  return {
    fileUrl,
    fileName: readString(record, ["fileName"], ""),
    fileExtension: readString(record, ["fileExtension"], ""),
    fileSizeBytes: readNumber(record, ["fileSizeBytes"]),
  };
}

function mapChallenge(data: unknown): Challenge | null {
  const record = asRecord(extractEnvelopeData(data));
  if (!record) return null;
  const id = readString(record, ["id", "challengeId"], "").trim();
  if (!id) return null;

  const challengeDate = readString(record, ["challengeDate", "scheduleDate", "startDate"], "");
  const endDate = readString(record, ["endDate", "challengeEndDate"], challengeDate);

  return {
    id,
    stationId: readString(record, ["stationId"], ""),
    title: readString(record, ["title"], ""),
    type: readNumber(record, ["type"]),
    durationMinutes: readNumber(record, ["durationMinutes", "durationMin"]),
    questionCount: readNumber(record, ["questionCount", "questionsCount"]),
    difficulty: readNumber(record, ["difficulty"]),
    challengeDate,
    endDate,
    startTime: readString(record, ["startTime"], "00:00:00"),
    endTime: readString(record, ["endTime"], "23:59:59"),
    timeZoneId: readString(record, ["timeZoneId", "timezoneId"], ""),
    aiSourceFileUrl: readString(record, ["aiSourceFileUrl"], ""),
    attachments: readArray(record, ["attachments"])
      .map(mapChallengeAttachment)
      .filter((attachment): attachment is ChallengeAttachment => Boolean(attachment)),
  };
}

function findChallengeId(value: unknown): string {
  const record = asRecord(value);
  if (!record) return "";

  const directId = readString(record, ["challengeId"], "").trim();
  if (directId) return directId;

  const nestedChallenge = asRecord(record.challenge);
  if (nestedChallenge) {
    const nestedId = readString(nestedChallenge, ["id", "challengeId"], "").trim();
    if (nestedId) return nestedId;
  }

  for (const key of ["challenge", "stationChallenge"]) {
    const nestedId = findChallengeId(record[key]);
    if (nestedId) return nestedId;
  }

  return "";
}

function mapCreatedChallenge(data: unknown): CreatedChallenge | null {
  const record = asRecord(extractEnvelopeData(data));
  if (!record) return null;
  const id = readString(record, ["id", "challengeId"], "").trim();
  if (!id) return null;

  return {
    id,
    stationId: readString(record, ["stationId"], ""),
    title: readString(record, ["title"], ""),
  };
}

function buildErrorResult<T>(error: unknown, fallbackMessage: string): ChallengeApiResult<T> {
  const axiosError = asRecord(error);
  const response = asRecord(axiosError?.response);
  const responseData = response?.data;
  const httpStatusCode = response ? readNumber(response, ["status"], 0) : null;

  const detailMessage =
    responseData !== null && typeof responseData === "object"
      ? getApiErrorMessage(
          responseData as Parameters<typeof getApiErrorMessage>[0],
          fallbackMessage,
        )
      : typeof axiosError?.message === "string"
        ? axiosError.message
        : fallbackMessage;

  return {
    status: mapHttpStatus(httpStatusCode),
    errorMessage: detailMessage,
    data: null,
  };
}

export async function getSupportedTimezones(): Promise<ChallengeApiResult<string[]>> {
  try {
    const response = await httpClient.get<unknown>({
      url: "/api/v1/challenges/supported-timezones",
    });

    // API returns a bare string[]; httpClient spreads it to { 0: "...", 1: "...", headers }
    const timezones = mapSupportedTimezones(response.data ?? response);

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: timezones,
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to load supported timezones");
  }
}

export async function getChallengeIdForStation(
  stationId: string,
): Promise<ChallengeApiResult<string>> {
  try {
    const response = await httpClient.get<unknown>({
      url: `/api/v1/Station/${stationId}`,
    });
    const challengeId = findChallengeId(extractEnvelopeData(response.data));

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: challengeId || null,
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to load station challenge");
  }
}

export async function getChallenge(challengeId: string): Promise<ChallengeApiResult<Challenge>> {
  try {
    const response = await httpClient.get<unknown>({
      url: `/api/v1/challenges/${challengeId}`,
    });

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: mapChallenge(response.data),
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to load challenge");
  }
}

export async function generateChallengeQuestions(
  challengeId: string,
): Promise<ChallengeApiResult<boolean>> {
  try {
    const response = await httpClient.post<unknown>({
      url: `/api/v1/challenges/${challengeId}/generate-questions`,
      data: {},
    });

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: !response.error?.message,
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to generate challenge questions");
  }
}

export async function createChallenge(
  payload: CreateChallengePayload,
): Promise<ChallengeApiResult<CreatedChallenge>> {
  try {
    const response = await httpClient.post<unknown>({
      url: "/api/v1/challenges",
      data: payload,
    });

    const data = mapCreatedChallenge(response.data);

    return {
      status: response.status,
      message: response.message,
      errorMessage: data ? undefined : getApiErrorMessage(response, "Failed to create challenge"),
      data,
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to create challenge");
  }
}

export async function updateChallenge(
  challengeId: string,
  payload: UpdateChallengePayload,
): Promise<ChallengeApiResult<CreatedChallenge>> {
  try {
    const response = await httpClient.put<unknown>({
      url: `/api/v1/challenges/${encodeURIComponent(challengeId)}`,
      data: { ...payload, id: challengeId, challengeId },
    });

    const data = mapCreatedChallenge(response.data) ?? {
      id: challengeId,
      stationId: "",
      title: payload.title,
    };

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data,
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to update challenge");
  }
}
