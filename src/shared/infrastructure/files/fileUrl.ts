import { env } from "@/shared/infrastructure/config/env";

export const FILE_UPLOAD_URL =
  "https://nawabeghsystem.runasp.net/api/FileUpload/upload";

export const FILE_DOWNLOAD_URL =
  "https://nawabeghsystem.runasp.net/api/FileUpload/download?filePath=";

export const FILE_PUBLIC_BASE_URL = `${env.NEXT_PUBLIC_FILE_PUBLIC_BASE_URL.replace(/\/+$/, "")}/`;

/**
 * Normalizes a backend-provided file path (or absolute URL) into a URL that can
 * be passed directly to <img src />, downloads, or any other consumer.
 *
 * Resolution order:
 *  1. Empty / whitespace -> null
 *  2. Absolute URL (http/https) -> returned as-is
 *  3. Path under `uploads/` -> served inline via the public base URL
 *  4. Anything else -> routed through the explicit FileUpload/download endpoint
 */
export function resolveFileUrl(pathOrUrl: string | null | undefined): string | null {
  if (!pathOrUrl) return null;
  const value = pathOrUrl.trim();
  if (!value) return null;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;

  const normalizedPath = value.replace(/^\/+/, "");
  if (normalizedPath.startsWith("uploads/")) {
    return `${FILE_PUBLIC_BASE_URL}${normalizedPath}`;
  }
  return `${FILE_DOWNLOAD_URL}${encodeURIComponent(normalizedPath)}`;
}

/**
 * Resolves a stored file path for authenticated download (FileUpload/download).
 * Use for PDF viewers and other clients that must send the API bearer token.
 *
 * Example `pdfUrl` from InteractiveBook API:
 * `uploads/interactive-books/file_9432894be1994f62b61846489ee35a8e.pdf`
 */
export function resolveProtectedFileUrl(pathOrUrl: string | null | undefined): string | null {
  if (!pathOrUrl) return null;
  const value = pathOrUrl.trim();
  if (!value) return null;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;

  const normalizedPath = value.replace(/^\/+/, "");
  return `${FILE_DOWNLOAD_URL}${encodeURIComponent(normalizedPath)}`;
}
