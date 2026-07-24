import { env } from "@/shared/infrastructure/config/env";

const apiBase = env.NEXT_PUBLIC_API_URL.replace(/\/+$/, "");

export const FILE_UPLOAD_URL = `${apiBase}/api/FileUpload/upload`;

export const FILE_DOWNLOAD_URL = `${apiBase}/api/FileUpload/download?filePath=`;

export const FILE_PUBLIC_BASE_URL = `${env.NEXT_PUBLIC_FILE_PUBLIC_BASE_URL.replace(/\/+$/, "")}/`;

/**
 * True when `url` targets our API host (relative API paths or absolute API URLs).
 * External file hosts (e.g. S3/CDN) must not receive the login Bearer token.
 */
export function isApiHostedUrl(url: string, baseUrl: string = apiBase): boolean {
  const trimmed = url.trim();
  if (!trimmed) return false;

  try {
    const resolved = new URL(trimmed, `${baseUrl.replace(/\/+$/, "")}/`);
    const api = baseUrl.replace(/\/+$/, "");
    return resolved.origin === new URL(api).origin;
  } catch {
    return !/^https?:\/\//i.test(trimmed);
  }
}

/**
 * Extracts a stored relative upload path (`uploads/...`) from a path or absolute URL.
 * S3/CDN absolute URLs are private — callers should use FileUpload/download with auth.
 */
export function extractUploadFilePath(pathOrUrl: string | null | undefined): string | null {
  if (!pathOrUrl) return null;
  const value = pathOrUrl.trim();
  if (!value) return null;

  if (!/^https?:\/\//i.test(value)) {
    const normalized = value.replace(/^\/+/, "");
    return normalized || null;
  }

  try {
    const pathname = new URL(value).pathname.replace(/^\/+/, "");
    if (!pathname) return null;
    const uploadsIndex = pathname.indexOf("uploads/");
    if (uploadsIndex >= 0) return pathname.slice(uploadsIndex);
    return pathname;
  } catch {
    return null;
  }
}

/**
 * Normalizes a backend-provided file path (or absolute URL) into a URL that can
 * be passed directly to <img src />, downloads, or any other consumer.
 *
 * Resolution order:
 *  1. Empty / whitespace -> null
 *  2. Absolute URL (http/https) -> returned as-is (including S3/CDN)
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
 * Absolute S3/CDN URLs are rewritten to the API download endpoint so the Bearer
 * token goes to our API — never to Amazon S3 (which rejects it / denies public GET).
 *
 * Example `pdfUrl` from InteractiveBook API:
 * `uploads/interactive-books/file_9432894be1994f62b61846489ee35a8e.pdf`
 */
export function resolveProtectedFileUrl(pathOrUrl: string | null | undefined): string | null {
  if (!pathOrUrl) return null;
  const value = pathOrUrl.trim();
  if (!value) return null;

  if (value.startsWith("http://") || value.startsWith("https://")) {
    if (isApiHostedUrl(value)) return value;
    const uploadPath = extractUploadFilePath(value);
    if (uploadPath) {
      return `${FILE_DOWNLOAD_URL}${encodeURIComponent(uploadPath)}`;
    }
    return value;
  }

  const normalizedPath = value.replace(/^\/+/, "");
  return `${FILE_DOWNLOAD_URL}${encodeURIComponent(normalizedPath)}`;
}
