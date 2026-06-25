import type {
  TeacherChatConversationData,
  TeacherChatGroupSettings,
  TeacherChatMembersData,
} from "@/modules/teacher/domain/types/teacher.types";
import {
  mapChatConversationWorkspace,
  mapChatMembersWorkspace,
} from "@/modules/teacher/domain/utils/teacherChatMappers";
import type { BackendApiResponse } from "@/shared/domain/types/api.types";
import { httpClient } from "@/shared/infrastructure/http/httpClient";
import { parseXPaginationHeader } from "@/shared/infrastructure/http/xPagination";

const CHAT_BASE = "/api/v1/Chat";

type UnknownRecord = Record<string, unknown>;

export type ChatSettingsDto = {
  courseId: string;
  displayName: string;
  subjectId: number;
  subjectNameAr: string;
  isLocked: boolean;
  isTeachersOnly: boolean;
  allowAttachments: boolean;
  allowImages: boolean;
  allowDocuments: boolean;
  allowWebLinks: boolean;
  allowParentView: boolean;
};

export type ChatMessageAttachmentDto = {
  id: string;
  attachmentType: number;
  url: string;
  previewUrl: string | null;
  fileName: string;
  mimeType: string;
  sizeInBytes: number;
};

export type ChatMessageDto = {
  id: string;
  content: string | null;
  attachmentUrl: string | null;
  replyToMessageId: string | null;
  replyToPreview: string | null;
  senderId: string;
  senderName: string;
  isPinned: boolean;
  createdAt: string;
  attachments: ChatMessageAttachmentDto[];
  reactions: Array<{ emoji: string; count: number; reactedByCurrentUser: boolean }>;
};

export type ChatGroupDetailsDto = {
  groupName: string;
  description: string;
  coverImageUrl: string | null;
  createdAt: string;
  participantsCount: number;
  mediaCount: number;
  filesCount: number;
  isMuted: boolean;
  isPinnedInList: boolean;
};

export type ChatParticipantDto = {
  userId: string;
  fullName: string;
  profileImageUrl: string | null;
  role: string;
  isGroupAdmin: boolean;
};

export type ChatMediaItemDto = {
  id: string;
  url: string;
  previewUrl: string | null;
  fileName: string;
  sharedAt: string;
  senderName: string;
};

export type ChatFileItemDto = {
  id: string;
  url: string;
  previewUrl: string | null;
  fileName: string;
  sizeInBytes: number;
  sharedAt: string;
  senderName: string;
  attachmentType: number;
};

export type SendChatMessagePayload = {
  content?: string;
  replyToMessageId?: string | null;
  attachments?: Array<{
    attachmentType: number;
    url: string;
    fileName: string;
    mimeType: string;
    sizeInBytes: number;
    previewUrl?: string | null;
  }>;
};

export type UpdateInChatSettingsPayload = {
  displayName: string;
  isTeachersOnly: boolean;
  allowImages: boolean;
  allowDocuments: boolean;
  allowWebLinks: boolean;
  allowParentView: boolean;
};

export type ChatMessagesPage = {
  messages: ChatMessageDto[];
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNext: boolean;
};

function asRecord(value: unknown): UnknownRecord | null {
  return value !== null && typeof value === "object" ? (value as UnknownRecord) : null;
}

function readString(record: UnknownRecord | null, keys: string[], fallback = ""): string {
  if (!record) return fallback;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string") return value;
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
  }
  return fallback;
}

function readNumber(record: UnknownRecord | null, keys: string[], fallback?: number): number | null {
  if (!record) return fallback ?? null;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() !== "" && !Number.isNaN(Number(value))) {
      return Number(value);
    }
  }
  return fallback ?? null;
}

function readBoolean(record: UnknownRecord | null, keys: string[], fallback = false): boolean {
  if (!record) return fallback;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "boolean") return value;
  }
  return fallback;
}

function readNullableString(record: UnknownRecord | null, keys: string[]): string | null {
  const value = readString(record, keys, "").trim();
  return value || null;
}

function extractEnvelopeData(data: unknown): unknown {
  const record = asRecord(data);
  return record?.data ?? data;
}

function extractListRows(data: unknown): unknown[] {
  const unwrapped = extractEnvelopeData(data);
  if (Array.isArray(unwrapped)) return unwrapped;
  const record = asRecord(unwrapped);
  if (!record) return [];
  for (const key of ["items", "results", "records", "list", "rows", "data"]) {
    const value = record[key];
    if (Array.isArray(value)) return value;
  }
  return [];
}

