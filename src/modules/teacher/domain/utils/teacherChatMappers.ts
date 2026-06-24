import type {
  TeacherChatConversationData,
  TeacherChatDateGroup,
  TeacherChatGroupSettings,
  TeacherChatMembersData,
  TeacherChatMessage,
  TeacherChatMessageType,
  TeacherChatParticipant,
  TeacherChatSharedFile,
} from "@/modules/teacher/domain/types/teacher.types";
import type {
  ChatFileItemDto,
  ChatGroupDetailsDto,
  ChatMediaItemDto,
  ChatMessageDto,
  ChatParticipantDto,
  ChatSettingsDto,
} from "@/modules/teacher/infrastructure/api/teacherChatApi";
import { formatBytes, formatDate } from "@/shared/application/lib/format";
import { resolveFileUrl } from "@/shared/infrastructure/files/fileUrl";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2);
  const first = parts[0]!;
  const last = parts[parts.length - 1]!;
  return `${first.slice(0, 1)}${last.slice(0, 1)}`;
}

function formatMessageTime(createdAt: string, locale: string): string {
  if (!createdAt) return "—";
  try {
    return new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" }).format(
      new Date(createdAt),
    );
  } catch {
    return "—";
  }
}

function formatShortDate(createdAt: string, locale: string): string {
  if (!createdAt) return "—";
  try {
    return new Intl.DateTimeFormat(locale, { month: "short", day: "numeric" }).format(
      new Date(createdAt),
    );
  } catch {
    return "—";
  }
}

function resolveDateGroupLabel(createdAt: string, locale: string): string {
  if (!createdAt) return "—";
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return "—";

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (sameDay(date, today)) {
    return locale.startsWith("ar") ? "اليوم" : "Today";
  }
  if (sameDay(date, yesterday)) {
    return locale.startsWith("ar") ? "أمس" : "Yesterday";
  }

  return formatDate(date, locale);
}

function isImageUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return /\.(jpe?g|png|gif|webp|bmp|svg|avif)(\?|$)/i.test(url);
}

function resolveMessageType(message: ChatMessageDto): TeacherChatMessageType {
  if (message.replyToMessageId) return "reply";

  const primaryAttachment = message.attachments[0];
  if (primaryAttachment) {
    if (primaryAttachment.attachmentType === 1) return "image";
    if (primaryAttachment.attachmentType === 4) return "voice";
    if ([2, 3].includes(primaryAttachment.attachmentType)) return "file";
  }

  if (message.attachmentUrl) {
    return isImageUrl(message.attachmentUrl) ? "image" : "file";
  }
  return "text";
}

function mapMessage(message: ChatMessageDto, locale: string): TeacherChatMessage {
  const type = resolveMessageType(message);
  const primaryAttachment = message.attachments[0];
  const attachmentUrl = primaryAttachment?.url ?? message.attachmentUrl;

  return {
    id: message.id,
    sender: {
      id: message.senderId,
      name: message.senderName,
      role: "student",
      avatarInitials: getInitials(message.senderName),
      profileImageUrl: null,
    },
    type,
    content: message.content ?? undefined,
    timestamp: formatMessageTime(message.createdAt, locale),
    dateGroupLabel: resolveDateGroupLabel(message.createdAt, locale),
    fileName: primaryAttachment?.fileName,
    fileSize: primaryAttachment ? formatBytes(primaryAttachment.sizeInBytes, locale) : undefined,
    fileUrl: attachmentUrl ? resolveFileUrl(attachmentUrl) : null,
    voiceDuration: type === "voice" ? "0:00" : undefined,
    replyTo: message.replyToPreview
      ? {
          senderName: "—",
          content: message.replyToPreview,
        }
      : undefined,
    reactions: message.reactions.map((reaction) => ({
      emoji: reaction.emoji,
      count: reaction.count,
      reactedByCurrentUser: reaction.reactedByCurrentUser,
    })),
    isPinned: message.isPinned,
  };
}

