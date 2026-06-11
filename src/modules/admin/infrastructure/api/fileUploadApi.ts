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

function hasUploadPath(record: UnknownRecord | null): boolean {
  return Boolean(readString(record, ["filePath", "fileUrl", "url", "path"], "").trim());
}

/** Backend may return the payload at the root, under `data`, or nested further. */
export function unwrapUploadRecord(data: unknown): UnknownRecord | null {
  const root = asRecord(data);
  if (!root) return null;
  if (hasUploadPath(root)) return root;

  const level1 = asRecord(root.data);
  if (level1 && hasUploadPath(level1)) return level1;

  const level2 = level1 ? asRecord(level1.data) : null;
  if (level2 && hasUploadPath(level2)) return level2;

  return level1 ?? root;
}

export const QUESTION_BANK_UPLOAD_FOLDER = "questions";
export const SUBJECT_ICON_UPLOAD_FOLDER = "subjects/icons";
export const BADGE_ICON_UPLOAD_FOLDER = "badges/icons";
export const SUPPORT_TICKET_ATTACHMENT_FOLDER = "support-tickets/attachments";

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

    const record = unwrapUploadRecord(response);
    if (!record) {
      return { ok: false, errorMessage: "Invalid upload response" };
    }

    const filePath = readString(record, ["filePath", "fileUrl", "url", "path"]);
    const message = readString(record, ["message"]);
    const explicitSuccess = readBoolean(record, ["success"], false);
    const hasPath = Boolean(filePath.trim());

    // Some responses omit `success` but still return `filePath`.
    if (!hasPath && !explicitSuccess) {
      return { ok: false, errorMessage: message.trim() || "Upload failed" };
    }
    if (!hasPath) {
      return { ok: false, errorMessage: message.trim() || "Upload failed: missing file path" };
    }

    return { ok: true, filePath: filePath.trim(), message: message.trim() || undefined };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Upload failed";
    return { ok: false, errorMessage: msg };
  }
}
