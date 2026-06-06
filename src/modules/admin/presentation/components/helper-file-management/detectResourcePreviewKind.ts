export type ResourcePreviewKind =
  | "pdf"
  | "docx"
  | "doc-legacy"
  | "image"
  | "video"
  | "audio"
  | "iframe"
  | "unsupported";

const DOCX_EXTENSIONS = new Set(["docx"]);
const DOC_LEGACY_EXTENSIONS = new Set(["doc"]);
const IMAGE_EXTENSIONS = new Set(["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp"]);
const VIDEO_EXTENSIONS = new Set(["mp4", "webm", "ogg", "mov", "m4v"]);
const AUDIO_EXTENSIONS = new Set(["mp3", "wav", "ogg", "m4a", "aac"]);
const IFRAME_EXTENSIONS = new Set(["txt", "html", "htm"]);

function extensionFromPath(pathOrUrl: string) {
  const withoutQuery = pathOrUrl.split(/[?#]/)[0] ?? pathOrUrl;
  const segment = withoutQuery.split("/").pop() ?? "";
  const dot = segment.lastIndexOf(".");
  if (dot <= 0) return "";
  return segment.slice(dot + 1).toLowerCase();
}

export function detectResourcePreviewKind(
  fileUrl: string,
  fileType?: string | null,
): ResourcePreviewKind {
  const normalizedType = (fileType ?? "").trim().toLowerCase();
  const extension = extensionFromPath(fileUrl);

  if (normalizedType.includes("pdf") || extension === "pdf") return "pdf";
  if (
    normalizedType.includes("wordprocessingml") ||
    normalizedType.includes("officedocument.wordprocessingml") ||
    normalizedType.includes("docx") ||
    DOCX_EXTENSIONS.has(extension)
  ) {
    return "docx";
  }
  if (
    normalizedType.includes("msword") ||
    normalizedType === "application/doc" ||
    DOC_LEGACY_EXTENSIONS.has(extension)
  ) {
    return "doc-legacy";
  }
  if (
    normalizedType.startsWith("image/") ||
    normalizedType.includes("image") ||
    IMAGE_EXTENSIONS.has(extension)
  ) {
    return "image";
  }
  if (
    normalizedType.startsWith("video/") ||
    normalizedType.includes("video") ||
    VIDEO_EXTENSIONS.has(extension)
  ) {
    return "video";
  }
  if (
    normalizedType.startsWith("audio/") ||
    normalizedType.includes("audio") ||
    AUDIO_EXTENSIONS.has(extension)
  ) {
    return "audio";
  }
  if (IFRAME_EXTENSIONS.has(extension)) return "iframe";

  return "unsupported";
}

export function mimeTypeForPreviewKind(kind: ResourcePreviewKind): string {
  switch (kind) {
    case "pdf":
      return "application/pdf";
    case "docx":
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    case "image":
      return "image/*";
    case "video":
      return "video/mp4";
    case "audio":
      return "audio/mpeg";
    default:
      return "application/octet-stream";
  }
}
