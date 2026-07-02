import type {
  FriendChallengeDifficulty,
  FriendChallengeListItem,
} from "@/modules/admin/domain/types/friendChallenges.types";
import type { DashboardBadgeTone } from "@/shared/presentation/components/dashboard/DashboardBadge";

const DIFFICULTY_VALUES: FriendChallengeDifficulty[] = ["Easy", "Medium", "Hard"];

export function isFriendChallengeDifficulty(value: string): value is FriendChallengeDifficulty {
  return DIFFICULTY_VALUES.includes(value as FriendChallengeDifficulty);
}

export function difficultyTone(difficulty: FriendChallengeDifficulty): DashboardBadgeTone {
  switch (difficulty) {
    case "Easy":
      return "success";
    case "Medium":
      return "warning";
    case "Hard":
      return "danger";
    default:
      return "neutral";
  }
}

export function formatPercent(value: number, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: "percent",
    maximumFractionDigits: 1,
  }).format(value / 100);
}

export function formatPointsChange(value: number, locale: string): string {
  const formatted = new Intl.NumberFormat(locale).format(Math.abs(value));
  return value >= 0 ? `+${formatted} XP` : `-${formatted} XP`;
}

export function formatDurationSeconds(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

export function formatResponseTimeMs(ms: number, locale: string): string {
  const seconds = Math.round(ms / 1000);
  return `${new Intl.NumberFormat(locale).format(seconds)}s`;
}

export function resolveWinnerName(row: FriendChallengeListItem): string | null {
  if (!row.winnerStudentId) return null;
  if (row.winnerStudentId === row.inviter.studentId) return row.inviter.fullName;
  if (row.winnerStudentId === row.invitee.studentId) return row.invitee.fullName;
  return null;
}

export function formatChallengeDateTime(
  challengeDate: string,
  startTime: string | undefined,
  locale: string,
): string {
  const date = new Date(`${challengeDate}T${startTime ?? "00:00:00"}`);
  if (Number.isNaN(date.getTime())) return challengeDate;
  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function playerAccuracyPercent(correctAnswers: number, questionCount: number): number {
  if (questionCount <= 0) return 0;
  return Math.round((correctAnswers / questionCount) * 100);
}
