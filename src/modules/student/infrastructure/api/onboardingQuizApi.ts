import type { BackendApiResponse } from "@/shared/domain/types/api.types";
import { httpClient } from "@/shared/infrastructure/http/httpClient";
import type {
  OnboardingQuizAnswer,
  OnboardingQuizOption,
  OnboardingQuizQuestion,
  OnboardingQuizResponse,
  StudentProfileSummary,
  SubmitOnboardingQuizResponse,
} from "../../domain/types/onboarding-quiz.types";

type UnknownRecord = Record<string, unknown>;

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

function readNullableNumber(record: UnknownRecord | null, keys: string[]): number | null {
  if (!record) return null;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (value === null) return null;
  }
  return null;
}

function mapOption(raw: unknown): OnboardingQuizOption | null {
  const record = asRecord(raw);
  if (!record) return null;
  const id = readString(record, ["id"]);
  if (!id) return null;
  return {
    id,
    order: readNumber(record, ["order"], 0),
    text: readString(record, ["text"]),
  };
}

function mapQuestion(raw: unknown): OnboardingQuizQuestion | null {
  const record = asRecord(raw);
  if (!record) return null;
  const id = readString(record, ["id"]);
  if (!id) return null;
  const optionsRaw = Array.isArray(record.options) ? record.options : [];
  const options = optionsRaw
    .map(mapOption)
    .filter((option): option is OnboardingQuizOption => option != null)
    .sort((a, b) => a.order - b.order);

  return {
    id,
    order: readNumber(record, ["order"], 0),
    text: readString(record, ["text"]),
    options,
  };
}

function mapOnboardingQuizResponse(data: unknown): OnboardingQuizResponse {
  const record = asRecord(data);
  const questionsRaw = Array.isArray(record?.questions) ? record.questions : [];
  const questions = questionsRaw
    .map(mapQuestion)
    .filter((question): question is OnboardingQuizQuestion => question != null)
    .sort((a, b) => a.order - b.order);

  return {
    isCompleted: readBoolean(record, ["isCompleted"], false),
    educationLevelId: readNumber(record, ["educationLevelId"], 0),
    gradeId: readNumber(record, ["gradeId"], 0),
    term: readNumber(record, ["term"], 1),
    correctCount: readNullableNumber(record, ["correctCount"]),
    pointsEarned: readNullableNumber(record, ["pointsEarned"]),
    scorePercent: readNullableNumber(record, ["scorePercent"]),
    questions,
  };
}

function mapSubmitResponse(data: unknown): SubmitOnboardingQuizResponse {
  const record = asRecord(data);
  const starterCourseId = readString(record, ["starterCourseId"], "");
  return {
    correctCount: readNumber(record, ["correctCount"], 0),
    totalQuestions: readNumber(record, ["totalQuestions"], 5),
    scorePercent: readNumber(record, ["scorePercent"], 0),
    pointsEarned: readNumber(record, ["pointsEarned"], 0),
    totalPoints: readNumber(record, ["totalPoints"], 0),
    starterCourseId: starterCourseId || null,
    enrollmentSuccess: readBoolean(record, ["enrollmentSuccess"], false),
  };
}

function getErrorMessage(response: BackendApiResponse<unknown>): string {
  return response.error?.message ?? response.message ?? "";
}

export async function fetchOnboardingQuiz(): Promise<OnboardingQuizResponse> {
  const response = await httpClient.get<unknown>({
    url: "/api/v1/student/onboarding-quiz",
  });

  if (!response.isSuccess || response.data == null) {
    throw new Error(getErrorMessage(response) || "Failed to load onboarding quiz");
  }

  return mapOnboardingQuizResponse(response.data);
}

export async function submitOnboardingQuiz(
  answers: OnboardingQuizAnswer[],
): Promise<SubmitOnboardingQuizResponse> {
  const response = await httpClient.post<unknown>({
    url: "/api/v1/student/onboarding-quiz/submit",
    data: { answers },
  });

  if (!response.isSuccess || response.data == null) {
    throw new Error(getErrorMessage(response) || "Failed to submit onboarding quiz");
  }

  return mapSubmitResponse(response.data);
}

export async function fetchStudentProfileSummary(userId: string): Promise<StudentProfileSummary> {
  const response = await httpClient.get<unknown>({
    url: `/api/v1/UserManagement/student/${encodeURIComponent(userId)}`,
  });

  if (!response.isSuccess || response.data == null) {
    throw new Error(getErrorMessage(response) || "Failed to load student profile");
  }

  const record = asRecord(response.data);
  return {
    onboardingQuizCompleted: readBoolean(record, ["onboardingQuizCompleted"], false),
  };
}
