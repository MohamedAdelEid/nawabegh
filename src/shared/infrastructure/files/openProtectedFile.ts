import { fetchFileForViewer } from "@/shared/infrastructure/files/fetchFileForViewer";
import {
  isApiHostedUrl,
  resolveProtectedFileUrl,
} from "@/shared/infrastructure/files/fileUrl";

export type OpenProtectedFileResult =
  | { ok: true }
  | { ok: false; reason: "not_found" | "failed" | "empty" };

function guessMimeType(fileName?: string): string {
  const ext = fileName?.split(".").pop()?.toLowerCase() ?? "";
  switch (ext) {
    case "pdf":
      return "application/pdf";
    case "png":
      return "image/png";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "webp":
      return "image/webp";
    case "gif":
      return "image/gif";
    case "mp4":
      return "video/mp4";
    case "mp3":
      return "audio/mpeg";
    case "pptx":
      return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
    case "docx":
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    default:
      return "application/octet-stream";
  }
}

/**
 * Opens a stored upload (including private S3-backed paths) via authenticated
 * FileUpload/download, then shows the blob in a new tab / download.
 * Never navigates the browser to raw S3/CDN URLs (those return AccessDenied).
 */
export async function openProtectedFile(
  pathOrUrl: string | null | undefined,
  options?: { fileName?: string; download?: boolean },
): Promise<OpenProtectedFileResult> {
  const trimmed = pathOrUrl?.trim();
  if (!trimmed) return { ok: false, reason: "empty" };

  const protectedUrl = resolveProtectedFileUrl(trimmed);
  if (!protectedUrl) return { ok: false, reason: "empty" };

  // External non-upload hosts only — open directly without auth rewrite.
  if (!isApiHostedUrl(protectedUrl) && /^https?:\/\//i.test(protectedUrl)) {
    window.open(protectedUrl, "_blank", "noopener,noreferrer");
    return { ok: true };
  }

  const result = await fetchFileForViewer(protectedUrl);
  if (!result.ok) return { ok: false, reason: result.reason };

  const mime = guessMimeType(options?.fileName);
  const blob = new Blob([result.data], { type: mime });
  const objectUrl = URL.createObjectURL(blob);

  try {
    if (options?.download && options.fileName) {
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = options.fileName;
      anchor.rel = "noopener noreferrer";
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
    } else {
      const opened = window.open(objectUrl, "_blank", "noopener,noreferrer");
      if (!opened && options?.fileName) {
        const anchor = document.createElement("a");
        anchor.href = objectUrl;
        anchor.download = options.fileName;
        anchor.rel = "noopener noreferrer";
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
      }
    }
  } finally {
    // Keep blob alive long enough for the new tab to load.
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
  }

  return { ok: true };
}