function assertSuccess(response: BackendApiResponse<unknown>, fallbackMessage: string): void {
  if (response.status === "Success" || response.isSuccess) return;
  throw new Error(response.error?.message ?? fallbackMessage);
}

function mapSettings(record: UnknownRecord): ChatSettingsDto | null {
  const courseId = readString(record, ["courseId"], "").trim();
  const displayName = readString(record, ["displayName", "groupName"], "").trim();
  if (!courseId) return null;

  return {
    courseId,
    displayName: displayName || "—",
    subjectId: readNumber(record, ["subjectId"]) ?? 0,
    subjectNameAr: readString(record, ["subjectNameAr", "subjectName"], "—"),
    isLocked: readBoolean(record, ["isLocked"]),
    isTeachersOnly: readBoolean(record, ["isTeachersOnly"]),
    allowAttachments: readBoolean(record, ["allowAttachments"], true),
    allowImages: readBoolean(record, ["allowImages"], true),
    allowDocuments: readBoolean(record, ["allowDocuments"], true),
    allowWebLinks: readBoolean(record, ["allowWebLinks"], true),
    allowParentView: readBoolean(record, ["allowParentView"]),
  };
}

function mapAttachment(record: UnknownRecord): ChatMessageAttachmentDto | null {
  const id = readString(record, ["id"], "").trim();
  const url = readString(record, ["url"], "").trim();
  if (!id || !url) return null;

  return {
    id,
    attachmentType: readNumber(record, ["attachmentType"]) ?? 0,
    url,
    previewUrl: readNullableString(record, ["previewUrl"]),
    fileName: readString(record, ["fileName"], "file"),
    mimeType: readString(record, ["mimeType"], ""),
    sizeInBytes: readNumber(record, ["sizeInBytes"]) ?? 0,
  };
}

function mapMessage(record: UnknownRecord): ChatMessageDto | null {
  const id = readString(record, ["id"], "").trim();
  const senderId = readString(record, ["senderId"], "").trim();
  const senderName = readString(record, ["senderName"], "").trim();
  const createdAt = readString(record, ["createdAt"], "").trim();
  if (!id || !senderId || !createdAt) return null;

  return {
    id,
    content: readNullableString(record, ["content"]),
    attachmentUrl: readNullableString(record, ["attachmentUrl"]),
    replyToMessageId: readNullableString(record, ["replyToMessageId"]),
    replyToPreview: readNullableString(record, ["replyToPreview"]),
    senderId,
    senderName: senderName || "—",
    isPinned: readBoolean(record, ["isPinned"]),
    createdAt,
    attachments: extractListRows(record.attachments)
      .map((item) => mapAttachment(asRecord(item) ?? {}))
      .filter((item): item is ChatMessageAttachmentDto => item !== null),
    reactions: extractListRows(record.reactions)
      .map((item) => {
        const row = asRecord(item);
        if (!row) return null;
        const emoji = readString(row, ["emoji"], "").trim();
        if (!emoji) return null;
        return {
          emoji,
          count: readNumber(row, ["count"]) ?? 0,
          reactedByCurrentUser: readBoolean(row, [
            "reactedByCurrentUser",
            "isReactedByCurrentUser",
            "reactedByMe",
            "hasReacted",
          ]),
        };
      })
      .filter((item): item is ChatMessageDto["reactions"][number] => item !== null),
  };
}

function mapDetails(record: UnknownRecord): ChatGroupDetailsDto | null {
  const groupName = readString(record, ["groupName", "displayName"], "").trim();
  if (!groupName) return null;

  return {
    groupName,
    description: readString(record, ["description"], ""),
    coverImageUrl: readNullableString(record, ["coverImageUrl"]),
    createdAt: readString(record, ["createdAt"], ""),
    participantsCount: readNumber(record, ["participantsCount"]) ?? 0,
    mediaCount: readNumber(record, ["mediaCount"]) ?? 0,
    filesCount: readNumber(record, ["filesCount"]) ?? 0,
    isMuted: readBoolean(record, ["isMuted"]),
    isPinnedInList: readBoolean(record, ["isPinnedInList"]),
  };
}

function mapParticipant(record: UnknownRecord): ChatParticipantDto | null {
  const userId = readString(record, ["userId", "id"], "").trim();
  const fullName = readString(record, ["fullName", "name"], "").trim();
  if (!userId || !fullName) return null;

  return {
    userId,
    fullName,
    profileImageUrl: readNullableString(record, ["profileImageUrl", "avatarUrl"]),
    role: readString(record, ["role"], "Student"),
    isGroupAdmin: readBoolean(record, ["isGroupAdmin"]),
  };
}

