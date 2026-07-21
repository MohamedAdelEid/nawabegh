import {
  ChallengeSessionStatus,
  ChallengeStudentStatus,
  ChallengeType,
  QuestionGenerationStatus,
} from "./challenge-station.enums";
import type {
  AchievementAuditItemDto,
  ChallengeAnswerResultDto,
  ChallengeMatchFoundEvent,
  ChallengeOverviewDto,
  ChallengeQuestionDto,
  ChallengeQuestionOptionDto,
  ChallengeQuestionsDto,
  ChallengeQueueResultDto,
  ChallengeSessionDto,
  ChallengeSessionEndedEvent,
  ChallengeSessionParticipantDto,
  ChallengeStationIntroDto,
  StudentPointsSummaryDto,
  StudentPointsTransactionDto,
} from "./challenge-station.types";

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as UnknownRecord)
    : null;
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

function readNullableNumber(record: UnknownRecord | null, keys: string[]): number | null {
  if (!record) return null;
  for (const key of keys) {
    const value = record[key];
    if (value == null) return null;
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() !== "" && !Number.isNaN(Number(value))) {
      return Number(value);
    }
  }
  return null;
}

function readNullableString(record: UnknownRecord | null, keys: string[]): string | null {
  if (!record) return null;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string") {
      const trimmed = value.trim();
      return trimmed || null;
    }
    if (value === null) return null;
  }
  return null;
}

function readBoolean(record: UnknownRecord | null, keys: string[], fallback = false): boolean {
  if (!record) return fallback;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "boolean") return value;
    if (value === 1 || value === "1" || value === "true") return true;
    if (value === 0 || value === "0" || value === "false") return false;
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

function toChallengeType(value: number): ChallengeType {
  if (value === ChallengeType.RankedMatch) return ChallengeType.RankedMatch;
  if (value === ChallengeType.Practice) return ChallengeType.Practice;
  return ChallengeType.QuickChallenge;
}

export function mapChallengeStationIntroDto(raw: unknown): ChallengeStationIntroDto | null {
  const record = asRecord(raw);
  if (!record) return null;

  const stationId = readString(record, ["id", "stationId"]).trim();
  if (!stationId) return null;

  const challengeRecord = asRecord(record.challenge) ?? asRecord(record.Challenge);
  const challengeId =
    readString(challengeRecord, ["id", "challengeId"]).trim() ||
    readString(record, ["challengeId"]).trim();

  return {
    stationId,
    challengeId,
    learningPathId: readString(record, ["learningPathId"]),
    learningPathTitle: readString(record, ["learningPathTitle"]),
    stationName: readString(record, ["name", "title", "stationName"]),
    courseTitle: readNullableString(record, ["courseTitle", "courseName"]),
    pointsReward: readNullableNumber(challengeRecord ?? record, ["pointsReward"]),
  };
}

export function mapChallengeOverviewDto(raw: unknown): ChallengeOverviewDto | null {
  const record = asRecord(raw);
  if (!record) return null;
  const challengeId = readString(record, ["challengeId", "id"]).trim();
  if (!challengeId) return null;

  return {
    challengeId,
    stationId: readString(record, ["stationId"]),
    title: readString(record, ["title", "name"]),
    type: toChallengeType(readNumber(record, ["type"])),
    durationMinutes: readNumber(record, ["durationMinutes"], 1),
    questionCount: readNumber(record, ["questionCount"]),
    challengeDate: readNullableString(record, ["challengeDate"]),
    startTime: readNullableString(record, ["startTime"]),
    endTime: readNullableString(record, ["endTime"]),
    timeZoneId: readNullableString(record, ["timeZoneId"]),
    questionGenerationStatus: readNumber(
      record,
      ["questionGenerationStatus"],
      QuestionGenerationStatus.Completed,
    ) as QuestionGenerationStatus,
    stationProgressStatus: readNumber(record, ["stationProgressStatus"]),
    status: readNumber(record, ["status"]) as ChallengeStudentStatus,
    scheduleRequired: readBoolean(record, ["scheduleRequired"]),
    isMatchmakingOpen: readBoolean(record, ["isMatchmakingOpen"], true),
    canEnter: readBoolean(record, ["canEnter"]),
    canReplay: readBoolean(record, ["canReplay"]),
    canTrainAgain: readBoolean(record, ["canTrainAgain"]),
    blockReason: readNullableString(record, ["blockReason"]),
    activeSessionId: readNullableString(record, ["activeSessionId"]),
    pointsReward: readNumber(record, ["pointsReward"]),
    hasReceivedReward: readBoolean(record, ["hasReceivedReward"]),
  };
}

