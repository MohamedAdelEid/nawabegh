import { QuizQuestionType, StudentQuizAttemptStatus } from "./short-quiz.enums";
import type {
  ShortQuizAttemptDto,
  ShortQuizCompletionDto,
  ShortQuizOptionDto,
  ShortQuizQuestionDto,
  ShortQuizStationIntroDto,
  ShortQuizStationResultDto,
} from "./short-quiz.types";

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord | null {
  return value !== null && typeof value === "object" ? (value as UnknownRecord) : null;
}

function toNumber(value: unknown, fallback = 0): number {
  if (value == null || value === "") return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toOptionalString(value: unknown): string {
  if (value == null) return "";
  return String(value).trim();
}

function toNullableString(value: unknown): string | null {
  const text = toOptionalString(value);
  return text || null;
}

function toBooleanOrNull(value: unknown): boolean | null {
  if (value == null) return null;
  if (typeof value === "boolean") return value;
  if (value === "true" || value === 1 || value === "1") return true;
  if (value === "false" || value === 0 || value === "0") return false;
  return null;
}

function mapOption(row: unknown): ShortQuizOptionDto | null {
  const record = asRecord(row);
  if (!record) return null;
  const id = toOptionalString(record.id);
  if (!id) return null;
  return {
    id,
    text: toOptionalString(record.text),
    imageUrl: toNullableString(record.imageUrl),
    order: toNumber(record.order),
  };
}

function mapQuestion(row: unknown): ShortQuizQuestionDto | null {
  const record = asRecord(row);
  if (!record) return null;
  const id = toOptionalString(record.id);
  if (!id) return null;

  const optionsRaw = Array.isArray(record.options) ? record.options : [];
  const options = optionsRaw
    .map(mapOption)
    .filter((option): option is ShortQuizOptionDto => option != null)
    .sort((a, b) => a.order - b.order);

  const typeValue = toNumber(record.type, QuizQuestionType.MultipleChoice);

  return {
    id,
    text: toOptionalString(record.text),
    imageUrl: toNullableString(record.imageUrl),
    type:
      typeValue === QuizQuestionType.TrueOrFalse
        ? QuizQuestionType.TrueOrFalse
        : QuizQuestionType.MultipleChoice,
    order: toNumber(record.order),
    points: toNumber(record.points),
    explanation: toNullableString(record.explanation),
    options,
    selectedOptionId: toNullableString(record.selectedOptionId),
    isCorrectSelected: toBooleanOrNull(record.isCorrectSelected),
    correctOptionId: toNullableString(record.correctOptionId),
  };
}

export function mapShortQuizStationIntro(row: unknown): ShortQuizStationIntroDto | null {
  const record = asRecord(row);
  if (!record) return null;
  const stationId = toOptionalString(record.id);
  if (!stationId) return null;

  const quiz = asRecord(record.quiz);
  const questionsRaw = Array.isArray(quiz?.questions) ? quiz.questions : [];
  const questions = questionsRaw
    .map(mapQuestion)
    .filter((question): question is ShortQuizQuestionDto => question != null);

  const totalPoints =
    questions.reduce((sum, question) => sum + question.points, 0) ||
    toNumber(quiz?.totalPoints, 100) ||
    100;

  return {
    stationId,
    learningPathId: toOptionalString(record.learningPathId),
    learningPathTitle: toOptionalString(record.learningPathTitle),
    name: toOptionalString(record.name),
    quizId: toOptionalString(quiz?.id),
    quizTitle: toOptionalString(quiz?.title) || toOptionalString(record.name),
    passScore: toNumber(quiz?.passScore, 60),
    maxAttempts: toNumber(quiz?.maxAttempts, 1),
    durationMinutes: toNumber(quiz?.durationMinutes, 30),
    questionCount: questions.length || toNumber(quiz?.questionCount),
    totalPoints,
    subjectName: toNullableString(record.subjectName) ?? toNullableString(record.subjectTitle),
  };
}

function mapAttemptPayload(row: unknown): ShortQuizAttemptDto | null {
  const record = asRecord(row);
  if (!record) return null;

  const attemptId =
    toOptionalString(record.attemptId) || toOptionalString(record.id);
  if (!attemptId) return null;

  const questionsRaw = Array.isArray(record.questions) ? record.questions : [];
  const questions = questionsRaw
    .map(mapQuestion)
    .filter((question): question is ShortQuizQuestionDto => question != null)
    .sort((a, b) => a.order - b.order);

  return {
    attemptId,
    stationId: toOptionalString(record.stationId),
    quizId: toOptionalString(record.quizId),
    quizTitle: toOptionalString(record.quizTitle),
    passScore: toNumber(record.passScore, 60),
    maxAttempts: toNumber(record.maxAttempts, 1),
    durationMinutes: toNumber(record.durationMinutes, 30),
    status: toNumber(record.status, StudentQuizAttemptStatus.Draft) as StudentQuizAttemptStatus,
    attemptNumber: toNumber(record.attemptNumber, 1),
    startedAt: toNullableString(record.startedAt),
    deadlineAt: toNullableString(record.deadlineAt),
    remainingSeconds: Math.max(0, toNumber(record.remainingSeconds)),
    totalQuestions: toNumber(record.totalQuestions, questions.length),
    answeredQuestionsCount: toNumber(
      record.answeredQuestionsCount,
      questions.filter((question) => Boolean(question.selectedOptionId)).length,
    ),
    resumeFromQuestionOrder: toNumber(record.resumeFromQuestionOrder, 1),
    scorePercent:
      record.scorePercent == null ? null : toNumber(record.scorePercent),
    passed: toBooleanOrNull(record.passed),
    questions,
  };
}

function mapCompletion(row: unknown): ShortQuizCompletionDto | null {
  const record = asRecord(row);
  if (!record) return null;
  return {
    pathCompleted: Boolean(record.pathCompleted),
    pathId: toNullableString(record.pathId),
    pathPointsEarned: toNumber(record.pathPointsEarned ?? record.pointsAwarded),
    totalPoints: toNumber(record.totalPoints),
    currentLevel: toNumber(record.currentLevel),
    pointsToNextLevel: toNumber(record.pointsToNextLevel),
  };
}

export function mapShortQuizStationResult(row: unknown): ShortQuizStationResultDto | null {
  const record = asRecord(row);
  if (!record) return null;

  // Envelope: { attempt, pointsReward, stationRank, completion }
  // Or flat attempt DTO (legacy / direct)
  const nestedAttempt = asRecord(record.attempt);
  const attempt = mapAttemptPayload(nestedAttempt ?? record);
  if (!attempt) return null;

  return {
    attempt,
    pointsReward: toNumber(
      record.pointsReward ??
        asRecord(record.completion)?.pathPointsEarned ??
        asRecord(record.completion)?.pointsAwarded,
    ),
    stationRank:
      record.stationRank == null ? null : toNumber(record.stationRank),
    stationRankTotal:
      record.stationRankTotal == null ? null : toNumber(record.stationRankTotal),
    completion: mapCompletion(record.completion),
  };
}

export function mapShortQuizAttempt(row: unknown): ShortQuizAttemptDto | null {
  const result = mapShortQuizStationResult(row);
  if (result) return result.attempt;
  return mapAttemptPayload(row);
}

export function formatRemainingTime(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function formatElapsedTime(startedAt: string | null, endedAt = new Date()): string {
  if (!startedAt) return "00:00";
  const start = new Date(startedAt).getTime();
  if (!Number.isFinite(start)) return "00:00";
  const elapsedSeconds = Math.max(0, Math.floor((endedAt.getTime() - start) / 1000));
  return formatRemainingTime(elapsedSeconds);
}

export function getArabicQuestionLabel(order: number): string {
  const labels = [
    "الأول",
    "الثاني",
    "الثالث",
    "الرابع",
    "الخامس",
    "السادس",
    "السابع",
    "الثامن",
    "التاسع",
    "العاشر",
    "الحادي عشر",
    "الثاني عشر",
    "الثالث عشر",
    "الرابع عشر",
    "الخامس عشر",
    "السادس عشر",
    "السابع عشر",
    "الثامن عشر",
    "التاسع عشر",
    "العشرون",
  ];
  return labels[order - 1] ?? String(order);
}

export function isTrueFalseQuestion(question: ShortQuizQuestionDto): boolean {
  if (question.type === QuizQuestionType.TrueOrFalse) return true;
  if (question.options.length !== 2) return false;
  const labels = question.options.map((option) => option.text.trim().toLowerCase());
  const trueLabels = new Set(["صح", "true", "نعم", "yes"]);
  const falseLabels = new Set(["خطأ", "false", "لا", "no"]);
  return (
    labels.some((label) => trueLabels.has(label)) &&
    labels.some((label) => falseLabels.has(label))
  );
}

export function isAttemptFinalized(attempt: ShortQuizAttemptDto): boolean {
  return (
    attempt.status === StudentQuizAttemptStatus.Submitted ||
    attempt.status === StudentQuizAttemptStatus.TimedOut ||
    attempt.passed != null
  );
}

export function countCorrectAnswers(attempt: ShortQuizAttemptDto): number {
  return attempt.questions.filter((question) => question.isCorrectSelected === true).length;
}

export function canRetryAttempt(attempt: ShortQuizAttemptDto): boolean {
  if (attempt.passed === true) return false;
  return attempt.attemptNumber < attempt.maxAttempts;
}

export function resolveInitialQuestionIndex(attempt: ShortQuizAttemptDto): number {
  if (!attempt.questions.length) return 0;
  const byOrder = attempt.questions.findIndex(
    (question) => question.order === attempt.resumeFromQuestionOrder,
  );
  if (byOrder >= 0) return byOrder;
  const firstUnanswered = attempt.questions.findIndex(
    (question) => !question.selectedOptionId,
  );
  return firstUnanswered >= 0 ? firstUnanswered : 0;
}
