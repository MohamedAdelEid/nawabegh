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

export type UploadAdminMultiFileItem = {
  filePath: string;
  originalFileName: string;
  contentType: string;
  fileSize: number | null;
};

export type UploadAdminFilesResult =
  | { ok: true; files: UploadAdminMultiFileItem[]; message?: string }
  | { ok: false; errorMessage: string };
export type DeleteAdminUploadedFileResult =
  | { ok: true; message?: string }
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

function readNumber(record: UnknownRecord | null, keys: string[], fallback: number | null): number | null {
  if (!record) return fallback;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() !== "" && !Number.isNaN(Number(value))) {
      return Number(value);
    }
  }
  return fallback;
}

function extractUploadMultipleItems(data: unknown): UnknownRecord[] {
  const root = asRecord(data);
  if (!root) return [];

  const candidates: unknown[] = [root.files, asRecord(root.data)?.files, asRecord(asRecord(root.data)?.data)?.files];
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate.map((item) => asRecord(item)).filter((item): item is UnknownRecord => Boolean(item));
    }
  }

  return [];
}

export async function uploadAdminFiles(files: File[], folder: string): Promise<UploadAdminFilesResult> {
  if (files.length === 0) {
    return { ok: false, errorMessage: "No files selected" };
  }

  try {
    const formData = new FormData();
    formData.append("folder", folder);
    for (const file of files) {
      formData.append("files", file);
    }

    const response = await httpClient.post<unknown>({
      url: "/api/FileUpload/upload-multiple",
      data: formData,
      isFormData: true,
    });

    const rootRecord = asRecord(response);
    const message = readString(rootRecord, ["message"], "");
    const items = extractUploadMultipleItems(response)
      .map((item) => ({
        success: readBoolean(item, ["success"], false),
        filePath: readString(item, ["filePath", "fileUrl", "url", "path"], "").trim(),
        originalFileName: readString(item, ["originalFileName", "storedFileName"], "").trim(),
        contentType: readString(item, ["contentType"], "").trim(),
        fileSize: readNumber(item, ["fileSize"], null),
      }))
      .filter((item) => item.success && item.filePath);

    if (items.length === 0) {
      return { ok: false, errorMessage: message || "Upload failed" };
    }

    return {
      ok: true,
      files: items,
      message: message || undefined,
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Upload failed";
    return { ok: false, errorMessage: msg };
  }
}

export async function deleteAdminUploadedFile(
  filePath: string,
): Promise<DeleteAdminUploadedFileResult> {
  const normalizedPath = filePath.trim();
  if (!normalizedPath) {
    return { ok: false, errorMessage: "File path is required" };
  }

  try {
    const response = await httpClient.delete<unknown>({
      url: "/api/FileUpload/delete",
      params: { filePath: normalizedPath },
    });

    const record = asRecord(response);
    const success = readBoolean(record, ["success"], false);
    const message = readString(record, ["message"], "").trim();

    if (!success) {
      return { ok: false, errorMessage: message || "Delete failed" };
    }

    return { ok: true, message: message || undefined };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Delete failed";
    return { ok: false, errorMessage: msg };
  }
}
