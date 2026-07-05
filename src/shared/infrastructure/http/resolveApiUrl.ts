import { env } from "@/shared/infrastructure/config/env";

const API_PREFIX = env.NEXT_PUBLIC_API_VERSION_PREFIX.replace(/\/+$/, "") || "/api/v1";

/**
 * Ensures relative API paths include the version prefix (default `/api/v1`).
 * Absolute URLs and paths that already start with `/api/` are left unchanged.
 */
export function resolveApiUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  const normalized = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;

  if (normalized.startsWith(`${API_PREFIX}/`) || normalized === API_PREFIX) {
    return normalized;
  }

  if (normalized.startsWith("/api/")) {
    return normalized;
  }

  const suffix = normalized.replace(/^\/+/, "");
  return `${API_PREFIX}/${suffix}`;
}
