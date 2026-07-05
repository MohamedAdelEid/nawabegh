import type {
  ChallengeStation,
  CurrentStationsDto,
  InAppNotification,
  LeaderboardEntry,
  LeaderboardWidgetDto,
  LiveSessionStation,
  StudentMyProfile,
} from "@/modules/student/domain/types/student-home.types";

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

function mapLiveSession(raw: unknown): LiveSessionStation | null {
  const record = asRecord(raw);
  if (!record) return null;
  const stationId = readString(record, ["stationId"]);
  if (!stationId) return null;
  return {
    liveSessionId: readString(record, ["liveSessionId"]),
    stationId,
    courseId: readString(record, ["courseId"]),
    title: readString(record, ["title"]),
    coverImageUrl: readString(record, ["coverImageUrl"]) || null,
    instructorName: readString(record, ["instructorName"]),
    subjectNameAr: readString(record, ["subjectNameAr"]),
    viewerCount: readNumber(record, ["viewerCount"]),
    remainingSeconds: readNumber(record, ["remainingSeconds"]),
    remainingMinutes: readNumber(record, ["remainingMinutes"]),
    scheduledEndUtc: readString(record, ["scheduledEndUtc"]),
    canJoin: readBoolean(record, ["canJoin"]),
    progressStatus: readString(record, ["progressStatus"]),
  };
}

function mapChallenge(raw: unknown): ChallengeStation | null {
  const record = asRecord(raw);
  if (!record) return null;
  const challengeId = readString(record, ["challengeId"]);
  if (!challengeId) return null;
  return {
    challengeId,
    stationId: readString(record, ["stationId"]),
    courseId: readString(record, ["courseId"]),
    title: readString(record, ["title"]),
    coverImageUrl: readString(record, ["coverImageUrl"]) || null,
    instructorName: readString(record, ["instructorName"]),
    subjectNameAr: readString(record, ["subjectNameAr"]),
    type: readString(record, ["type"]),
    remainingSeconds: readNumber(record, ["remainingSeconds"]),
    remainingMinutes: readNumber(record, ["remainingMinutes"]),
    windowEndUtc: readString(record, ["windowEndUtc"]),
    canEnter: readBoolean(record, ["canEnter"]),
    progressStatus: readString(record, ["progressStatus"]),
  };
}

function mapLeaderboardEntry(raw: unknown): LeaderboardEntry | null {
  const record = asRecord(raw);
  if (!record) return null;
  const userId = readString(record, ["userId"]);
  if (!userId) return null;
  return {
    userId,
    rank: readNumber(record, ["rank"]),
    fullName: readString(record, ["fullName"]),
    currentPoints: readNumber(record, ["currentPoints", "points"]),
    profileImageUrl: readString(record, ["profileImageUrl"]) || null,
    isCurrentUser: readBoolean(record, ["isCurrentUser"]),
  };
}

export function mapStudentMyProfile(raw: unknown): StudentMyProfile | null {
  const record = asRecord(raw);
  if (!record) return null;
  const userId = readString(record, ["userId"]);
  if (!userId) return null;
  const badgesRaw = Array.isArray(record.earnedAchievementBadges)
    ? record.earnedAchievementBadges
    : [];
  return {
    userId,
    fullName: readString(record, ["fullName"]),
    profileImageUrl: readString(record, ["profileImageUrl"]) || null,
    points: readNumber(record, ["points"]),
    maxPointsEverReached: readNumber(record, ["maxPointsEverReached"]),
    achievementBadgeCount: readNumber(record, ["achievementBadgeCount"]),
    earnedAchievementBadges: badgesRaw
      .map((badge) => {
        const row = asRecord(badge);
        if (!row) return null;
        const badgeId = readString(row, ["badgeId", "id"]);
        if (!badgeId) return null;
        return {
          badgeId,
          name: readString(row, ["name"]),
          iconUrl: readString(row, ["iconUrl"]),
          requiredPoints: readNumber(row, ["requiredPoints"]),
        };
      })
      .filter((badge): badge is NonNullable<typeof badge> => badge != null),
    gradeName: readString(record, ["gradeName"]),
    schoolName: readString(record, ["schoolName"]),
  };
}

export function mapCurrentStationsDto(raw: unknown): CurrentStationsDto {
  const record = asRecord(raw);
  const liveRaw = Array.isArray(record?.liveSessions) ? record.liveSessions : [];
  const challengeRaw = Array.isArray(record?.challenges) ? record.challenges : [];
  return {
    liveSessions: liveRaw
      .map(mapLiveSession)
      .filter((item): item is LiveSessionStation => item != null),
    challenges: challengeRaw
      .map(mapChallenge)
      .filter((item): item is ChallengeStation => item != null),
  };
}

export function mapLeaderboardWidgetDto(raw: unknown): LeaderboardWidgetDto {
  const record = asRecord(raw);
  const topRaw = Array.isArray(record?.topThree) ? record.topThree : [];
  const currentUser = mapLeaderboardEntry(record?.currentUser);
  return {
    topThree: topRaw
      .map(mapLeaderboardEntry)
      .filter((item): item is LeaderboardEntry => item != null),
    currentUser,
  };
}

export function mapInAppNotification(raw: unknown): InAppNotification | null {
  const record = asRecord(raw);
  if (!record) return null;
  const id = readString(record, ["id", "notificationId"]);
  if (!id) return null;
  return {
    id,
    title: readString(record, ["title", "subject"]),
    body: readString(record, ["body", "message", "content"]),
    isRead: readBoolean(record, ["isRead", "read"]),
    createdAtUtc: readString(record, ["createdAtUtc", "createdAt", "sentAtUtc"]),
  };
}

const POINTS_PER_LEVEL = 165;

export function deriveStudentLevel(points: number): number {
  return Math.max(1, Math.round(points / POINTS_PER_LEVEL));
}

export function deriveStudentLevelSubtitle(profile: StudentMyProfile): string {
  const topBadge = [...profile.earnedAchievementBadges].sort(
    (a, b) => b.requiredPoints - a.requiredPoints,
  )[0];
  return topBadge?.name ?? "";
}

export function formatCompactCount(value: number, locale: string): string {
  const formatter = new Intl.NumberFormat(locale.startsWith("ar") ? "ar" : "en", {
    notation: "compact",
    maximumFractionDigits: 1,
  });
  return formatter.format(value);
}
