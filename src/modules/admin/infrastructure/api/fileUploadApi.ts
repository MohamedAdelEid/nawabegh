import { FILE_UPLOAD_URL } from "@/shared/infrastructure/files/fileUrl";
import { httpClient } from "@/shared/infrastructure/http/httpClient";

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord | null {
  return value !== null && typeof value === "object" ? (value as UnknownRecord) : null;
}

function readString(record: UnknownRecord | null, keys: string[], fallback = ""): string {
  if (!record) return fallback;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string") return value;
  }
  return fallback;
}

function readBoolean(record: UnknownRecord | null, keys: string[], fallback: boolean): boolean {
  if (!record) return fallback;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "boolean") return value;
  }
  return fallback;
}

/** Backend may return the payload at the root or under `data`. */
function unwrapUploadRecord(data: unknown): UnknownRecord | null {
  const root = asRecord(data);
  if (!root) return null;
  const nested = asRecord(root.data);
  return nested ?? root;
}

export const QUESTION_BANK_UPLOAD_FOLDER = "questions";

export type UploadAdminFileResult =
  | { ok: true; filePath: string; message?: string }
  | { ok: false; errorMessage: string };

/**
 * Uploads a file via the shared FileUpload endpoint (same contract as user image upload).
 */
export async function uploadAdminFile(file: File, folder: string): Promise<UploadAdminFileResult> {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    const response = await httpClient.post<unknown>({
      url: FILE_UPLOAD_URL,
      data: formData,
      isFormData: true,
    });

    const record = unwrapUploadRecord(response.data);
    if (!record) {
      return { ok: false, errorMessage: "Invalid upload response" };
    }

    const success = readBoolean(record, ["success"], false);
    const filePath = readString(record, ["filePath"]);
    const message = readString(record, ["message"]);

    if (!success || !filePath.trim()) {
      return { ok: false, errorMessage: message.trim() || "Upload failed" };
    }

    return { ok: true, filePath: filePath.trim(), message: message.trim() || undefined };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Upload failed";
    return { ok: false, errorMessage: msg };
  }
}