function mapMediaItem(record: UnknownRecord): ChatMediaItemDto | null {
  const id = readString(record, ["id"], "").trim();
  const url = readString(record, ["url"], "").trim();
  if (!id || !url) return null;

  return {
    id,
    url,
    previewUrl: readNullableString(record, ["previewUrl"]),
    fileName: readString(record, ["fileName"], "image"),
    sharedAt: readString(record, ["sharedAt", "createdAt"], ""),
    senderName: readString(record, ["senderName"], ""),
  };
}

function mapFileItem(record: UnknownRecord): ChatFileItemDto | null {
  const id = readString(record, ["id"], "").trim();
  const url = readString(record, ["url"], "").trim();
  const fileName = readString(record, ["fileName"], "").trim();
  if (!id || !url || !fileName) return null;

  return {
    id,
    url,
    previewUrl: readNullableString(record, ["previewUrl"]),
    fileName,
    sizeInBytes: readNumber(record, ["sizeInBytes"]) ?? 0,
    sharedAt: readString(record, ["sharedAt", "createdAt"], ""),
    senderName: readString(record, ["senderName"], ""),
    attachmentType: readNumber(record, ["attachmentType"]) ?? 2,
  };
}

function extractPageMeta(
  data: unknown,
  rowCount: number,
  pageNumber: number,
  pageSize: number,
  headerMeta?: ReturnType<typeof parseXPaginationHeader>,
) {
  if (headerMeta) {
    return {
      currentPage: headerMeta.currentPage,
      pageSize: headerMeta.pageSize,
      totalCount: headerMeta.totalCount,
      totalPages: headerMeta.totalPages,
      hasNext: headerMeta.currentPage < headerMeta.totalPages,
    };
  }

  const record = asRecord(extractEnvelopeData(data));
  const metaRecord = asRecord(record?.metaData) ?? record;
  const totalCount = readNumber(metaRecord, ["totalCount", "total", "count"]) ?? rowCount;
  const currentPage = readNumber(metaRecord, ["pageNumber", "currentPage", "page"]) ?? pageNumber;
  const resolvedPageSize = readNumber(metaRecord, ["pageSize", "limit", "size"]) ?? pageSize;
  const totalPages =
    readNumber(metaRecord, ["totalPages", "pagesCount"]) ??
    Math.max(1, Math.ceil(totalCount / Math.max(resolvedPageSize, 1)));
  const hasNext = readBoolean(metaRecord, ["hasNext"], currentPage < totalPages);

  return {
    currentPage,
    pageSize: resolvedPageSize,
    totalCount,
    totalPages,
    hasNext,
  };
}

export async function fetchChatSettings(courseId: string): Promise<ChatSettingsDto> {
  const response = await httpClient.get<unknown>({
    url: `${CHAT_BASE}/${encodeURIComponent(courseId)}/settings`,
  });
  assertSuccess(response, "Failed to load chat settings");

  const payload = asRecord(extractEnvelopeData(response.data));
  const mapped = payload ? mapSettings(payload) : null;
  if (!mapped) throw new Error("Invalid chat settings response");
  return mapped;
}

export async function fetchChatMessages(
  courseId: string,
  params: { pageNumber?: number; pageSize?: number } = {},
): Promise<ChatMessagesPage> {
  const pageNumber = params.pageNumber ?? 1;
  const pageSize = params.pageSize ?? 50;

  const response = await httpClient.get<unknown>({
    url: `${CHAT_BASE}/${encodeURIComponent(courseId)}/messages`,
    params: { pageNumber, pageSize },
  });
  assertSuccess(response, "Failed to load chat messages");

  const rows = extractListRows(response.data)
    .map((item) => mapMessage(asRecord(item) ?? {}))
    .filter((item): item is ChatMessageDto => item !== null);
  const headerMeta = parseXPaginationHeader(response.headers ?? {});
  const meta = extractPageMeta(response.data, rows.length, pageNumber, pageSize, headerMeta);

  return { messages: rows, ...meta };
}

export async function fetchChatDetails(courseId: string): Promise<ChatGroupDetailsDto> {
  const response = await httpClient.get<unknown>({
    url: `${CHAT_BASE}/${encodeURIComponent(courseId)}/details`,
  });
  assertSuccess(response, "Failed to load chat details");

  const payload = asRecord(extractEnvelopeData(response.data));
  const mapped = payload ? mapDetails(payload) : null;
  if (!mapped) throw new Error("Invalid chat details response");
  return mapped;
}

