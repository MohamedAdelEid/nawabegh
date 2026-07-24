import type { BackendStatus } from "@/shared/domain/types/api.types";
import { QuestionType } from "@/shared/domain/enums/question.enums";
import { httpClient } from "@/shared/infrastructure/http/httpClient";
import type {
  AdminOnboardingQuiz,
  AdminOnboardingQuizOption,
  AdminOnboardingQuizQuestion,
  AdminOnboardingQuizScope,
  UpdateAdminOnboardingQuizPayload,
} from "@/modules/admin/domain/types/adminOnboardingQuiz.types";

type UnknownRecord = Record<string, unknown>;

export type AdminOnboardingQuizApiResult<T> = {
  status: BackendStatus | string;
  message?: string;
  errorMessage?: string;
  data: T | null;
};

function asRecord(value: unknown): UnknownRecord | null {
  return value !== null && typeof value === "object" ? (value as UnknownRecord) : null;
}

function readString(record: UnknownRecord | null, keys: string[], fallback = ""): string {
  if (!record) return fallback;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string") return value;
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
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

function buildErrorResult<T>(error: unknown, fallback: string): AdminOnboardingQuizApiResult<T> {
  const message = error instanceof Error && error.message ? error.message : fallback;
  return {
    status: "Error",
    errorMessage: message,
    data: null,
  };
}

function mapOption(raw: unknown): AdminOnboardingQuizOption | null {
  const record = asRecord(raw);
  if (!record) return null;
  const text = readString(record, ["text"]);
  const order = readNumber(record, ["order"], 0);
  if (!text && order <= 0) return null;

  const id = readString(record, ["id"]);
  return {
    ...(id ? { id } : {}),
    order,
    text,
    isCorrect: readBoolean(record, ["isCorrect"], false),
  };
}

function mapQuestion(raw: unknown): AdminOnboardingQuizQuestion | null {
  const record = asRecord(raw);
  if (!record) return null;

  const text = readString(record, ["text"]);
  const order = readNumber(record, ["order"], 0);
  if (!text && order <= 0) return null;

  const optionsRaw = Array.isArray(record.options) ? record.options : [];
  const options = optionsRaw
    .map(mapOption)
    .filter((option): option is AdminOnboardingQuizOption => option != null)
    .sort((a, b) => a.order - b.order);

  const typeValue = readNumber(record, ["type"], QuestionType.MultipleChoice);
  const type =
    typeValue === QuestionType.TrueOrFalse
      ? QuestionType.TrueOrFalse
      : QuestionType.MultipleChoice;

  const id = readString(record, ["id"]);

  return {
    ...(id ? { id } : {}),
    order,
    text,
    type,
    points: readNumber(record, ["points"], 100),
    options,
  };
}

function mapQuiz(data: unknown): AdminOnboardingQuiz {
  const record = asRecord(data);
  const questionsRaw = Array.isArray(record?.questions) ? record.questions : [];
  const questions = questionsRaw
    .map(mapQuestion)
    .filter((question): question is AdminOnboardingQuizQuestion => question != null)
    .sort((a, b) => a.order - b.order);

  return {
    educationLevelId: readNumber(record, ["educationLevelId"], 0),
    educationLevelNameAr: readString(record, ["educationLevelNameAr"]),
    educationLevelNameEn: readString(record, ["educationLevelNameEn"]),
    gradeId: readNumber(record, ["gradeId"], 0),
    gradeNameAr: readString(record, ["gradeNameAr"]),
    gradeNameEn: readString(record, ["gradeNameEn"]),
    term: readNumber(record, ["term"], 1),
    questionCount: readNumber(record, ["questionCount"], questions.length),
    questions,
  };
}

export async function getAdminOnboardingQuiz(
  scope: AdminOnboardingQuizScope,
): Promise<AdminOnboardingQuizApiResult<AdminOnboardingQuiz>> {
  try {
    const response = await httpClient.get<unknown>({
      url: "/api/v1/admin/onboarding-quiz",
      params: {
        educationLevelId: scope.educationLevelId,
        gradeId: scope.gradeId,
        term: scope.term,
      },
    });

    if (!response.isSuccess || response.data == null) {
      return {
        status: response.status,
        message: response.message,
        errorMessage: response.error?.message ?? response.message,
        data: null,
      };
    }

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: mapQuiz(response.data),
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to load onboarding quiz");
  }
}

export async function updateAdminOnboardingQuiz(
  payload: UpdateAdminOnboardingQuizPayload,
): Promise<AdminOnboardingQuizApiResult<AdminOnboardingQuiz>> {
  try {
    const response = await httpClient.put<unknown>({
      url: "/api/v1/admin/onboarding-quiz",
      data: payload,
    });

    if (!response.isSuccess || response.data == null) {
      return {
        status: response.status,
        message: response.message,
        errorMessage: response.error?.message ?? response.message,
        data: null,
      };
    }

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: mapQuiz(response.data),
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to update onboarding quiz");
  }
}

export function toUpdateAdminOnboardingQuizPayload(
  quiz: AdminOnboardingQuiz,
): UpdateAdminOnboardingQuizPayload {
  return {
    educationLevelId: quiz.educationLevelId,
    gradeId: quiz.gradeId,
    term: quiz.term,
    questions: quiz.questions.map((question) => ({
      ...(question.id ? { id: question.id } : {}),
      order: question.order,
      text: question.text,
      type: question.type,
      points: question.points,
      options: question.options.map((option) => ({
        order: option.order,
        text: option.text,
        isCorrect: option.isCorrect,
      })),
    })),
  };
}
