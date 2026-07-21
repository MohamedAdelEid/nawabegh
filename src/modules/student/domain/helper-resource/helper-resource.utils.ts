import type {
  ResourceFileMediaKind,
  StudentHelperResourceFileDto,
} from "@/modules/student/domain/types/helperResource.types";

export type HelperResourceMediaFilter = "all" | ResourceFileMediaKind;

export const HELPER_RESOURCE_MEDIA_FILTERS: HelperResourceMediaFilter[] = [
  "all",
  "Pdf",
  "Presentation",
  "Word",
  "Image",
];

export function formatHelperFileSize(bytes: number | null | undefined): string {
  if (bytes == null || !Number.isFinite(bytes) || bytes < 0) return "—";
  if (bytes < 1024) return `${Math.round(bytes)} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatHelperFileSizeArabic(
  bytes: number | null | undefined,
): string {
  if (bytes == null || !Number.isFinite(bytes) || bytes < 0) return "—";
  if (bytes < 1024) return `${Math.round(bytes)} بايت`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} كيلوبايت`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} ميجابايت`;
}

export function formatHelperFileDate(
  iso: string | null | undefined,
  locale = "ar-SA",
): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  try {
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  } catch {
    return date.toISOString().slice(0, 10);
  }
}

export function formatHelperRelativeDate(
  iso: string | null | undefined,
  locale = "ar",
): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const diffMs = Date.now() - date.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  if (Math.abs(diffSec) < 60) return rtf.format(-diffSec, "second");
  const diffMin = Math.round(diffSec / 60);
  if (Math.abs(diffMin) < 60) return rtf.format(-diffMin, "minute");
  const diffHour = Math.round(diffMin / 60);
  if (Math.abs(diffHour) < 24) return rtf.format(-diffHour, "hour");
  const diffDay = Math.round(diffHour / 24);
  if (Math.abs(diffDay) < 30) return rtf.format(-diffDay, "day");
  const diffMonth = Math.round(diffDay / 30);
  return rtf.format(-diffMonth, "month");
}

export function computeReadPercentage(
  current: number,
  total: number,
): number {
  if (total <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((current / total) * 100)));
}

export function getMediaKindBadgeLabel(kind: ResourceFileMediaKind): string {
  switch (kind) {
    case "Pdf":
      return "PDF";
    case "Presentation":
      return "PPT";
    case "Word":
      return "Word";
    case "Image":
      return "IMG";
    case "Video":
      return "Video";
    default:
      return "File";
  }
}

export function getViewerKind(
  file: StudentHelperResourceFileDto,
): "pdf" | "presentation" | "word" | "image" | "other" {
  switch (file.mediaKind) {
    case "Pdf":
      return "pdf";
    case "Presentation":
      return "presentation";
    case "Word":
      return "word";
    case "Image":
      return "image";
    default:
      return "other";
  }
}

export function triggerBrowserDownload(url: string, fileName?: string) {
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.target = "_blank";
  anchor.rel = "noopener noreferrer";
  if (fileName) anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}
