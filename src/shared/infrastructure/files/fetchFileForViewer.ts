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
    });
    const data = response.data;
    if (data instanceof ArrayBuffer && data.byteLength > 0) return success(data);

    return failure("failed");
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return failure(reasonFromHttpStatus(error.response?.status));
    }
    return failure("failed");
  }
}

/** @deprecated Prefer `fetchFileForViewer` when you need to distinguish 404. */
export async function fetchFileAsArrayBuffer(pathOrUrl: string): Promise<ArrayBuffer | null> {
  const result = await fetchFileForViewer(pathOrUrl);
  return result.ok ? result.data : null;
}
