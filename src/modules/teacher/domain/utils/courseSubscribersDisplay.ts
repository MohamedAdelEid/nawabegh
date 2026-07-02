import { formatDate } from "@/shared/application/lib/format";

export function formatSubscriberPercent(value: number | null | undefined, locale: string): string {
  if (value == null || Number.isNaN(value)) return "—";
  return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(value)}%`;
}

export function formatSubscriberRelativeTime(
  value: string | null | undefined,
  locale: string,
): string {
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

  return formatDate(date, locale);
}

export function formatEnrolledDate(value: string | null | undefined, locale: string): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return formatDate(date, locale);
}

export function formatJoinedMonth(value: string | null | undefined, locale: string): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(date);
}

export function progressBarTone(percent: number): string {
  if (percent >= 100) return "bg-emerald-500";
  if (percent >= 70) return "bg-[#2C4260]";
  return "bg-[#2C4260]";
}
