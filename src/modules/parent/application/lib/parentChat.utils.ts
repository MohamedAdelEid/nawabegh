import type {
  ParentChatAttachment,
  ParentChatDateGroup,
  ParentChatMessage,
  ParentInboxItem,
} from "@/modules/parent/domain/types/parentChat.types";
import { resolveFileUrl } from "@/shared/infrastructure/files/fileUrl";

export const PARENT_SUPPORT_CONTACT_ID = "00000000-0000-0000-0000-000000000000";

export function formatChatClock(value: string | null | undefined, locale: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" }).format(date);
}

export function formatChatInboxTime(value: string | null | undefined, locale: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayDiff = Math.round(
    (startOfToday.getTime() - startOfDate.getTime()) / (24 * 60 * 60 * 1000),
  );

  if (dayDiff === 0) return formatChatClock(value, locale);
  if (dayDiff === 1) return locale.startsWith("ar") ? "أمس" : "Yesterday";
  if (dayDiff > 1 && dayDiff < 7) {
    return locale.startsWith("ar") ? `${dayDiff} يوم` : `${dayDiff}d`;
  }

  return new Intl.DateTimeFormat(locale, { month: "short", day: "numeric" }).format(date);
}

export function formatChatDateGroupLabel(value: string, locale: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  const now = new Date();
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);

  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (sameDay(date, now)) return locale.startsWith("ar") ? "اليوم" : "Today";
  if (sameDay(date, yesterday)) return locale.startsWith("ar") ? "أمس" : "Yesterday";

  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function formatFileSize(bytes: number, locale: string): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "—";
  const units = locale.startsWith("ar")
    ? ["بايت", "ك.ب", "م.ب", "ج.ب"]
    : ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }
  const formatted = new Intl.NumberFormat(locale, {
    maximumFractionDigits: size >= 10 || unitIndex === 0 ? 0 : 1,
  }).format(size);
  return `${formatted} ${units[unitIndex]}`;
}

export function resolveAttachmentType(file: File): number {
  if (file.type.startsWith("image/")) return 1;
  if (file.type.includes("pdf") || file.name.toLowerCase().endsWith(".pdf")) return 2;
  if (/\.pptx?$/i.test(file.name)) return 3;
  if (file.type.startsWith("audio/")) return 4;
  return 2;
}

export function groupMessagesByDate(
  messages: ParentChatMessage[],
  locale: string,
): ParentChatDateGroup[] {
  const groups: ParentChatDateGroup[] = [];
  const indexByLabel = new Map<string, number>();

  for (const message of messages) {
    const label = formatChatDateGroupLabel(message.createdAt, locale);
    const existingIndex = indexByLabel.get(label);
    if (existingIndex == null) {
      indexByLabel.set(label, groups.length);
      groups.push({ label, messages: [message] });
    } else {
      groups[existingIndex]!.messages.push(message);
    }
  }

  return groups;
}

export function sortInboxItems(items: ParentInboxItem[]): ParentInboxItem[] {
  return [...items].sort((a, b) => {
    const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
    const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
    return bTime - aTime;
  });
}

export function mapAttachmentDto(
  row: {
    id?: string;
    attachmentType?: number;
    url?: string;
    previewUrl?: string | null;
    fileName?: string;
    mimeType?: string;
    sizeInBytes?: number;
  },
  locale: string,
): ParentChatAttachment | null {
  const url = resolveFileUrl(row.url ?? null);
  if (!url) return null;
  const sizeInBytes = row.sizeInBytes ?? 0;
  return {
    id: row.id ?? url,
    attachmentType: row.attachmentType ?? 2,
    url,
    previewUrl: resolveFileUrl(row.previewUrl ?? null),
    fileName: row.fileName?.trim() || "file",
    mimeType: row.mimeType ?? "",
    sizeInBytes,
    sizeLabel: formatFileSize(sizeInBytes, locale),
  };
}

export function roleLabel(role: string | null | undefined, locale: string): string {
  const normalized = (role ?? "").trim().toLowerCase();
  if (normalized === "teacher") return locale.startsWith("ar") ? "مدرس" : "Teacher";
  if (normalized === "admin") return locale.startsWith("ar") ? "الإدارة" : "Admin";
  if (normalized === "parent") return locale.startsWith("ar") ? "ولي الأمر" : "Parent";
  if (normalized === "student") return locale.startsWith("ar") ? "طالب" : "Student";
  if (normalized === "support") return locale.startsWith("ar") ? "الدعم" : "Support";
  return role?.trim() || "";
}