export function mapChallengeQueueResultDto(raw: unknown): ChallengeQueueResultDto {
  const record = asRecord(raw);
  return {
    matched: readBoolean(record, ["matched"]),
    sessionId: readNullableString(record, ["sessionId"]),
    opponentStudentId: readNullableString(record, ["opponentStudentId"]),
    opponentDisplayName: readNullableString(record, ["opponentDisplayName"]),
    isRankedFallback: readBoolean(record, ["isRankedFallback"]),
    matchQuality: readNullableString(record, ["matchQuality"]),
  };
}

export function mapChallengeMatchFoundEvent(raw: unknown): ChallengeMatchFoundEvent | null {
  const record = asRecord(raw);
  if (!record) return null;
  const sessionId = readString(record, ["sessionId"]).trim();
  if (!sessionId) return null;
  return {
    sessionId,
    opponentStudentId: readNullableString(record, ["opponentStudentId"]),
    opponentDisplayName: readNullableString(record, ["opponentDisplayName"]),
    matchQuality: readNullableString(record, ["matchQuality"]),
  };
}

function mapParticipant(row: unknown): ChallengeSessionParticipantDto | null {
  const record = asRecord(row);
  if (!record) return null;
  const studentId = readString(record, ["studentId", "userId", "id"]).trim();
  if (!studentId) return null;
  return {
    studentId,
    displayName: readNullableString(record, ["displayName", "fullName", "name"]),
    totalScore: readNumber(record, ["totalScore", "score", "points"]),
    correctAnswers: readNumber(record, ["correctAnswers"]),
    isConnected: readBoolean(record, ["isConnected"], true),
  };
}

export function mapChallengeSessionDto(raw: unknown): ChallengeSessionDto | null {
  const record = asRecord(raw);
  if (!record) return null;
  const sessionId = readString(record, ["sessionId", "id"]).trim();
  if (!sessionId) return null;

  const participants = readArray(record, ["participants"])
    .map(mapParticipant)
    .filter((item): item is ChallengeSessionParticipantDto => item != null);

  return {
    sessionId,
    status: readNumber(record, ["status"], ChallengeSessionStatus.Waiting) as ChallengeSessionStatus,
    winnerId: readNullableString(record, ["winnerId"]),
    startedAt: readNullableString(record, ["startedAt"]),
    durationMinutes: readNumber(record, ["durationMinutes"]),
    questionCount: readNumber(record, ["questionCount"]),
    participants,
  };
}

function mapOption(row: unknown): ChallengeQuestionOptionDto | null {
  const record = asRecord(row);
  if (!record) return null;
  const optionId = readString(record, ["optionId", "id"]).trim();
  if (!optionId) return null;
  return {
    optionId,
    text: readString(record, ["text"]),
    order: readNumber(record, ["order"]),
  };
}

function mapQuestion(row: unknown): ChallengeQuestionDto | null {
  const record = asRecord(row);
  if (!record) return null;
  const questionId = readString(record, ["questionId", "id"]).trim();
  if (!questionId) return null;
  const options = readArray(record, ["options"])
    .map(mapOption)
    .filter((item): item is ChallengeQuestionOptionDto => item != null)
    .sort((a, b) => a.order - b.order);

  return {
    questionId,
    text: readString(record, ["text"]),
    category: readNullableString(record, ["category"]),
    points: readNumber(record, ["points"], 100),
    order: readNumber(record, ["order"]),
    options,
  };
}

export function mapChallengeQuestionsDto(raw: unknown): ChallengeQuestionsDto {
  const record = asRecord(raw);
  const list = Array.isArray(raw)
    ? raw
    : readArray(record, ["questions", "items"]);
  return {
    questions: list
      .map(mapQuestion)
      .filter((item): item is ChallengeQuestionDto => item != null)
      .sort((a, b) => a.order - b.order),
  };
}

export function mapChallengeAnswerResultDto(raw: unknown): ChallengeAnswerResultDto {
  const record = asRecord(raw);
  return {
    pointsEarned: readNumber(record, ["pointsEarned"]),
    totalScore: readNumber(record, ["totalScore"]),
    allQuestionsAnswered: readBoolean(record, ["allQuestionsAnswered"]),
  };
}

