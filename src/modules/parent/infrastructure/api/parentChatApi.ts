import type {
  ParentChatContact,
  ParentChatMessage,
  ParentChatThread,
  ParentInboxItem,
  SendParentChatPayload,
} from "@/modules/parent/domain/types/parentChat.types";
import {
  formatChatClock,
  formatChatInboxTime,
  groupMessagesByDate,
  mapAttachmentDto,
  PARENT_SUPPORT_CONTACT_ID,
  roleLabel,
  sortInboxItems,
} from "@/modules/parent/application/lib/parentChat.utils";
import {
  extractApiErrorMessage,
  extractApiList,
  isApiSuccess,
  resolveApiData,
} from "@/shared/infrastructure/api/apiResponse.utils";
import { resolveFileUrl } from "@/shared/infrastructure/files/fileUrl";
import { httpClient } from "@/shared/infrastructure/http/httpClient";
import {
  fetchChatMessages,
  fetchChatSettings,
  sendChatMessage,
  type ChatMessageDto,
} from "@/modules/teacher/infrastructure/api/teacherChatApi";

const PARENT_CHAT_GROUPS_URL = "/api/v1/Parent/chat-groups";
const DIRECT_CHAT_URL = "/api/v1/DirectChat";

type UnknownRecord = Record<string, unknown>;

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

