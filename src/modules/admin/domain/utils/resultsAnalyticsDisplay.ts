import type { DashboardBadgeTone } from "@/shared/presentation/components/dashboard";
import {
  QUESTION_DIFFICULTY,
  RESULT_STATUS,
  type QuestionDifficulty,
  type ResultStatus,
} from "@/modules/admin/domain/types/resultsAnalytics.types";

export function resultStatusTone(status: ResultStatus): DashboardBadgeTone {
  switch (status) {
    case RESULT_STATUS.passedWithExcellence:
    case RESULT_STATUS.passed:
      return "success";
    case RESULT_STATUS.failed:
      return "danger";
    case RESULT_STATUS.inProgress:
      return "warning";
    default:
      return "neutral";
  }
}

export function difficultyTone(difficulty: QuestionDifficulty): DashboardBadgeTone {
  switch (difficulty) {
    case QUESTION_DIFFICULTY.easy:
      return "success";
    case QUESTION_DIFFICULTY.medium:
      return "warning";
    case QUESTION_DIFFICULTY.hard:
      return "danger";
    default:
      return "neutral";
  }
}

export function scorePercentClassName(score: number | null | undefined): string {
  if (score == null || Number.isNaN(score)) return "text-slate-500";
  if (score >= 80) return "font-semibold text-emerald-600";
  if (score >= 60) return "font-semibold text-slate-700";
  return "font-semibold text-red-500";
}

export function formatPercent(value: number | null | undefined, locale: string): string {
  if (value == null || Number.isNaN(value)) return "—";
  return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(value)}%`;
}

export function formatMinutes(value: number | null | undefined, locale: string): string {
  if (value == null || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(value);
}

export function formatRelativeTime(value: string | null | undefined, locale: string): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.round(diffMs / 60_000);
  if (diffMinutes < 1) return locale.startsWith("ar") ? "الآن" : "Just now";
  if (diffMinutes < 60) {
    return new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(
      -diffMinutes,
      "minute",
    );
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) {
    return new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(-diffHours, "hour");
  }

  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 30) {
    return new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(-diffDays, "day");
  }

  return date.toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(value: string | null | undefined, locale: string): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatTrendPercent(
  value: number | null | undefined,
  locale: string,
): { text: string; className: string } | null {
  if (value == null || Number.isNaN(value)) return null;
  const formatted = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 1,
    signDisplay: "exceptZero",
  }).format(value);
  return {
    text: `${formatted}%`,
    className: value >= 0 ? "text-emerald-600" : "text-red-500",
  };
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0] ?? "";
  if (parts.length === 1) return first.slice(0, 2).toUpperCase();
  const second = parts[1] ?? "";
  return `${first.charAt(0)}${second.charAt(0)}`.toUpperCase();
}

export function isResultStatus(value: string): value is ResultStatus {
  return Object.values(RESULT_STATUS).includes(value as ResultStatus);
}

export function isQuestionDifficulty(value: number): value is QuestionDifficulty {
  return value === 0 || value === 1 || value === 2;
}