export function mapChallengeSessionEndedEvent(
  raw: unknown,
): ChallengeSessionEndedEvent | null {
  const record = asRecord(raw);
  if (!record) return null;
  return {
    winnerId: readNullableString(record, ["winnerId"]),
    endReason: readNullableString(record, ["endReason"]),
    participants: readArray(record, ["participants"])
      .map(mapParticipant)
      .filter((item): item is ChallengeSessionParticipantDto => item != null),
  };
}

function mapTransaction(row: unknown): StudentPointsTransactionDto | null {
  const record = asRecord(row);
  if (!record) return null;
  return {
    amount: readNumber(record, ["amount"]),
    reason: readString(record, ["reason"]),
    referenceType: readNullableString(record, ["referenceType"]),
    createdAt: readNullableString(record, ["createdAt"]),
  };
}

export function mapStudentPointsSummaryDto(raw: unknown): StudentPointsSummaryDto {
  const record = asRecord(raw);
  return {
    totalPoints: readNumber(record, ["totalPoints"]),
    currentLevel: readNumber(record, ["currentLevel"], 1),
    pointsToNextLevel: readNumber(record, ["pointsToNextLevel"]),
    recentTransactions: readArray(record, ["recentTransactions"])
      .map(mapTransaction)
      .filter((item): item is StudentPointsTransactionDto => item != null),
  };
}

export function mapAchievementAuditItemDto(row: unknown): AchievementAuditItemDto | null {
  const record = asRecord(row);
  if (!record) return null;
  const key = readString(record, ["key", "id"]).trim();
  const title = readString(record, ["title", "name"]).trim();
  if (!key && !title) return null;
  return {
    key: key || title,
    title: title || key,
    description: readNullableString(record, ["description", "subtitle"]),
    targetCount: readNumber(record, ["targetCount"], 1),
    currentCount: readNumber(record, ["currentCount"]),
    rewardXp: readNumber(record, ["rewardXp", "rewardPoints", "xpReward"]),
    isCompleted: readBoolean(record, ["isCompleted"]),
  };
}

export function mapAchievementAuditItems(raw: unknown): AchievementAuditItemDto[] {
  const record = asRecord(raw);
  const list = Array.isArray(raw) ? raw : readArray(record, ["items", "data"]);
  return list
    .map(mapAchievementAuditItemDto)
    .filter((item): item is AchievementAuditItemDto => item != null);
}

/** Speed multiplier: ≤5s ×3, ≤10s ×2, else ×1 */
export function getSpeedMultiplier(elapsedMs: number): number {
  if (elapsedMs <= 5000) return 3;
  if (elapsedMs <= 10000) return 2;
  return 1;
}

export function formatChallengeTimer(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function getLevelTitle(level: number, locale: "ar" | "en" = "ar"): string {
  const titlesAr = [
    "الباحث الصغير",
    "الباحث النشيط",
    "الباحث المتمكن",
    "باحث متمرس",
    "عبقرية العلوم",
  ];
  const titlesEn = [
    "Junior Researcher",
    "Active Researcher",
    "Proficient Researcher",
    "Expert Researcher",
    "Science Genius",
  ];
  const titles = locale === "ar" ? titlesAr : titlesEn;
  const index = Math.min(titles.length - 1, Math.max(0, Math.floor((level - 1) / 5)));
  return titles[index] ?? titles[0];
}

export function getLevelProgressPercent(
  currentLevel: number,
  pointsToNextLevel: number,
): number {
  // Approximate band size grows lightly with level; clamp for UI ring.
  const band = Math.max(200, currentLevel * 80);
  const earnedInBand = Math.max(0, band - Math.max(0, pointsToNextLevel));
  return Math.min(99, Math.max(1, Math.round((earnedInBand / band) * 100)));
}

export function getChallengeTypeLabelKey(type: ChallengeType): string {
  switch (type) {
    case ChallengeType.RankedMatch:
      return "ranked";
    case ChallengeType.Practice:
      return "practice";
    default:
      return "quick";
  }
}

export function getOptionLetter(index: number): string {
  const letters = ["أ", "ب", "ج", "د", "هـ", "و"];
  return letters[index] ?? String(index + 1);
}
