import type {
  ParentAlertSeverity,
  ParentChildrenStatsAlert,
  ParentHomeChild,
  ParentRecentActivityType,
} from "@/modules/parent/domain/types/parentHome.types";

export type PerformanceLevelKey =
  | "excellent"
  | "veryGood"
  | "good"
  | "acceptable";

export function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, value));
}

export function formatPercent(value: number, digits = 0): string {
  const normalized = clampPercent(value);
  return `${normalized.toFixed(digits)}%`;
}

export function getPerformanceLevelKey(progressPercent: number): PerformanceLevelKey {
  const value = clampPercent(progressPercent);
  if (value >= 85) return "excellent";
  if (value >= 70) return "veryGood";
  if (value >= 55) return "good";
  return "acceptable";
}

export function buildLevelDistribution(children: ParentHomeChild[]) {
  const counts: Record<PerformanceLevelKey, number> = {
    excellent: 0,
    veryGood: 0,
    good: 0,
    acceptable: 0,
  };

  for (const child of children) {
    counts[getPerformanceLevelKey(child.progressPercent)] += 1;
  }

  return (Object.keys(counts) as PerformanceLevelKey[]).map((key) => ({
    key,
    count: counts[key],
  }));
}

export function resolveLocalizedText(
  locale: string,
  ar: string | null | undefined,
  en?: string | null,
  fallback = "",
): string {
  if (locale === "en") {
    return (en?.trim() || ar?.trim() || fallback).trim();
  }
  return (ar?.trim() || en?.trim() || fallback).trim();
}

export function getAlertTone(severity: ParentAlertSeverity): {
  container: string;
  title: string;
  message: string;
} {
  if (severity === "urgent") {
    return {
      container: "bg-[rgba(255,228,228,0.5)]",
      title: "text-[#d33131]",
      message: "text-[rgba(211,49,49,0.7)]",
    };
  }

  return {
    container: "bg-[rgba(244,236,216,0.5)]",
    title: "text-[#a38f5a]",
    message: "text-[rgba(163,143,90,0.7)]",
  };
}

export function getDefaultAlertCopy(
  alert: ParentChildrenStatsAlert,
  locale: string,
): { title: string; message: string } {
  const title = resolveLocalizedText(locale, alert.titleAr, alert.titleEn);
  const message = resolveLocalizedText(locale, alert.messageAr, alert.messageEn);
  return { title, message };
}

export function getActivityIconTone(
  type: ParentRecentActivityType,
): "quiz" | "station" | "live" {
  if (type === "quiz_submitted") return "quiz";
  if (type === "live_joined") return "live";
  return "station";
}

export function getAchievementSpeedKey(
  completed: number,
  total: number,
): "veryFast" | "fast" | "steady" | "slow" {
  if (total <= 0) return "steady";
  const ratio = completed / total;
  if (ratio >= 0.75) return "veryFast";
  if (ratio >= 0.5) return "fast";
  if (ratio >= 0.3) return "steady";
  return "slow";
}
