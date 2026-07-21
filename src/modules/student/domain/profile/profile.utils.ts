import type {
  StudentBadgesMyDto,
  StudentProfileBadge,
  StudentProfileKpis,
  StudentProfileNotificationPrefs,
  StudentSchoolRankDto,
} from "@/modules/student/domain/profile/profile.types";
import type { AchievementAuditItemDto } from "@/modules/student/domain/challenge-station/challenge-station.types";

type UnknownRecord = Record<string, unknown>;

const PROFILE_PREFS_STORAGE_KEY = "nawabegh.student.profile.notificationPrefs";

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

function isRecentBadge(earnedAt: string | null): boolean {
  if (!earnedAt) return false;
  const earnedMs = Date.parse(earnedAt);
  if (Number.isNaN(earnedMs)) return false;
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  return Date.now() - earnedMs <= sevenDaysMs;
}

export function mapStudentProfileBadge(raw: unknown): StudentProfileBadge | null {
  const record = asRecord(raw);
  if (!record) return null;
  const badgeId = readString(record, ["badgeId", "id", "achievementBadgeId"]);
  if (!badgeId) return null;
  const earnedAt = readString(record, ["earnedAt", "earnedAtUtc", "createdAt"]) || null;
  return {
    badgeId,
    name: readString(record, ["name", "title"]),
    iconUrl: readString(record, ["iconUrl", "imageUrl"]),
    earnedAt,
    isNew: isRecentBadge(earnedAt),
  };
}

export function mapStudentBadgesMyDto(raw: unknown): StudentBadgesMyDto {
  const record = asRecord(raw);
  const earnedRaw = Array.isArray(record?.earnedBadges) ? record.earnedBadges : [];
  const availableRaw = Array.isArray(record?.availableBadges) ? record.availableBadges : [];
  return {
    earnedBadges: earnedRaw
      .map(mapStudentProfileBadge)
      .filter((badge): badge is StudentProfileBadge => badge != null),
    availableBadges: availableRaw
      .map(mapStudentProfileBadge)
      .filter((badge): badge is StudentProfileBadge => badge != null),
    currentPoints: readNumber(record, ["currentPoints", "points"]),
  };
}

export function mapStudentSchoolRankDto(raw: unknown): StudentSchoolRankDto {
  const record = asRecord(raw);
  const rankRaw = record?.rank;
  const rank =
    typeof rankRaw === "number" && Number.isFinite(rankRaw)
      ? rankRaw
      : rankRaw != null && String(rankRaw).trim() !== "" && !Number.isNaN(Number(rankRaw))
        ? Number(rankRaw)
        : null;
  return {
    rank,
    schoolName: readString(record, ["schoolName"]),
    currentPoints: readNumber(record, ["currentPoints", "points"]),
  };
}

export function findAuditCount(
  items: AchievementAuditItemDto[],
  key: string,
): number {
  return items.find((item) => item.key === key)?.currentCount ?? 0;
}

export function buildProfileKpis(params: {
  overallProgressPercentage: number;
  auditItems: AchievementAuditItemDto[];
}): StudentProfileKpis {
  return {
    completedStations: null,
    overallProgressPercentage: Math.round(params.overallProgressPercentage),
    liveSessionsAttended: findAuditCount(params.auditItems, "live_sessions_attended"),
    quizzesCompleted: findAuditCount(params.auditItems, "quizzes_completed"),
  };
}

export function formatProfileJoinDate(value: string | null, locale: string): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(locale.startsWith("ar") ? "ar-EG" : "en-US", {
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatProfilePhone(
  phoneNumber: string,
  phoneCountryCode: number | null,
): string {
  if (!phoneNumber) return "—";
  if (phoneCountryCode == null) return phoneNumber;
  return `+${phoneCountryCode} ${phoneNumber}`;
}

export function formatProfilePoints(value: number, locale: string): string {
  return new Intl.NumberFormat(locale.startsWith("ar") ? "ar-EG" : "en-US").format(value);
}

export function getDefaultNotificationPrefs(): StudentProfileNotificationPrefs {
  return {
    liveSessionAlerts: true,
    quizResults: true,
    achievementMessages: false,
  };
}

export function readNotificationPrefs(): StudentProfileNotificationPrefs {
  if (typeof window === "undefined") return getDefaultNotificationPrefs();
  try {
    const raw = window.localStorage.getItem(PROFILE_PREFS_STORAGE_KEY);
    if (!raw) return getDefaultNotificationPrefs();
    const parsed = JSON.parse(raw) as Partial<StudentProfileNotificationPrefs>;
    return {
      liveSessionAlerts: parsed.liveSessionAlerts ?? true,
      quizResults: parsed.quizResults ?? true,
      achievementMessages: parsed.achievementMessages ?? false,
    };
  } catch {
    return getDefaultNotificationPrefs();
  }
}

export function writeNotificationPrefs(prefs: StudentProfileNotificationPrefs): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PROFILE_PREFS_STORAGE_KEY, JSON.stringify(prefs));
}

export function progressBarTone(percent: number): "navy" | "gold" | "green" {
  if (percent >= 70) return "navy";
  if (percent >= 50) return "green";
  return "gold";
}
