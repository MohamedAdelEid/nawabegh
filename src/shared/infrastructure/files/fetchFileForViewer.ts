import type { AxiosResponse } from "axios";
import axiosClient from "@/shared/infrastructure/http/axiosClient";
import { resolveProtectedFileUrl } from "@/shared/infrastructure/files/fileUrl";

/**
 * Loads a file for in-browser viewers (e.g. react-pdf) with auth headers.
 * Uses `pdfUrl` from InteractiveBook API via FileUpload/download (not public URL).
 */
export async function fetchFileAsArrayBuffer(pathOrUrl: string): Promise<ArrayBuffer | null> {
  const trimmed = pathOrUrl.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("blob:")) {
    try {
      const response = await fetch(trimmed);
      if (!response.ok) return null;
      return response.arrayBuffer();
    } catch {
      return null;
    }
  }

  const url = resolveProtectedFileUrl(trimmed);
  if (!url) return null;

  try {
    const response: AxiosResponse<ArrayBuffer> = await axiosClient.get(url, {
      responseType: "arraybuffer",
    });
    const data = response.data;
    if (data instanceof ArrayBuffer && data.byteLength > 0) return data;

    // Some servers mislabel PDF responses; accept non-empty buffers anyway.
    if (data instanceof ArrayBuffer) return data.byteLength > 0 ? data : null;

    return null;
  } catch {
    return null;
  }
}
