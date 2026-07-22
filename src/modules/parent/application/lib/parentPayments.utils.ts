import type { DashboardBadgeTone } from "@/shared/presentation/components/dashboard";
import type { ParentPaymentTransactionStatus } from "@/modules/parent/domain/types/parentPayments.types";

export function getInitials(name?: string | null): string {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
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

export function formatPaymentDateTime(
  value: string | null | undefined,
  locale: string,
): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
}

export function formatPaymentAmount(
  amount: number,
  currency: string,
  locale: string,
): string {
  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  if (currency === "OMR" || currency === "SAR") {
    const label =
      currency === "OMR"
        ? locale.startsWith("ar")
          ? "ر.ع."
          : "OMR"
        : locale.startsWith("ar")
          ? "ر.س"
          : "SAR";
    return `${formatted} ${label}`;
  }

  return `${formatted} ${currency}`;
}

export function transactionStatusTone(status: string): DashboardBadgeTone {
  switch (status as ParentPaymentTransactionStatus) {
    case "succeeded":
      return "success";
    case "failed":
      return "danger";
    case "pending":
      return "warning";
    case "expired":
    case "cancelled":
      return "danger";
    default:
      return "neutral";
  }
}

export function resolveLocalizedLabel(
  locale: string,
  ar?: string | null,
  en?: string | null,
  fallback = "—",
): string {
  if (locale === "en") {
    return (en?.trim() || ar?.trim() || fallback).trim();
  }
  return (ar?.trim() || en?.trim() || fallback).trim();
}

export function maskCardLast4(last4?: string | null): string {
  const digits = last4?.replace(/\D/g, "").slice(-4);
  if (!digits) return "•••• •••• •••• ••••";
  return `•••• •••• •••• ${digits}`;
}