function readNumber(record: UnknownRecord | null, keys: string[], fallback = 0): number {
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

async function callParentChatApi<T>(
  action: () => Promise<T>,
  fallbackMessage: string,
): Promise<T> {
  try {
    return await action();
  } catch (error) {
    throw new Error(extractApiErrorMessage(error, fallbackMessage));
  }
}

function mapCourseInboxItem(row: unknown, locale: string): ParentInboxItem | null {
  const record = asRecord(row);
  if (!record) return null;
  const courseId = readString(record, ["courseId"], "").trim();
  if (!courseId) return null;

  const groupName = readString(record, ["groupName", "courseTitle"], "").trim();
  const teacherName = readNullableString(record, ["teacherName"]);
  const lastMessageAt = readNullableString(record, ["lastActivityAt", "lastMessageAt"]);

  return {
    kind: "course",
    id: courseId,
    courseId,
    title: groupName || readString(record, ["courseTitle"], "—"),
    subtitle: teacherName,
    avatarUrl: resolveFileUrl(readNullableString(record, ["teacherProfileImageUrl"])),
    lastMessagePreview: readNullableString(record, ["lastMessagePreview"]),
    lastMessageAt,
    lastMessageAtLabel: formatChatInboxTime(lastMessageAt, locale),
    unreadCount: 0,
    isLocked: readBoolean(record, ["isLocked"]),
    isTeachersOnly: readBoolean(record, ["isTeachersOnly"]),
    allowAttachments: readBoolean(record, ["allowAttachments"], true),
  };
}

function mapDirectInboxItem(row: unknown, locale: string): ParentInboxItem | null {
  const record = asRecord(row);
  if (!record) return null;
  const conversationId = readString(record, ["conversationId", "id"], "").trim();
  if (!conversationId) return null;

  const type = readNumber(record, ["type"], 0);
  const isSupport = type === 1;
  const title =
    readNullableString(record, ["title", "otherUserName"]) ||
    (isSupport
      ? locale.startsWith("ar")
        ? "دعم نوابغ"
        : "Nawabegh Support"
      : "—");
  const lastMessageAt = readNullableString(record, ["lastMessageAt"]);
  const otherUserRole = readNullableString(record, ["otherUserRole"]);

  return {
    kind: isSupport ? "support" : "direct",
    id: conversationId,
    title,
    subtitle: isSupport
      ? locale.startsWith("ar")
        ? "فريق الدعم"
        : "Support team"
      : roleLabel(otherUserRole, locale) || null,
    avatarUrl: resolveFileUrl(readNullableString(record, ["otherUserProfileImageUrl"])),
    lastMessagePreview: readNullableString(record, ["lastMessagePreview"]),
    lastMessageAt,
    lastMessageAtLabel: formatChatInboxTime(lastMessageAt, locale),
    unreadCount: readNumber(record, ["unreadCount"], 0),
    otherUserId: readNullableString(record, ["otherUserId"]),
    otherUserRole,
  };
}

function mapContact(row: unknown, locale: string): ParentChatContact | null {
  const record = asRecord(row);
  if (!record) return null;
  const userId = readString(record, ["userId", "id"], "").trim();
  const fullName = readString(record, ["fullName", "name", "displayName"], "").trim();
  if (!userId) return null;

  const isSupport = userId === PARENT_SUPPORT_CONTACT_ID;
  return {
    userId,
    fullName:
      fullName ||
      (isSupport
        ? locale.startsWith("ar")
          ? "دعم نوابغ"
          : "Nawabegh Support"
        : "—"),
    profileImageUrl: resolveFileUrl(
      readNullableString(record, ["profileImageUrl", "avatarUrl", "imageUrl"]),
    ),
    role: readString(record, ["role", "otherUserRole"], isSupport ? "Support" : ""),
    subtitle: isSupport
      ? locale.startsWith("ar")
        ? "فريق الدعم"
        : "Support team"
      : roleLabel(readNullableString(record, ["role", "otherUserRole"]), locale) || null,
    isSupport,
  };
}

function mapDtoMessage(
  message: ChatMessageDto,
  currentUserId: string | null,
  locale: string,
): ParentChatMessage {
  return {
    id: message.id,
    content: message.content,
    senderId: message.senderId,
    senderName: message.senderName,
    isMine: Boolean(currentUserId && message.senderId === currentUserId),
    createdAt: message.createdAt,
    timeLabel: formatChatClock(message.createdAt, locale),
    attachments: message.attachments
      .map((attachment) => mapAttachmentDto(attachment, locale))
      .filter((item): item is NonNullable<typeof item> => item !== null),
  };
}

function mapDirectMessage(
  row: unknown,
  currentUserId: string | null,
  locale: string,
): ParentChatMessage | null {
  const record = asRecord(row);
  if (!record) return null;
  const id = readString(record, ["id", "messageId"], "").trim();
  const createdAt = readString(record, ["createdAt", "sentAt"], "").trim();
  if (!id || !createdAt) return null;

  const senderId = readString(record, ["senderId", "senderUserId"], "").trim();
  const attachments = extractApiList<UnknownRecord>(record.attachments)
    .map((item) => mapAttachmentDto(item, locale))
    .filter((item): item is NonNullable<typeof item> => item !== null);

  return {
    id,
    content: readNullableString(record, ["content", "body", "text"]),
    senderId,
    senderName: readString(record, ["senderName"], "—"),
    isMine: Boolean(currentUserId && senderId === currentUserId),
    createdAt,
    timeLabel: formatChatClock(createdAt, locale),
    attachments,
  };
}

function sortMessagesAsc(messages: ParentChatMessage[]): ParentChatMessage[] {
  return [...messages].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
}

export async function fetchParentChatInbox(
  locale: string,
  keyword = "",
): Promise<ParentInboxItem[]> {
  return callParentChatApi(async () => {
    const trimmed = keyword.trim();
    const [courseResponse, directResponse] = await Promise.allSettled([
      httpClient.get<unknown>({
        url: PARENT_CHAT_GROUPS_URL,
        params: {
          pageNumber: 1,
          pageSize: 50,
          ...(trimmed ? { keyword: trimmed } : {}),
        },
      }),
      httpClient.get<unknown>({
        url: `${DIRECT_CHAT_URL}/conversations`,
        params: {
          pageNumber: 1,
          pageSize: 50,
          ...(trimmed ? { keyword: trimmed } : {}),
        },
      }),
    ]);

    const courseItems: ParentInboxItem[] = [];
    if (courseResponse.status === "fulfilled" && isApiSuccess(courseResponse.value)) {
      for (const row of extractApiList(courseResponse.value.data)) {
        const mapped = mapCourseInboxItem(row, locale);
        if (mapped) courseItems.push(mapped);
      }
    }

    const directItems: ParentInboxItem[] = [];
    if (directResponse.status === "fulfilled" && isApiSuccess(directResponse.value)) {
      for (const row of extractApiList(directResponse.value.data)) {
        const mapped = mapDirectInboxItem(row, locale);
        if (mapped) directItems.push(mapped);
      }
    }

    if (
      courseResponse.status === "rejected" &&
      directResponse.status === "rejected"
    ) {
      throw courseResponse.reason instanceof Error
        ? courseResponse.reason
        : new Error("Failed to load conversations");
    }

    return sortInboxItems([...directItems, ...courseItems]);
  }, "Failed to load conversations");
}

export async function fetchParentDirectThread(
  conversationId: string,
  currentUserId: string | null,
  locale: string,
  inboxItem?: ParentInboxItem | null,
): Promise<ParentChatThread> {
  return callParentChatApi(async () => {
    const response = await httpClient.get<unknown>({
      url: `${DIRECT_CHAT_URL}/conversations/${encodeURIComponent(conversationId)}/messages`,
      params: { pageNumber: 1, pageSize: 50 },
    });

    if (!isApiSuccess(response)) {
      throw new Error("Failed to load messages");
    }

    const messages = sortMessagesAsc(
      extractApiList(response.data)
        .map((row) => mapDirectMessage(row, currentUserId, locale))
        .filter((item): item is ParentChatMessage => item !== null),
    );

    const kind = inboxItem?.kind === "support" ? "support" : "direct";

    return {
      kind,
      id: conversationId,
      title:
        inboxItem?.title ||
        (kind === "support"
          ? locale.startsWith("ar")
            ? "دعم نوابغ"
            : "Nawabegh Support"
          : "—"),
      subtitle: inboxItem?.subtitle ?? null,
      avatarUrl: inboxItem?.avatarUrl ?? null,
      canCompose: true,
      allowAttachments: true,
      dateGroups: groupMessagesByDate(messages, locale),
    };
  }, "Failed to load conversation");
}

export async function fetchParentCourseThread(
  courseId: string,
  currentUserId: string | null,
  locale: string,
  inboxItem?: ParentInboxItem | null,
): Promise<ParentChatThread> {
  return callParentChatApi(async () => {
    const [settingsResult, messagesResult] = await Promise.allSettled([
      fetchChatSettings(courseId),
      fetchChatMessages(courseId, { pageNumber: 1, pageSize: 50 }),
    ]);

    if (messagesResult.status === "rejected") {
      throw messagesResult.reason instanceof Error
        ? messagesResult.reason
        : new Error("Failed to load course chat");
    }

    const settings = settingsResult.status === "fulfilled" ? settingsResult.value : null;
    const messages = sortMessagesAsc(
      messagesResult.value.messages.map((message) =>
        mapDtoMessage(message, currentUserId, locale),
      ),
    );

    const isLocked = settings?.isLocked ?? inboxItem?.isLocked ?? false;
    const isTeachersOnly = settings?.isTeachersOnly ?? inboxItem?.isTeachersOnly ?? false;

    return {
      kind: "course",
      id: courseId,
      title: settings?.displayName || inboxItem?.title || "—",
      subtitle: settings?.subjectNameAr || inboxItem?.subtitle || null,
      avatarUrl: inboxItem?.avatarUrl ?? null,
      canCompose: !isLocked && !isTeachersOnly,
      allowAttachments:
        settings?.allowAttachments ?? inboxItem?.allowAttachments ?? true,
      dateGroups: groupMessagesByDate(messages, locale),
    };
  }, "Failed to load course chat");
}

export async function markParentDirectConversationRead(
  conversationId: string,
): Promise<void> {
  return callParentChatApi(async () => {
    const response = await httpClient.put<unknown>({
      url: `${DIRECT_CHAT_URL}/conversations/${encodeURIComponent(conversationId)}/read`,
    });
    if (!isApiSuccess(response)) {
      throw new Error("Failed to mark conversation as read");
    }
  }, "Failed to mark conversation as read");
}

export async function sendParentDirectMessage(
  conversationId: string,
  payload: SendParentChatPayload,
): Promise<void> {
  return callParentChatApi(async () => {
    const content = payload.content?.trim() ?? "";
    const attachments = payload.attachments ?? [];
    if (!content && attachments.length === 0) {
      throw new Error("Message content or attachment is required");
    }

    const response = await httpClient.post<unknown>({
      url: `${DIRECT_CHAT_URL}/conversations/${encodeURIComponent(conversationId)}/messages`,
      data: {
        content: content || null,
        attachments,
      },
    });
    if (!isApiSuccess(response)) {
      throw new Error("Failed to send message");
    }
  }, "Failed to send message");
}

export async function sendParentCourseMessage(
  courseId: string,
  payload: SendParentChatPayload,
): Promise<void> {
  return callParentChatApi(async () => {
    await sendChatMessage(courseId, {
      content: payload.content,
      attachments: payload.attachments,
    });
  }, "Failed to send message");
}

export async function openParentDirectConversation(
  otherUserId: string,
): Promise<{ conversationId: string; created: boolean }> {
  return callParentChatApi(async () => {
    const response = await httpClient.post<unknown>({
      url: `${DIRECT_CHAT_URL}/conversations/direct`,
      data: { otherUserId },
    });
    const data = resolveApiData<UnknownRecord>(response);
    const conversationId = readString(data, ["conversationId", "id"], "").trim();
    if (!conversationId) throw new Error("Invalid conversation response");
    return {
      conversationId,
      created: readBoolean(data, ["created"], false),
    };
  }, "Failed to open conversation");
}

export async function openParentSupportConversation(): Promise<{
  conversationId: string;
  created: boolean;
}> {
  return callParentChatApi(async () => {
    const response = await httpClient.post<unknown>({
      url: `${DIRECT_CHAT_URL}/conversations/support`,
    });
    const data = resolveApiData<UnknownRecord>(response);
    const conversationId = readString(data, ["conversationId", "id"], "").trim();
    if (!conversationId) throw new Error("Invalid support conversation response");
    return {
      conversationId,
      created: readBoolean(data, ["created"], false),
    };
  }, "Failed to open support conversation");
}

export async function fetchParentSuggestedContacts(
  locale: string,
): Promise<ParentChatContact[]> {
  return callParentChatApi(async () => {
    const response = await httpClient.get<unknown>({
      url: `${DIRECT_CHAT_URL}/contacts/suggested`,
    });
    if (!isApiSuccess(response)) {
      throw new Error("Failed to load contacts");
    }
    return extractApiList(response.data)
      .map((row) => mapContact(row, locale))
      .filter((item): item is ParentChatContact => item !== null);
  }, "Failed to load contacts");
}

export async function searchParentChatContacts(
  keyword: string,
  locale: string,
): Promise<ParentChatContact[]> {
  return callParentChatApi(async () => {
    const response = await httpClient.get<unknown>({
      url: `${DIRECT_CHAT_URL}/contacts/search`,
      params: { keyword: keyword.trim(), take: 20 },
    });
    if (!isApiSuccess(response)) {
      throw new Error("Failed to search contacts");
    }
    return extractApiList(response.data)
      .map((row) => mapContact(row, locale))
      .filter((item): item is ParentChatContact => item !== null);
  }, "Failed to search contacts");
}
