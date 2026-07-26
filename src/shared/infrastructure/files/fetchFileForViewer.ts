import axios, { type AxiosResponse } from "axios";
import axiosClient from "@/shared/infrastructure/http/axiosClient";
import {
  isApiHostedUrl,
  resolveProtectedFileUrl,
} from "@/shared/infrastructure/files/fileUrl";

export type FetchFileFailureReason = "not_found" | "failed";

export type FetchFileResult =
  | { ok: true; data: ArrayBuffer }
  | { ok: false; reason: FetchFileFailureReason };

function failure(reason: FetchFileFailureReason): FetchFileResult {
  return { ok: false, reason };
}

function success(data: ArrayBuffer): FetchFileResult {
  return { ok: true, data };
}

function reasonFromHttpStatus(status: number | undefined): FetchFileFailureReason {
  return status === 404 ? "not_found" : "failed";
}

/** Large PDFs / PPTX through FileUpload/download can exceed the default API timeout. */
const FILE_VIEWER_TIMEOUT_MS = 120_000;

/**
 * Loads a file for in-browser viewers (e.g. react-pdf).
 * Prefer authenticated FileUpload/download for stored uploads (including S3-backed
 * absolute URLs rewritten by `resolveProtectedFileUrl`). Only hit external URLs
 * without the login token when they are not our API.
 */
export async function fetchFileForViewer(pathOrUrl: string): Promise<FetchFileResult> {
  const trimmed = pathOrUrl.trim();
  if (!trimmed) return failure("failed");

  if (trimmed.startsWith("blob:")) {
    try {
      const response = await fetch(trimmed);
      if (!response.ok) return failure(reasonFromHttpStatus(response.status));
      const data = await response.arrayBuffer();
      return data.byteLength > 0 ? success(data) : failure("failed");
    } catch {
      return failure("failed");
    }
  }

  const url = resolveProtectedFileUrl(trimmed);
  if (!url) return failure("failed");

  try {
    // External non-upload hosts only — never send the login Bearer to S3.
    if (!isApiHostedUrl(url)) {
      const response = await fetch(url);
      if (!response.ok) return failure(reasonFromHttpStatus(response.status));
      const data = await response.arrayBuffer();
      return data.byteLength > 0 ? success(data) : failure("failed");
    }

    const response: AxiosResponse<ArrayBuffer> = await axiosClient.get(url, {
      responseType: "arraybuffer",
      timeout: FILE_VIEWER_TIMEOUT_MS,
      // Default instance Content-Type: application/json forces a CORS preflight
      // and can break FileUpload/download from the browser. Navigation works
      // without that header — strip it for binary GETs.
      headers: {
        "Content-Type": false,
      },
      transformRequest: [
        (data, headers) => {
          if (headers && typeof headers === "object") {
            delete (headers as Record<string, unknown>)["Content-Type"];
            delete (headers as Record<string, unknown>)["content-type"];
          }
          return data;
        },
      ],
    });
    const data = response.data;
    if (data instanceof ArrayBuffer && data.byteLength > 0) {
      // Guard against JSON error payloads returned as arraybuffer.
      if (looksLikeJsonErrorPayload(data)) return failure("failed");
      return success(data);
    }

    return failure("failed");
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return failure(reasonFromHttpStatus(error.response?.status));
    }
    return failure("failed");
  }
}

function looksLikeJsonErrorPayload(data: ArrayBuffer): boolean {
  if (data.byteLength < 2 || data.byteLength > 8_192) return false;
  try {
    const text = new TextDecoder().decode(data).trim();
    if (!text.startsWith("{") && !text.startsWith("[")) return false;
    const parsed = JSON.parse(text) as { isSuccess?: boolean; statusCode?: number };
    return parsed.isSuccess === false || typeof parsed.statusCode === "number";
  } catch {
    return false;
  }
}

/** @deprecated Prefer `fetchFileForViewer` when you need to distinguish 404. */
export async function fetchFileAsArrayBuffer(pathOrUrl: string): Promise<ArrayBuffer | null> {
  const result = await fetchFileForViewer(pathOrUrl);
  return result.ok ? result.data : null;
}
