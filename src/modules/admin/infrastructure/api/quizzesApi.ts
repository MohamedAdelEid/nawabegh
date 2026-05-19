import type { BackendStatus } from "@/shared/domain/types/api.types";
import { httpClient } from "@/shared/infrastructure/http/httpClient";

type UnknownRecord = Record<string, unknown>;

export type QuizApiResult<T> = {
  status: BackendStatus | string;
  message?: string;
  errorMessage?: string;
  data: T | null;
};

export type QuizAttachmentPayload = {
  fileUrl: string;
  fileName: string;
  fileExtension: string;
  fileSizeBytes: number;
};

export type CreateQuizPayload = {
  stationId: string;
  title: string;
  passScore: number;
  maxAttempts: number;
  durationMinutes: number;
  difficulty: number;
  shuffleQuestions: boolean;
  aiSourceFileUrl: string;
  quizAttachments: QuizAttachmentPayload[];
};

export type CreatedQuiz = {
  id: string;
  stationId: string;
  title: string;
};

export type QuizAttachment = {
  fileUrl: string;
  fileName: string;
  fileExtension: string;
  fileSizeBytes: number;
};

export type QuizQuestionChoice = {
  id: string;
  text: string;
  imageUrl: string;
  isCorrect: boolean;
  order: number;
};

export type QuizQuestion = {
  id: string;
  text: string;
  imageUrl: string;
  type: number;
  order: number;
  points: number;
  difficulty: number;
  choices: QuizQuestionChoice[];
};

export type Quiz = {
  id: string;
  stationId: string;
  title: string;
  passScore: number;
  maxAttempts: number;
  durationMinutes: number;
  difficulty: number;
  shuffleQuestions: boolean;
  aiSourceFileUrl: string;
  quizAttachments: QuizAttachment[];
  questions: QuizQuestion[];
};

export type AddQuizQuestionChoicePayload = {
  text: string;
  imageUrl: string;
  isCorrect: boolean;
  order: number;
};

export type AddQuizQuestionPayload = {
  quizId: string;
  text: string;
  imageUrl: string;
  type: number;
  points: number;
  difficulty: number;
  choices: AddQuizQuestionChoicePayload[];
};

export type UpdateQuizQuestionPayload = {
  questionId: string;
  text: string;
  imageUrl: string;
  type: number;
  points: number;
  difficulty: number;
  choices: AddQuizQuestionChoicePayload[];
};

export type UpdateQuizSettingsPayload = {
  quizId: string;
  title: string;
  passScore: number;
  maxAttempts: number;
  durationMinutes: number;
  difficulty: number;
  shuffleQuestions: boolean;
  aiSourceFileUrl: string;
  quizAttachments?: QuizAttachmentPayload[];
};

const STATION_QUIZ_STORAGE_KEY_PREFIX = "admin.quiz.station.";

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

function extractEnvelopeData(data: unknown): unknown {
  const record = asRecord(data);
  return record?.data ?? data;
}