export async function fetchChatParticipants(courseId: string): Promise<ChatParticipantDto[]> {
  const response = await httpClient.get<unknown>({
    url: `${CHAT_BASE}/${encodeURIComponent(courseId)}/participants`,
  });
  assertSuccess(response, "Failed to load chat participants");

  return extractListRows(response.data)
    .map((item) => mapParticipant(asRecord(item) ?? {}))
    .filter((item): item is ChatParticipantDto => item !== null);
}

export async function fetchChatMedia(
  courseId: string,
  params: { pageNumber?: number; pageSize?: number } = {},
): Promise<{ items: ChatMediaItemDto[]; totalCount: number }> {
  const pageNumber = params.pageNumber ?? 1;
  const pageSize = params.pageSize ?? 30;

  const response = await httpClient.get<unknown>({
    url: `${CHAT_BASE}/${encodeURIComponent(courseId)}/media`,
    params: { pageNumber, pageSize },
  });
  assertSuccess(response, "Failed to load chat media");

  const items = extractListRows(response.data)
    .map((item) => mapMediaItem(asRecord(item) ?? {}))
    .filter((item): item is ChatMediaItemDto => item !== null);
  const headerMeta = parseXPaginationHeader(response.headers ?? {});
  const meta = extractPageMeta(response.data, items.length, pageNumber, pageSize, headerMeta);

  return { items, totalCount: meta.totalCount };
}

export async function fetchChatFiles(
  courseId: string,
  params: { pageNumber?: number; pageSize?: number } = {},
): Promise<{ items: ChatFileItemDto[]; totalCount: number }> {
  const pageNumber = params.pageNumber ?? 1;
  const pageSize = params.pageSize ?? 20;

  const response = await httpClient.get<unknown>({
    url: `${CHAT_BASE}/${encodeURIComponent(courseId)}/files`,
    params: { pageNumber, pageSize },
  });
  assertSuccess(response, "Failed to load chat files");

  const items = extractListRows(response.data)
    .map((item) => mapFileItem(asRecord(item) ?? {}))
    .filter((item): item is ChatFileItemDto => item !== null);
  const headerMeta = parseXPaginationHeader(response.headers ?? {});
  const meta = extractPageMeta(response.data, items.length, pageNumber, pageSize, headerMeta);

  return { items, totalCount: meta.totalCount };
}

export async function sendChatMessage(
  courseId: string,
  payload: SendChatMessagePayload,
): Promise<string> {
  const content = payload.content?.trim() ?? "";
  const attachments = payload.attachments ?? [];

  if (!content && attachments.length === 0) {
    throw new Error("Message content or attachment is required");
  }

  const response = await httpClient.post<unknown>({
    url: `${CHAT_BASE}/messages`,
    data: {
      courseId,
      content: content || null,
      attachmentUrl: null,
      replyToMessageId: payload.replyToMessageId ?? null,
      attachments,
    },
  });
  assertSuccess(response, "Failed to send message");

  const responsePayload = extractEnvelopeData(response.data);
  if (typeof responsePayload === "string" && responsePayload.trim()) return responsePayload.trim();
  const record = asRecord(responsePayload);
  const messageId = readString(record, ["id", "messageId"], "").trim();
  if (messageId) return messageId;
  throw new Error("Invalid send message response");
}

export async function pinChatMessage(messageId: string): Promise<void> {
  const response = await httpClient.post<unknown>({
    url: `${CHAT_BASE}/messages/${encodeURIComponent(messageId)}/pin`,
  });
  assertSuccess(response, "Failed to pin message");
}

export async function unpinChatMessage(messageId: string): Promise<void> {
  const response = await httpClient.delete<unknown>({
    url: `${CHAT_BASE}/messages/${encodeURIComponent(messageId)}/pin`,
  });
  assertSuccess(response, "Failed to unpin message");
}

export async function deleteChatMessage(messageId: string): Promise<void> {
  const response = await httpClient.delete<unknown>({
    url: `${CHAT_BASE}/messages/${encodeURIComponent(messageId)}`,
  });
  assertSuccess(response, "Failed to delete message");
}

export async function addChatMessageReaction(messageId: string, emoji: string): Promise<void> {
  const response = await httpClient.post<unknown>({
    url: `${CHAT_BASE}/messages/${encodeURIComponent(messageId)}/reactions`,
    data: JSON.stringify(emoji),
    headers: { "Content-Type": "application/json" },
  });
  assertSuccess(response, "Failed to add reaction");
}

