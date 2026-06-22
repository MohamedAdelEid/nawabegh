import type { DashboardBadgeTone } from "@/shared/presentation/components/dashboard";
import type { EnrollmentStatus, TransactionStatus } from "@/modules/admin/domain/types/payments.types";

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0] ?? "";
  if (parts.length === 1) return first.slice(0, 2).toUpperCase();
  const second = parts[1] ?? "";
  return `${first.charAt(0)}${second.charAt(0)}`.toUpperCase();
}

export function formatPaymentDate(value: string | null | undefined, locale: string): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function formatPaymentDateTime(value: string | null | undefined, locale: string): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatPaymentAmount(
  amount: number,
  currency: string,
  locale: string,
  currencyLabel?: string,
): string {
  const formatted = new Intl.NumberFormat(locale).format(amount);
  if (currency === "SAR") {
    return `${formatted} ${currencyLabel ?? (locale.startsWith("ar") ? "ريال" : "SAR")}`;
  }
  return `${formatted} ${currency}`;
}

export function formatChangePercent(value: number | null | undefined, locale: string): string {
  if (value == null || !Number.isFinite(value)) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(value)}%`;
}

export function changePercentClassName(value: number): string {
  if (value > 0) return "text-emerald-600 bg-emerald-50";
  if (value < 0) return "text-rose-600 bg-rose-50";
  return "text-slate-500 bg-slate-100";
}

export function transactionStatusTone(status: string): DashboardBadgeTone {
  switch (status as TransactionStatus) {
    case "succeeded":
      return "success";
    case "failed":
      return "danger";
    case "pending":
      return "warning";
    case "expired":
    case "cancelled":
      return "neutral";
    default:
      return "neutral";
  }
}

export function enrollmentStatusTone(status: string): DashboardBadgeTone {
  switch (status as EnrollmentStatus) {
    case "active":
      return "success";
    case "expired":
      return "warning";
    case "inactive":
      return "neutral";
    default:
      return "neutral";
  }
}

export function displayParentOrStudentName(
  parentName: string | null,
  studentName: string,
): string {
  return parentName?.trim() || studentName || "—";
}

export const ARABIC_MONTHS = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
] as const;

export const ENGLISH_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

export function getMonthLabel(month: number, locale: string): string {
  const index = month - 1;
  if (index < 0 || index > 11) return String(month);
  const months = locale.startsWith("ar") ? ARABIC_MONTHS : ENGLISH_MONTHS;
  return months[index] ?? String(month);
}

export function fillMonthlyRevenueGaps(
  rows: Array<{ year: number; month: number; amount: number; currency: string }>,
  year: number,
): Array<{ year: number; month: number; amount: number; currency: string; label: string }> {
  const byMonth = new Map(rows.filter((row) => row.year === year).map((row) => [row.month, row]));
  const currency = rows.find((row) => row.year === year)?.currency ?? "SAR";

  return Array.from({ length: 12 }, (_, index) => {
    const month = index + 1;
    const existing = byMonth.get(month);
    return {
      year,
      month,
      amount: existing?.amount ?? 0,
      currency: existing?.currency ?? currency,
      label: "",
    };
  });
}

export function isGatewayConnected(settings: {
  isConfiguredInDatabase: boolean;
  hasSecretKey: boolean;
  hasWebhookSecret: boolean;
}): boolean {
  return settings.isConfiguredInDatabase && settings.hasSecretKey && settings.hasWebhookSecret;
}
