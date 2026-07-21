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
    if (typeof value === "string" && value.trim()) return value.trim();
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

function readUploadSuccess(record: UnknownRecord | null): boolean {
  return readBoolean(record, ["success"], false) || readBoolean(record, ["isSuccess"], false);
}

function extractRelativeUploadPath(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";

  if (!/^https?:\/\//i.test(trimmed)) {
    return trimmed.replace(/^\/+/, "");
  }

  try {
    const pathname = new URL(trimmed).pathname.replace(/^\/+/, "");
    if (pathname.startsWith("uploads/")) return pathname;
  } catch {
    // Fall back to the original value below.
  }

  return trimmed;
}

function normalizeUploadFilePath(record: UnknownRecord): string {
  const filePath = extractRelativeUploadPath(readString(record, ["filePath"]));
  if (filePath) return filePath;

  const fileUrl = readString(record, ["fileUrl", "url", "path"]);
  return extractRelativeUploadPath(fileUrl);
}

function hasUploadPath(record: UnknownRecord | null): boolean {
  return Boolean(readString(record, ["filePath", "fileUrl", "url", "path"], "").trim());
}

function uploadRecordFromString(value: string): UnknownRecord | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      return unwrapUploadRecord(JSON.parse(trimmed));
    } catch {
      // Treat the raw string as a stored path below.
    }
  }

  return {
    success: true,
    filePath: extractRelativeUploadPath(trimmed),
  };
}

/** Backend may return the payload at the root, under `data`, or nested further. */
export function unwrapUploadRecord(data: unknown): UnknownRecord | null {
  if (typeof data === "string") {
    return uploadRecordFromString(data);
  }

  const root = asRecord(data);
  if (!root) return null;
  if (hasUploadPath(root)) return root;

  const level1Value = root.data;
  if (typeof level1Value === "string") {
    return uploadRecordFromString(level1Value);
  }

  const level1 = asRecord(level1Value);
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

    const filePath = normalizeUploadFilePath(record);
    const message = readString(record, ["message"]);
    const explicitSuccess = readUploadSuccess(record);
    const hasPath = Boolean(filePath);

    // Some responses omit `success` but still return `filePath`.
    if (!hasPath && !explicitSuccess) {
      return { ok: false, errorMessage: message || "Upload failed" };
    }
    if (!hasPath) {
      return { ok: false, errorMessage: message || "Upload failed: missing file path" };
    }

    return { ok: true, filePath, message: message || undefined };
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

function unwrapUploadMultipleEnvelope(data: unknown): UnknownRecord | null {
  const root = asRecord(data);
  if (!root) return null;

  if (Array.isArray(root.files)) return root;

  const level1 = asRecord(root.data);
  if (level1 && Array.isArray(level1.files)) return level1;

  const level2 = level1 ? asRecord(level1.data) : null;
  if (level2 && Array.isArray(level2.files)) return level2;

  return root;
}

function extractUploadMultipleItems(data: unknown): UnknownRecord[] {
  const envelope = unwrapUploadMultipleEnvelope(data);
  if (!envelope || !Array.isArray(envelope.files)) return [];

  return envelope.files
    .map((item) => asRecord(item))
    .filter((item): item is UnknownRecord => Boolean(item));
}

function mapUploadMultipleItems(data: unknown): UploadAdminMultiFileItem[] {
  return extractUploadMultipleItems(data)
    .map((item) => ({
      success: readBoolean(item, ["success"], true),
      filePath: readString(item, ["filePath", "fileUrl", "url", "path"], "").trim(),
      originalFileName: readString(item, ["originalFileName", "storedFileName"], "").trim(),
      contentType: readString(item, ["contentType"], "").trim(),
      fileSize: readNumber(item, ["fileSize"], null),
    }))
    .filter((item) => item.success && item.filePath)
    .map(({ filePath, originalFileName, contentType, fileSize }) => ({
      filePath,
      originalFileName,
      contentType,
      fileSize,
    }));
}

function isRequestEntityTooLargeError(error: unknown): boolean {
  const axiosError = asRecord(error);
  const response = asRecord(axiosError?.response);
  const status = readNumber(response, ["status"], null);
  if (status === 413) return true;

  const message = error instanceof Error ? error.message : String(error ?? "");
  return /413|request entity too large|payload too large/i.test(message);
}

async function uploadAdminFilesBatch(
  files: File[],
  folder: string,
): Promise<UploadAdminFilesResult> {
  const formData = new FormData();
  formData.append("folder", folder);
  for (const file of files) {
    formData.append("files", file);
  }

  const response = await httpClient.post<unknown>({
    url: "/api/FileUpload/upload-multiple",
    data: formData,
    isFormData: true,
    timeout: 0,
  });

  const envelope = unwrapUploadMultipleEnvelope(response);
  const message =
    readString(envelope, ["message"], "") ||
    readString(asRecord(response), ["message"], "");
  const items = mapUploadMultipleItems(response);

  if (items.length === 0) {
    return { ok: false, errorMessage: message.trim() || "Upload failed" };
  }

  return {
    ok: true,
    files: items,
    message: message.trim() || undefined,
  };
}

/**
 * Uploads multiple files via `/api/FileUpload/upload-multiple`.
 * Sends files one-by-one to avoid 413 (Request Entity Too Large) from reverse proxies.
 */
export async function uploadAdminFiles(files: File[], folder: string): Promise<UploadAdminFilesResult> {
  if (files.length === 0) {
    return { ok: false, errorMessage: "No files selected" };
  }

  const uploaded: UploadAdminMultiFileItem[] = [];

  for (const file of files) {
    try {
      const result = await uploadAdminFilesBatch([file], folder);
      if (!result.ok) {
        if (uploaded.length === 0) {
          return result;
        }
        continue;
      }
      uploaded.push(...result.files);
    } catch (error) {
      if (isRequestEntityTooLargeError(error)) {
        return {
          ok: false,
          errorMessage:
            uploaded.length > 0
              ? `${uploaded.length} file(s) uploaded, then failed: "${file.name}" is too large for the server limit.`
              : `File "${file.name}" is too large for the server upload limit (413).`,
        };
      }
      const msg = error instanceof Error ? error.message : "Upload failed";
      if (uploaded.length === 0) {
        return { ok: false, errorMessage: msg };
      }
    }
  }

  if (uploaded.length === 0) {
    return { ok: false, errorMessage: "Upload failed" };
  }

  return {
    ok: true,
    files: uploaded,
    message: `${uploaded.length} out of ${files.length} files uploaded successfully`,
  };
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
