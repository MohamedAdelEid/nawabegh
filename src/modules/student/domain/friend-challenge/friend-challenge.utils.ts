import type {
  FriendChallengeDifficulty,
  FriendChallengeHistoryTab,
  FriendChallengeHubResponse,
  FriendChallengeListItem,
  FriendChallengeOpponent,
  FriendChallengeOutcome,
  FriendChallengeRole,
  FriendChallengeSessionPhase,
  FriendChallengeSessionStatus,
  FriendChallengeStatus,
} from "./friend-challenge.types";

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

function readNullableString(record: UnknownRecord | null, keys: string[]): string | null {
  if (!record) return null;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim() !== "") return value;
    if (value === null) return null;
  }
  return null;
}

function mapOpponent(raw: unknown): FriendChallengeOpponent {
  const record = asRecord(raw);
  return {
    studentId: readString(record, ["studentId", "studentUserId"]),
    fullName: readString(record, ["fullName"]),
    profileImageUrl: readNullableString(record, ["profileImageUrl"]),
    level: readNullableNumber(record, ["level"]),
    schoolRank: readNullableNumber(record, ["schoolRank"]),
  };
}

export function mapListItem(raw: unknown): FriendChallengeListItem | null {
  const record = asRecord(raw);
  if (!record) return null;
  const id = readString(record, ["friendChallengeId"]);
  if (!id) return null;

  return {
    friendChallengeId: id,
    title: readString(record, ["title"]),
    subjectName: readString(record, ["subjectName"]),
    difficulty: readString(record, ["difficulty"], "Medium") as FriendChallengeDifficulty,
    questionCount: readNumber(record, ["questionCount"]),
    wagerPoints: readNumber(record, ["wagerPoints"]),
    opponent: mapOpponent(record.opponent),
    status: readString(record, ["status"], "Pending") as FriendChallengeStatus,
    role: readString(record, ["role"], "inviter") as FriendChallengeRole,
    challengeDate: readString(record, ["challengeDate"]),
    startTime: readString(record, ["startTime"]),
    endTime: readString(record, ["endTime"]),
    endDate: readString(record, ["endDate"]),
    timeZoneId: readString(record, ["timeZoneId"]),
    scheduledStartLocal: readString(record, ["scheduledStartLocal"]),
    scheduledEndLocal: readString(record, ["scheduledEndLocal"]),
    scheduledStartUtc: readString(record, ["scheduledStartUtc"]),
    scheduledEndUtc: readString(record, ["scheduledEndUtc"]),
    remainingSecondsUntilStart: readNumber(record, ["remainingSecondsUntilStart"]),
    remainingSecondsUntilEnd: readNumber(record, ["remainingSecondsUntilEnd"]),
    canEnter: readBoolean(record, ["canEnter"]),
    canAccept: readBoolean(record, ["canAccept"]),
    canDecline: readBoolean(record, ["canDecline"]),
    canCancel: readBoolean(record, ["canCancel"]),
    outcome: readNullableString(record, ["outcome"]) as FriendChallengeOutcome | null,
    sessionId: readNullableString(record, ["sessionId"]),
  };
}

export function mapFriendChallengeHubResponse(data: unknown): FriendChallengeHubResponse {
  const record = asRecord(data);
  const mapList = (key: string) =>
    (Array.isArray(record?.[key]) ? record[key] : [])
      .map(mapListItem)
      .filter((item): item is FriendChallengeListItem => item != null);

  const schoolRankRecord = asRecord(record?.schoolRank);

  return {
    schoolRank: {
      rank: readNullableNumber(schoolRankRecord, ["rank"]),
      schoolName: readNullableString(schoolRankRecord, ["schoolName"]),
    },
    stats: {
      wins: readNumber(asRecord(record?.stats), ["wins"]),
      losses: readNumber(asRecord(record?.stats), ["losses"]),
      pendingCount: readNumber(asRecord(record?.stats), ["pendingCount"]),
      upcomingCount: readNumber(asRecord(record?.stats), ["upcomingCount"]),
    },
    pending: mapList("pending"),
    upcoming: mapList("upcoming"),
    wins: mapList("wins"),
    losses: mapList("losses"),
    cancelled: mapList("cancelled"),
  };
}

export function getHistoryBucket(
  hub: FriendChallengeHubResponse,
  tab: FriendChallengeHistoryTab,
): FriendChallengeListItem[] {
  return hub[tab];
}

export function calculateWagerPoints(questionCount: number): number {
  return questionCount * 20;
}

export function getDeviceTimeZoneId(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Amman";
  } catch {
    return "Asia/Amman";
  }
}

export function formatCountdownParts(totalSeconds: number): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
} {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const days = Math.floor(safe / 86_400);
  const hours = Math.floor((safe % 86_400) / 3_600);
  const minutes = Math.floor((safe % 3_600) / 60);
  const seconds = safe % 60;
  return { days, hours, minutes, seconds };
}

export function formatCountdownClock(totalSeconds: number): string {
  const { days, hours, minutes, seconds } = formatCountdownParts(totalSeconds);
  const hh = String(hours).padStart(2, "0");
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");
  if (days > 0) return `${days}d ${hh}:${mm}:${ss}`;
  return `${hh}:${mm}:${ss}`;
}

export function formatScheduleTime(isoLocal: string, locale: string): string {
  if (!isoLocal) return "";
  const date = new Date(isoLocal);
  if (Number.isNaN(date.getTime())) return isoLocal;
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function formatScheduleDateOnly(isoLocal: string, locale: string): string {
  if (!isoLocal) return "";
  const date = new Date(isoLocal);
  if (Number.isNaN(date.getTime())) return isoLocal;
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-US", {
    dateStyle: "medium",
  }).format(date);
}

export function difficultyToNumeric(difficulty: FriendChallengeDifficulty): 0 | 1 | 2 {
  if (difficulty === "Easy") return 0;
  if (difficulty === "Hard") return 2;
  return 1;
}

export function numericToDifficulty(value: 0 | 1 | 2): FriendChallengeDifficulty {
  if (value === 0) return "Easy";
  if (value === 2) return "Hard";
  return "Medium";
}

export function isDuelPhase(phase: FriendChallengeSessionPhase): boolean {
  return phase === "InProgress" || phase === "WaitingForOpponentToFinish";
}

export function sessionRouteForPhase(
  sessionId: string,
  phase: FriendChallengeSessionPhase,
): string {
  const base = `/student/friend-challenges/sessions/${sessionId}`;
  if (phase === "WaitingForOpponent") return `${base}/waiting-opponent`;
  if (phase === "WaitingForOpponentToFinish") return `${base}/waiting-finish`;
  if (phase === "Ended") return `${base}/result`;
  return base;
}

export function mapSessionStatus(raw: unknown): FriendChallengeSessionStatus {
  const value = readString(asRecord(raw), ["status"], "Waiting");
  return value as FriendChallengeSessionStatus;
}

export function mapSessionPhase(raw: unknown): FriendChallengeSessionPhase {
  const value = readString(asRecord(raw), ["phase"], "WaitingForOpponent");
  return value as FriendChallengeSessionPhase;
}