function mapQuizAttachment(data: unknown): QuizAttachment | null {
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

function mapCreatedQuiz(data: unknown): CreatedQuiz | null {
  const record = asRecord(extractEnvelopeData(data));
  if (!record) return null;
  const id = readString(record, ["id", "quizId"], "").trim();
  if (!id) return null;

  return {
    id,
    stationId: readString(record, ["stationId"], ""),
    title: readString(record, ["title"], ""),
  };
}

function mapQuizQuestionChoice(data: unknown): QuizQuestionChoice | null {
  const record = asRecord(data);
  if (!record) return null;
  const id = readString(record, ["id"], "").trim();
  if (!id) return null;

  return {
    id,
    text: readString(record, ["text"], ""),
    imageUrl: readString(record, ["imageUrl"], ""),
    isCorrect: readBoolean(record, ["isCorrect"]),
    order: readNumber(record, ["order"]),
  };
}

function mapQuizQuestion(data: unknown): QuizQuestion | null {
  const record = asRecord(data);
  if (!record) return null;
  const id = readString(record, ["id", "questionId"], "").trim();
  if (!id) return null;

  return {
    id,
    text: readString(record, ["text"], ""),
    imageUrl: readString(record, ["imageUrl"], ""),
    type: readNumber(record, ["type"]),
    order: readNumber(record, ["order"]),
    points: readNumber(record, ["points"]),
    difficulty: readNumber(record, ["difficulty"]),
    choices: readArray(record, ["choices", "options"])
      .map(mapQuizQuestionChoice)
      .filter((choice): choice is QuizQuestionChoice => Boolean(choice)),
  };
}

function mapQuiz(data: unknown): Quiz | null {
  const record = asRecord(extractEnvelopeData(data));
  if (!record) return null;
  const id = readString(record, ["id", "quizId"], "").trim();
  if (!id) return null;

  return {
    id,
    stationId: readString(record, ["stationId"], ""),
    title: readString(record, ["title"], ""),
    passScore: readNumber(record, ["passScore", "passingGradePct"]),
    maxAttempts: readNumber(record, ["maxAttempts"]),
    durationMinutes: readNumber(record, ["durationMinutes", "durationMin"]),
    difficulty: readNumber(record, ["difficulty"]),
    shuffleQuestions: readBoolean(record, ["shuffleQuestions", "randomOrder"], true),
    aiSourceFileUrl: readString(record, ["aiSourceFileUrl"], ""),
    quizAttachments: readArray(record, ["quizAttachments", "attachments"])
      .map(mapQuizAttachment)
      .filter((attachment): attachment is QuizAttachment => Boolean(attachment)),
    questions: readArray(record, ["questions"])
      .map(mapQuizQuestion)
      .filter((question): question is QuizQuestion => Boolean(question)),
  };
}

export function getStoredQuizId(stationId: string) {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(`${STATION_QUIZ_STORAGE_KEY_PREFIX}${stationId}`);
}

export function storeQuizId(stationId: string, quizId: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(`${STATION_QUIZ_STORAGE_KEY_PREFIX}${stationId}`, quizId);
}

export function clearStoredQuizId(stationId: string) {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(`${STATION_QUIZ_STORAGE_KEY_PREFIX}${stationId}`);
}

export async function resolveQuizIdForStation(stationId: string): Promise<string | null> {
  const stored = getStoredQuizId(stationId);
  if (stored) return stored;

  const stationQuizResult = await getQuizIdForStation(stationId);
  const quizId = stationQuizResult.data;
  if (quizId) {
    storeQuizId(stationId, quizId);
  }
  return quizId;
}

function findQuizId(value: unknown): string {
  const record = asRecord(value);
  if (!record) return "";

  const directId = readString(record, ["quizId"], "").trim();
  if (directId) return directId;

  const nestedQuiz = asRecord(record.quiz);
  if (nestedQuiz) {
    const nestedId = readString(nestedQuiz, ["id", "quizId"], "").trim();
    if (nestedId) return nestedId;
  }

  for (const key of ["quiz", "stationQuiz", "shortQuiz"]) {
    const nestedId = findQuizId(record[key]);
    if (nestedId) return nestedId;
  }

  return "";
}

function buildErrorResult<T>(error: unknown, fallbackMessage: string): QuizApiResult<T> {
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

export async function createQuiz(payload: CreateQuizPayload): Promise<QuizApiResult<CreatedQuiz>> {
  try {
    const response = await httpClient.post<unknown>({
      url: "/api/v1/quizzes",
      data: payload,
    });

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: mapCreatedQuiz(response.data),
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to create quiz");
  }
}

export async function getQuizIdForStation(stationId: string): Promise<QuizApiResult<string>> {
  try {
    const response = await httpClient.get<unknown>({
      url: `/api/v1/Station/${stationId}`,
    });
    const quizId = findQuizId(extractEnvelopeData(response.data));

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: quizId || null,
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to load station quiz");
  }
}

export async function getQuiz(quizId: string): Promise<QuizApiResult<Quiz>> {
  try {
    const response = await httpClient.get<unknown>({
      url: `/api/v1/quizzes/${quizId}`,
    });

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: mapQuiz(response.data),
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to load quiz");
  }
}

export async function generateQuizQuestions(quizId: string): Promise<QuizApiResult<boolean>> {
  try {
    const response = await httpClient.post<unknown>({
      url: `/api/v1/quizzes/${quizId}/generate-questions`,
      data: {},
    });

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: !response.error?.message,
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to generate quiz questions");
  }
}

export async function updateQuizSettings(
  quizId: string,
  payload: UpdateQuizSettingsPayload,
): Promise<QuizApiResult<boolean>> {
  try {
    const response = await httpClient.put<unknown>({
      url: `/api/v1/quizzes/${quizId}/settings`,
      data: payload,
    });

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: !response.error?.message,
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to update quiz settings");
  }
}

export async function addQuizQuestion(
  quizId: string,
  payload: AddQuizQuestionPayload,
): Promise<QuizApiResult<string>> {
  try {
    const response = await httpClient.post<unknown>({
      url: `/api/v1/quizzes/${quizId}/questions`,
      data: payload,
    });
    const envelope = asRecord(response.data);
    const data = extractEnvelopeData(response.data);
    const questionId =
      typeof data === "string"
        ? data
        : readString(asRecord(data), ["id", "questionId"], "").trim() ||
          readString(envelope, ["data"], "").trim();

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: questionId || null,
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to add quiz question");
  }
}

export async function updateQuizQuestion(
  questionId: string,
  payload: UpdateQuizQuestionPayload,
): Promise<QuizApiResult<boolean>> {
  try {
    const response = await httpClient.put<unknown>({
      url: `/api/v1/quizzes/questions/${questionId}`,
      data: payload,
    });

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: !response.error?.message,
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to update quiz question");
  }
}

export async function deleteQuizQuestion(questionId: string): Promise<QuizApiResult<boolean>> {
  try {
    const response = await httpClient.delete<unknown>({
      url: `/api/v1/quizzes/questions/${questionId}`,
    });

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: !response.error?.message,
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to delete quiz question");
  }
}
