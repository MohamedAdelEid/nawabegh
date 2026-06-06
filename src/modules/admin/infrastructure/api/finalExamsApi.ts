import type { BackendStatus } from "@/shared/domain/types/api.types";
import { httpClient } from "@/shared/infrastructure/http/httpClient";
import type {
  CreatedFinalExam,
  ExamDashboardStatus,
  ExamsDashboardData,
  FinalExamAttachment,
  FinalExamCreatePayload,
  FinalExamDetail,
  FinalExamQuestion,
  FinalExamQuestionChoice,
  LatestExamRow,
  QuestionGenerationStatus,
} from "@/modules/admin/domain/types/examsManagement.types";

export const FINAL_EXAM_UPLOAD_FOLDER = "quizquestions";

const DASHBOARD_BASE = "/api/v1/admin/exams/dashboard";

/** Question generation can take ~1 minute; allow extra headroom beyond the default 15s client timeout. */
export const GENERATE_QUESTIONS_TIMEOUT_MS = 120_000;

export type FinalExamsApiResult<T> = {
  status: BackendStatus | string;
  message?: string;
  errorMessage?: string;
  data: T | null;
};

export type GetExamsDashboardParams = {
  search?: string;
  courseId?: string;
  quizType?: number;
  status?: number;
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

function buildErrorResult<T>(error: unknown, fallbackMessage: string): FinalExamsApiResult<T> {
  const axiosError = asRecord(error);
  const response = asRecord(axiosError?.response);
  const responseData = asRecord(response?.data);
  const statusCode = readNumber(response, ["status"], NaN);
  const message =
    readString(responseData, ["error.message", "message"], "") ||
    readString(asRecord(responseData?.error), ["message"], "") ||
    fallbackMessage;

  return {
    status: Number.isFinite(statusCode) ? mapHttpStatus(statusCode) : "Error",
    errorMessage: message,
    data: null,
  };
}

function mapLatestExamRow(data: unknown): LatestExamRow | null {
  const record = asRecord(data);
  if (!record) return null;
  const quizId = readString(record, ["quizId"], "").trim();
  const courseId = readString(record, ["courseId"], "").trim();
  if (!quizId || !courseId) return null;

  const status = readString(record, ["status"], "Draft") as ExamDashboardStatus;

  return {
    quizId,
    examName: readString(record, ["examName"], ""),
    quizType: readNumber(record, ["quizType"]),
    courseId,
    courseTitle: readString(record, ["courseTitle"], ""),
    questionsCount: readNumber(record, ["questionsCount"]),
    participantsCount: readNumber(record, ["participantsCount"]),
    status,
    generationStatus: readNumber(record, ["generationStatus"]) as QuestionGenerationStatus,
    createdAt: readString(record, ["createdAt"], ""),
  };
}

function mapDashboardData(data: unknown): ExamsDashboardData | null {
  const record = asRecord(extractEnvelopeData(data));
  if (!record) return null;

  const summaryRecord = asRecord(record.summary);
  const successRateRecord = asRecord(record.successRate);
  const paginationRecord = asRecord(record.pagination);

  if (!summaryRecord || !successRateRecord || !paginationRecord) return null;

  return {
    summary: {
      totalExams: readNumber(summaryRecord, ["totalExams"]),
      totalQuestions: readNumber(summaryRecord, ["totalQuestions"]),
      passedStudents: readNumber(summaryRecord, ["passedStudents"]),
      issuedCertificates: readNumber(summaryRecord, ["issuedCertificates"]),
    },
    successRate: {
      passedPercentage: readNumber(successRateRecord, ["passedPercentage"]),
      failedPercentage: readNumber(successRateRecord, ["failedPercentage"]),
      notAttemptedPercentage: readNumber(successRateRecord, ["notAttemptedPercentage"]),
      passedCount: readNumber(successRateRecord, ["passedCount"]),
      failedCount: readNumber(successRateRecord, ["failedCount"]),
      notAttemptedCount: readNumber(successRateRecord, ["notAttemptedCount"]),
    },
    latestExams: readArray(record, ["latestExams"])
      .map(mapLatestExamRow)
      .filter((row): row is LatestExamRow => row !== null),
    pagination: {
      currentPage: readNumber(paginationRecord, ["currentPage"], 1),
      pageSize: readNumber(paginationRecord, ["pageSize"], 10),
      totalCount: readNumber(paginationRecord, ["totalCount"]),
      totalPages: readNumber(paginationRecord, ["totalPages"], 1),
      hasPrevious: readBoolean(paginationRecord, ["hasPrevious"]),
      hasNext: readBoolean(paginationRecord, ["hasNext"]),
    },
  };
}

function mapFinalExamAttachment(data: unknown): FinalExamAttachment | null {
  const record = asRecord(data);
  if (!record) return null;
  const fileUrl = readString(record, ["fileUrl"], "").trim();
  if (!fileUrl) return null;

  return {
    id: readString(record, ["id"], "") || undefined,
    fileUrl,
    fileName: readString(record, ["fileName"], ""),
    fileExtension: readString(record, ["fileExtension"], ""),
    fileSizeBytes: readNumber(record, ["fileSizeBytes"]),
    order: readNumber(record, ["order"]),
  };
}

function mapFinalExamQuestionChoice(data: unknown): FinalExamQuestionChoice | null {
  const record = asRecord(data);
  if (!record) return null;
  const id = readString(record, ["id"], "").trim();
  if (!id) return null;

  return {
    id,
    text: readString(record, ["text"], ""),
    imageUrl: readString(record, ["imageUrl"], "") || null,
    isCorrect: readBoolean(record, ["isCorrect"]),
    order: readNumber(record, ["order"]),
  };
}

function mapFinalExamQuestion(data: unknown): FinalExamQuestion | null {
  const record = asRecord(data);
  if (!record) return null;
  const id = readString(record, ["id"], "").trim();
  if (!id) return null;

  return {
    id,
    text: readString(record, ["text"], ""),
    imageUrl: readString(record, ["imageUrl"], "") || null,
    type: readNumber(record, ["type"]),
    order: readNumber(record, ["order"]),
    points: readNumber(record, ["points"]),
    difficulty: readNumber(record, ["difficulty"]),
    choices: readArray(record, ["choices"])
      .map(mapFinalExamQuestionChoice)
      .filter((choice): choice is FinalExamQuestionChoice => choice !== null),
  };
}

function mapFinalExamDetail(data: unknown): FinalExamDetail | null {
  const record = asRecord(extractEnvelopeData(data));
  if (!record) return null;
  const id = readString(record, ["id"], "").trim();
  const courseId = readString(record, ["courseId"], "").trim();
  if (!id || !courseId) return null;

  return {
    id,
    type: readNumber(record, ["type"]),
    courseId,
    title: readString(record, ["title"], ""),
    passScore: readNumber(record, ["passScore"]),
    maxAttempts: readNumber(record, ["maxAttempts"], 1),
    durationMinutes: readNumber(record, ["durationMinutes"]),
    questionCount: readNumber(record, ["questionCount"]),
    questionGenerationStatus: readNumber(
      record,
      ["questionGenerationStatus"],
    ) as QuestionGenerationStatus,
    difficulty: readNumber(record, ["difficulty"]),
    shuffleQuestions: readBoolean(record, ["shuffleQuestions"]),
    aiSourceFileUrl: readString(record, ["aiSourceFileUrl"], "") || null,
    quizAttachments: readArray(record, ["quizAttachments"])
      .map(mapFinalExamAttachment)
      .filter((item): item is FinalExamAttachment => item !== null),
    questions: readArray(record, ["questions"])
      .map(mapFinalExamQuestion)
      .filter((item): item is FinalExamQuestion => item !== null),
  };
}

function mapCreatedFinalExam(data: unknown): CreatedFinalExam | null {
  const record = asRecord(extractEnvelopeData(data));
  if (!record) return null;
  const id = readString(record, ["id"], "").trim();
  const courseId = readString(record, ["courseId"], "").trim();
  if (!id || !courseId) return null;

  return {
    id,
    courseId,
    title: readString(record, ["title"], ""),
  };
}

export async function getExamsDashboard(
  params: GetExamsDashboardParams,
): Promise<FinalExamsApiResult<ExamsDashboardData>> {
  try {
    const response = await httpClient.get<unknown>({
      url: DASHBOARD_BASE,
      params: {
        quizType: params.quizType ?? 1,
        pageNumber: params.pageNumber,
        pageSize: params.pageSize,
        ...(params.search?.trim() ? { search: params.search.trim() } : {}),
        ...(params.courseId?.trim() ? { courseId: params.courseId.trim() } : {}),
        ...(params.status !== undefined && params.status !== null && !Number.isNaN(params.status)
          ? { status: params.status }
          : {}),
      },
    });

    const mapped = mapDashboardData(response.data);
    if (!mapped) {
      return {
        status: response.status,
        message: response.message,
        errorMessage: response.error?.message ?? "Invalid dashboard response",
        data: null,
      };
    }

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: mapped,
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to load exams dashboard");
  }
}

export async function getFinalExam(
  courseId: string,
): Promise<FinalExamsApiResult<FinalExamDetail>> {
  try {
    const response = await httpClient.get<unknown>({
      url: `/api/v1/courses/${encodeURIComponent(courseId)}/final-exam`,
    });

    const mapped = mapFinalExamDetail(response.data);
    if (!mapped) {
      return {
        status: response.status,
        message: response.message,
        errorMessage: response.error?.message ?? "Final exam was not found",
        data: null,
      };
    }

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: mapped,
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to load final exam");
  }
}

export async function createFinalExam(
  courseId: string,
  payload: FinalExamCreatePayload,
): Promise<FinalExamsApiResult<CreatedFinalExam>> {
  console.log(JSON.stringify(payload, null, 2));
  try {
    const response = await httpClient.post<unknown>({
      url: `/api/v1/courses/${encodeURIComponent(courseId)}/final-exam`,
      data: payload,
    });

    const mapped = mapCreatedFinalExam(response.data);
    if (!mapped) {
      return {
        status: response.status,
        message: response.message,
        errorMessage: response.error?.message ?? "Failed to create final exam",
        data: null,
      };
    }

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: mapped,
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to create final exam");
  }
}

export async function updateFinalExamSettings(
  courseId: string,
  payload: FinalExamCreatePayload,
): Promise<FinalExamsApiResult<null>> {
  try {
    const response = await httpClient.put<unknown>({
      url: `/api/v1/courses/${encodeURIComponent(courseId)}/final-exam/settings`,
      data: payload,
    });

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: null,
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to update final exam settings");
  }
}

export async function generateFinalExamQuestions(
  quizId: string,
): Promise<FinalExamsApiResult<null>> {
  try {
    const response = await httpClient.post<unknown>({
      url: `/api/v1/final-exams/${encodeURIComponent(quizId)}/generate-questions`,
      data: {},
      timeout: GENERATE_QUESTIONS_TIMEOUT_MS,
    });

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: null,
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to generate questions");
  }
}

export async function deleteFinalExam(
  courseId: string,
): Promise<FinalExamsApiResult<null>> {
  try {
    const response = await httpClient.delete<unknown>({
      url: `/api/v1/courses/${encodeURIComponent(courseId)}/final-exam`,
    });

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: null,
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to delete final exam");
  }
}
