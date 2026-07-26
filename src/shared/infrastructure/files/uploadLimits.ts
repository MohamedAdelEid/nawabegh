/**
 * Client upload limits — match backend `UploadFileRules` + request body cap (100 MB).
 * @see UPLOAD_SIZE_LIMITS_FRONTEND.md
 */

export const UPLOAD_LIMITS = {
  /** Images: jpg, jpeg, png, gif, bmp, webp, svg */
  imageBytes: 20 * 1024 * 1024,
  /** Documents (incl. Interactive Book PDF): pdf, office, zip, rar */
  documentBytes: 100 * 1024 * 1024,
  /** Audio / voice notes */
  audioBytes: 10 * 1024 * 1024,
  /** Kestrel / multipart / IIS request body */
  requestBodyBytes: 100 * 1024 * 1024,
} as const;

/** Interactive Book PDF — same as document limit. */
export const INTERACTIVE_BOOK_PDF_MAX_BYTES = UPLOAD_LIMITS.documentBytes;

const IMAGE_EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "png",
  "gif",
  "bmp",
  "webp",
  "svg",
]);

const DOCUMENT_EXTENSIONS = new Set([
  "pdf",
  "xls",
  "xlsx",
  "csv",
  "doc",
  "docx",
  "ppt",
  "pptx",
  "zip",
  "rar",
]);

const AUDIO_EXTENSIONS = new Set([
  "mp3",
  "wav",
  "m4a",
  "aac",
  "ogg",
  "webm",
  "opus",
  "amr",
  "3gp",
  "caf",
]);

export type UploadLimitCategory = "image" | "document" | "audio" | "request";

function extensionOf(fileName: string): string {
  const parts = fileName.split(".");
  return parts.length > 1 ? (parts.at(-1) ?? "").toLowerCase() : "";
}

export function getUploadLimitCategory(file: File | string): UploadLimitCategory {
  const name = typeof file === "string" ? file : file.name;
  const type = typeof file === "string" ? "" : file.type.toLowerCase();
  const ext = extensionOf(name);

  if (IMAGE_EXTENSIONS.has(ext) || type.startsWith("image/")) return "image";
  if (AUDIO_EXTENSIONS.has(ext) || type.startsWith("audio/")) return "audio";
  if (DOCUMENT_EXTENSIONS.has(ext) || type === "application/pdf" || type.includes("document") || type.includes("sheet") || type.includes("presentation")) {
    return "document";
  }

  // Unknown / video / other binary — enforce request body cap
  return "request";
}

export function getMaxBytesForUpload(file: File | string): number {
  const category = getUploadLimitCategory(file);
  switch (category) {
    case "image":
      return UPLOAD_LIMITS.imageBytes;
    case "audio":
      return UPLOAD_LIMITS.audioBytes;
    case "document":
      return UPLOAD_LIMITS.documentBytes;
    default:
      return UPLOAD_LIMITS.requestBodyBytes;
  }
}

export function isFileWithinUploadLimit(file: File): boolean {
  return file.size <= getMaxBytesForUpload(file);
}

/** Arabic client-side copy (before upload). Prefer i18n keys in UI; use for API fallbacks. */
export const UPLOAD_TOO_LARGE_AR = {
  image: "يجب ألا يتجاوز حجم الصورة 20 ميجابايت.",
  document: "يجب ألا يتجاوز حجم ملف PDF 100 ميجابايت.",
  audio: "يجب ألا يتجاوز حجم الملف الصوتي 10 ميجابايت.",
  request: "يجب ألا يتجاوز حجم الملف 100 ميجابايت.",
} as const;

export const UPLOAD_TOO_LARGE_EN = {
  image: "Image must not exceed 20 MB.",
  document: "PDF must not exceed 100 MB.",
  audio: "Audio file must not exceed 10 MB.",
  request: "File must not exceed 100 MB.",
} as const;

export function getUploadTooLargeMessage(
  file: File | string,
  locale: "ar" | "en" = "ar",
): string {
  const category = getUploadLimitCategory(file);
  return locale === "en" ? UPLOAD_TOO_LARGE_EN[category] : UPLOAD_TOO_LARGE_AR[category];
}

/**
 * Remap stale API copy (e.g. old 20 MB image message applied to PDFs)
 * to the correct client message for the file category.
 */
export function normalizeUploadErrorMessage(
  message: string,
  file: File | string,
  locale: "ar" | "en" = "ar",
): string {
  const trimmed = message.trim();
  if (!trimmed) return getUploadTooLargeMessage(file, locale);

  const category = getUploadLimitCategory(file);
  const looksLikeStaleSizeLimit =
    /20\s*ميجا|20\s*MB|50\s*ميجا|50\s*MB|ضغط الصورة|compress the image/i.test(trimmed);

  if (looksLikeStaleSizeLimit && (category === "document" || category === "audio" || category === "request")) {
    return getUploadTooLargeMessage(file, locale);
  }

  return trimmed;
}
