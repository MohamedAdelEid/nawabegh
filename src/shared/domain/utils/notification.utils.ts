import type { InAppNotification } from "@/shared/domain/types/notification.types";

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

function readNullableString(record: UnknownRecord | null, keys: string[]): string | null {
  const value = readString(record, keys, "");
  return value.trim() ? value : null;
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

export function mapInAppNotification(raw: unknown): InAppNotification | null {
  const record = asRecord(raw);
  if (!record) return null;

  const id = readString(record, ["id", "notificationId"]);
  if (!id) return null;

  return {
    id,
    broadcastNotificationId: readNumber(record, ["broadcastNotificationId"]),
    title: readString(record, ["title", "subject"]),
    body: readString(record, ["body", "message", "content"]),
    actionButtonText: readNullableString(record, ["actionButtonText"]),
    actionUrl: readNullableString(record, ["actionUrl"]),
    createdAtUtc: readString(record, ["createdAtUtc", "createdAt", "sentAtUtc"]),
    isRead: readBoolean(record, ["isRead", "read"]),
  };
}

export function formatNotificationRelativeTime(value: string, locale: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.round(diffMs / 60_000);
  const rtf = new Intl.RelativeTimeFormat(locale.startsWith("ar") ? "ar" : "en", {
    numeric: "auto",
  });

  if (diffMinutes < 1) return locale.startsWith("ar") ? "الآن" : "Just now";
  if (diffMinutes < 60) return rtf.format(-diffMinutes, "minute");

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return rtf.format(-diffHours, "hour");

  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 30) return rtf.format(-diffDays, "day");

  return date.toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