function groupMessagesByDate(messages: TeacherChatMessage[]): TeacherChatDateGroup[] {
  const groups = new Map<string, TeacherChatMessage[]>();

  for (const message of messages) {
    const label = message.dateGroupLabel ?? "—";
    const bucket = groups.get(label) ?? [];
    bucket.push(message);
    groups.set(label, bucket);
  }

  return Array.from(groups.entries()).map(([dateLabel, bucket]) => ({
    dateLabel,
    messages: bucket,
  }));
}

function mapParticipant(participant: ChatParticipantDto): TeacherChatParticipant {
  const role = participant.role.toLowerCase() === "teacher" ? "teacher" : "student";

  return {
    id: participant.userId,
    name: participant.fullName,
    role,
    avatarInitials: getInitials(participant.fullName),
    profileImageUrl: resolveFileUrl(participant.profileImageUrl),
    status: role === "teacher" ? "online" : "offline",
    isGroupAdmin: participant.isGroupAdmin,
  };
}

function mapSharedFile(file: ChatFileItemDto, locale: string): TeacherChatSharedFile {
  const type: TeacherChatSharedFile["type"] =
    file.attachmentType === 1 ? "img" : file.fileName.toLowerCase().endsWith(".pdf") ? "pdf" : "doc";

  return {
    id: file.id,
    name: file.fileName,
    type,
    sizeLabel: formatBytes(file.sizeInBytes, locale),
    dateLabel: formatShortDate(file.sharedAt, locale),
    url: resolveFileUrl(file.url),
  };
}

export function mapChatConversationWorkspace(
  courseId: string,
  settings: ChatSettingsDto,
  messages: ChatMessageDto[],
  locale: string,
  participants: ChatParticipantDto[] = [],
  details?: ChatGroupDetailsDto,
): TeacherChatConversationData {
  const teacherIds = new Set(
    participants
      .filter((participant) => participant.role.toLowerCase() === "teacher")
      .map((participant) => participant.userId),
  );

  const mappedMessages = messages.map((message) => {
    const mapped = mapMessage(message, locale);
    mapped.sender.role = teacherIds.has(message.senderId) ? "teacher" : "student";
    return mapped;
  });

  return {
    courseId,
    title: settings.displayName,
    subjectName: settings.subjectNameAr,
    isLocked: settings.isLocked,
    isTeachersOnly: settings.isTeachersOnly,
    isActive: !settings.isLocked,
    isMuted: details?.isMuted ?? false,
    isPinnedInList: details?.isPinnedInList ?? false,
    allowImages: settings.allowImages,
    allowDocuments: settings.allowDocuments,
    allowWebLinks: settings.allowWebLinks,
    allowParentView: settings.allowParentView,
    dateGroups: groupMessagesByDate(mappedMessages),
  };
}

export function mapChatMembersWorkspace(
  courseId: string,
  details: ChatGroupDetailsDto,
  settings: ChatSettingsDto,
  participants: ChatParticipantDto[],
  mediaPage: { items: ChatMediaItemDto[]; totalCount: number },
  filesPage: { items: ChatFileItemDto[]; totalCount: number },
  locale: string,
): TeacherChatMembersData {
  const mappedParticipants = participants.map(mapParticipant);
  const mediaUrls = mediaPage.items
    .map((item) => resolveFileUrl(item.previewUrl ?? item.url))
    .filter((url): url is string => Boolean(url));

  const sidebarSettings: TeacherChatGroupSettings = {
    muteNotifications: details.isMuted,
    pinGroup: details.isPinnedInList,
    chatOpen: !settings.isLocked,
  };

  return {
    courseId,
    title: details.groupName,
    description: details.description,
    createdAtLabel: details.createdAt ? formatDate(details.createdAt, locale) : "—",
    imageUrl: resolveFileUrl(details.coverImageUrl) ?? undefined,
    participants: mappedParticipants,
    totalParticipants: details.participantsCount || mappedParticipants.length,
    visibleParticipants: mappedParticipants.length,
    settings: sidebarSettings,
    mediaUrls,
    extraMediaCount: Math.max(mediaPage.totalCount - mediaUrls.length, 0),
    files: filesPage.items.map((file) => mapSharedFile(file, locale)),
  };
}
