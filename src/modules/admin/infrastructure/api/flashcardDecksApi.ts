import type { BackendStatus } from "@/shared/domain/types/api.types";
import { httpClient } from "@/shared/infrastructure/http/httpClient";

type UnknownRecord = Record<string, unknown>;

export type FlashcardDeckApiResult<T> = {
  status: BackendStatus | string;
  message?: string;
  errorMessage?: string;
  data: T | null;
};

export type CreateFlashcardDeckPayload = {
  stationId: string;
  title: string;
  averageDifficulty: number;
  aiCardCount: number;
  aiReviewSeconds: number;
  aiDifficulty: number;
  aiSourceFileUrl: string;
};

export type CreatedFlashcardDeck = {
  id: string;
  stationId: string;
  title: string;
};

export type FlashcardDeckCardAttachment = {
  id: string;
  fileUrl: string;
  fileName: string;
  fileExtension: string;
  fileSizeBytes: number;
  order: number;
};

export type FlashcardDeckCard = {
  id: string;
  front: string;
  back: string;
  imageUrl: string;
  attachments: FlashcardDeckCardAttachment[];
  order: number;
  reviewSeconds: number;
  difficulty: number;
};

export type FlashcardDeck = {
  id: string;
  stationId: string;
  stationType: number;
  title: string;
  averageDifficulty: number;
  aiCardCount: number;
  aiReviewSeconds: number;
  aiDifficulty: number;
  aiSourceFileUrl: string;
  flashcards: FlashcardDeckCard[];
};

export type FlashcardDeckCardAttachmentPayload = {
  fileUrl: string;
  fileName: string;
  fileExtension: string;
  fileSizeBytes: number;
};

export type CreateFlashcardDeckCardPayload = {
  deckId: string;
  front: string;
  back: string;
  imageUrl: string;
  attachments: FlashcardDeckCardAttachmentPayload[];
  reviewSeconds: number;
  difficulty: number;
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

function mapCreatedFlashcardDeck(data: unknown): CreatedFlashcardDeck | null {
  const record = asRecord(extractEnvelopeData(data));
  if (!record) return null;
  const id = readString(record, ["id", "deckId"], "").trim();
  if (!id) return null;

  return {
    id,
    stationId: readString(record, ["stationId"], ""),
    title: readString(record, ["title"], ""),
  };
}

function readArray(record: UnknownRecord | null, keys: string[]): unknown[] {
  if (!record) return [];
  for (const key of keys) {
    const value = record[key];
    if (Array.isArray(value)) return value;
  }
  return [];
}

function mapFlashcardDeckCardAttachment(data: unknown): FlashcardDeckCardAttachment | null {
  const record = asRecord(data);
  const id = readString(record, ["id"], "").trim();
  if (!record || !id) return null;

  return {
    id,
    fileUrl: readString(record, ["fileUrl"], ""),
    fileName: readString(record, ["fileName"], ""),
    fileExtension: readString(record, ["fileExtension"], ""),
    fileSizeBytes: readNumber(record, ["fileSizeBytes"]),
    order: readNumber(record, ["order"]),
  };
}

function mapFlashcardDeckCard(data: unknown): FlashcardDeckCard | null {
  const record = asRecord(data);
  const id = readString(record, ["id"], "").trim();
  if (!record || !id) return null;

  return {
    id,
    front: readString(record, ["front"], ""),
    back: readString(record, ["back"], ""),
    imageUrl: readString(record, ["imageUrl"], ""),
    attachments: readArray(record, ["attachments"])
      .map(mapFlashcardDeckCardAttachment)
      .filter((attachment): attachment is FlashcardDeckCardAttachment => Boolean(attachment)),
    order: readNumber(record, ["order"]),
    reviewSeconds: readNumber(record, ["reviewSeconds"]),
    difficulty: readNumber(record, ["difficulty"]),
  };
}

function mapFlashcardDeck(data: unknown): FlashcardDeck | null {
  const record = asRecord(extractEnvelopeData(data));
  const id = readString(record, ["id", "deckId"], "").trim();
  if (!record || !id) return null;

  return {
    id,
    stationId: readString(record, ["stationId"], ""),
    stationType: readNumber(record, ["stationType"]),
    title: readString(record, ["title"], ""),
    averageDifficulty: readNumber(record, ["averageDifficulty"]),
    aiCardCount: readNumber(record, ["aiCardCount"]),
    aiReviewSeconds: readNumber(record, ["aiReviewSeconds"]),
    aiDifficulty: readNumber(record, ["aiDifficulty"]),
    aiSourceFileUrl: readString(record, ["aiSourceFileUrl"], ""),
    flashcards: readArray(record, ["flashcards", "cards"])
      .map(mapFlashcardDeckCard)
      .filter((card): card is FlashcardDeckCard => Boolean(card)),
  };
}

function findFlashcardDeckId(value: unknown): string {
  const record = asRecord(value);
  if (!record) return "";

  const directId = readString(record, ["flashcardDeckId", "flashCardDeckId", "deckId"], "").trim();
  if (directId) return directId;

  for (const key of ["flashcardDeck", "flashCardDeck", "deck", "flashcardsDeck"]) {
    const nestedId = findFlashcardDeckId(record[key]);
    if (nestedId) return nestedId;
  }

  return "";
}

function buildErrorResult<T>(error: unknown, fallbackMessage: string): FlashcardDeckApiResult<T> {
  const axiosError = asRecord(error);
  const response = asRecord(axiosError?.response);
  const responseData = asRecord(response?.data);
  const httpStatusCode = response ? readNumber(response, ["status"], 0) : null;

  const detailMessage =
    readString(responseData, ["detail", "title", "message"], "") ||
    readString(asRecord(responseData?.error), ["message"], "") ||
    (typeof axiosError?.message === "string" ? axiosError.message : fallbackMessage);

  return {
    status: mapHttpStatus(httpStatusCode),
    errorMessage: detailMessage,
    data: null,
  };
}

export async function createFlashcardDeck(
  payload: CreateFlashcardDeckPayload,
): Promise<FlashcardDeckApiResult<CreatedFlashcardDeck>> {
  try {
    const response = await httpClient.post<unknown>({
      url: "/api/v1/flashcard-decks",
      data: payload,
    });

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: mapCreatedFlashcardDeck(response.data),
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to create flashcard deck");
  }
}

export async function getFlashcardDeckIdForStation(
  stationId: string,
): Promise<FlashcardDeckApiResult<string>> {
  try {
    const response = await httpClient.get<unknown>({
      url: `/api/v1/Station/${stationId}`,
    });
    const deckId = findFlashcardDeckId(extractEnvelopeData(response.data));

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: deckId || null,
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to load station flashcard deck");
  }
}

export async function getFlashcardDeck(
  deckId: string,
): Promise<FlashcardDeckApiResult<FlashcardDeck>> {
  try {
    const response = await httpClient.get<unknown>({
      url: `/api/v1/flashcard-decks/${deckId}`,
    });

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: mapFlashcardDeck(response.data),
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to load flashcard deck");
  }
}

export async function createFlashcardDeckCard(
  deckId: string,
  payload: CreateFlashcardDeckCardPayload,
): Promise<FlashcardDeckApiResult<string>> {
  try {
    const response = await httpClient.post<unknown>({
      url: `/api/v1/flashcard-decks/${deckId}/cards`,
      data: payload,
    });
    const data = extractEnvelopeData(response.data);

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: typeof data === "string" ? data : readString(asRecord(data), ["id", "cardId"], "") || null,
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to create flashcard card");
  }
}