export async function removeChatMessageReaction(messageId: string, emoji: string): Promise<void> {
  const response = await httpClient.delete<unknown>({
    url: `${CHAT_BASE}/messages/${encodeURIComponent(messageId)}/reactions`,
    data: JSON.stringify(emoji),
    headers: { "Content-Type": "application/json" },
  });
  assertSuccess(response, "Failed to remove reaction");
}

export async function banChatUser(
  courseId: string,
  userId: string,
  reason: string,
): Promise<void> {
  const response = await httpClient.post<unknown>({
    url: `${CHAT_BASE}/ban`,
    data: { courseId, userId, reason: reason.trim() },
  });
  assertSuccess(response, "Failed to ban user");
}

export async function logChatViolation(
  courseId: string,
  userId: string,
  reason: string,
): Promise<void> {
  const response = await httpClient.post<unknown>({
    url: `${CHAT_BASE}/violation`,
    data: { courseId, userId, reason: reason.trim() },
  });
  assertSuccess(response, "Failed to log violation");
}

export async function updateInChatSettings(
  courseId: string,
  payload: UpdateInChatSettingsPayload,
): Promise<void> {
  const response = await httpClient.put<unknown>({
    url: `${CHAT_BASE}/settings`,
    data: { courseId, ...payload },
  });
  assertSuccess(response, "Failed to update chat settings");
}

export async function updateChatMemberPreferences(
  courseId: string,
  preferences: { isMuted: boolean; isPinnedInList: boolean },
): Promise<void> {
  const response = await httpClient.put<unknown>({
    url: `${CHAT_BASE}/${encodeURIComponent(courseId)}/member-preferences`,
    data: preferences,
  });
  assertSuccess(response, "Failed to update member preferences");
}

export async function lockChat(courseId: string): Promise<void> {
  const response = await httpClient.post<unknown>({
    url: `${CHAT_BASE}/${encodeURIComponent(courseId)}/lock`,
  });
  assertSuccess(response, "Failed to lock chat");
}

export async function unlockChat(courseId: string): Promise<void> {
  const response = await httpClient.delete<unknown>({
    url: `${CHAT_BASE}/${encodeURIComponent(courseId)}/lock`,
  });
  assertSuccess(response, "Failed to unlock chat");
}

export async function fetchTeacherChatConversation(
  courseId: string,
  locale = "ar",
): Promise<TeacherChatConversationData> {
  const [settings, messagesPage, participants, details] = await Promise.all([
    fetchChatSettings(courseId),
    fetchChatMessages(courseId, { pageNumber: 1, pageSize: 50 }),
    fetchChatParticipants(courseId),
    fetchChatDetails(courseId),
  ]);

  return mapChatConversationWorkspace(
    courseId,
    settings,
    messagesPage.messages,
    locale,
    participants,
    details,
  );
}

export async function fetchTeacherChatMembers(
  courseId: string,
  locale = "ar",
): Promise<TeacherChatMembersData> {
  const [details, settings, participants, mediaPage, filesPage] = await Promise.all([
    fetchChatDetails(courseId),
    fetchChatSettings(courseId),
    fetchChatParticipants(courseId),
    fetchChatMedia(courseId, { pageNumber: 1, pageSize: 3 }),
    fetchChatFiles(courseId, { pageNumber: 1, pageSize: 5 }),
  ]);

  return mapChatMembersWorkspace(
    courseId,
    details,
    settings,
    participants,
    mediaPage,
    filesPage,
    locale,
  );
}

export async function updateTeacherChatGroupSidebarSettings(
  courseId: string,
  partial: Partial<TeacherChatGroupSettings>,
  current: TeacherChatGroupSettings,
): Promise<TeacherChatGroupSettings> {
  const next: TeacherChatGroupSettings = { ...current, ...partial };

  const preferencePatch: Partial<{ isMuted: boolean; isPinnedInList: boolean }> = {};
  if (partial.muteNotifications !== undefined) {
    preferencePatch.isMuted = next.muteNotifications;
  }
  if (partial.pinGroup !== undefined) {
    preferencePatch.isPinnedInList = next.pinGroup;
  }

  if (partial.muteNotifications !== undefined || partial.pinGroup !== undefined) {
    await updateChatMemberPreferences(courseId, {
      isMuted: next.muteNotifications,
      isPinnedInList: next.pinGroup,
    });
  }

  if (partial.chatOpen !== undefined) {
    if (next.chatOpen) {
      await unlockChat(courseId);
    } else {
      await lockChat(courseId);
    }
  }

  return next;
}
