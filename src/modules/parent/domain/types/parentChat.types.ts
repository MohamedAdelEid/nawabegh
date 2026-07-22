export type ParentInboxKind = "direct" | "support" | "course";

export type ParentInboxSelection = {
  kind: ParentInboxKind;
  id: string;
};

export type ParentInboxItem = {
  kind: ParentInboxKind;
  id: string;
  title: string;
  subtitle: string | null;
  avatarUrl: string | null;
  lastMessagePreview: string | null;
  lastMessageAt: string | null;
  lastMessageAtLabel: string;
  unreadCount: number;
  isOnline?: boolean;
  courseId?: string;
  isLocked?: boolean;
  isTeachersOnly?: boolean;
  allowAttachments?: boolean;
  otherUserId?: string | null;
  otherUserRole?: string | null;
};

export type ParentChatAttachment = {
  id: string;
  attachmentType: number;
  url: string;
  previewUrl: string | null;
  fileName: string;
  mimeType: string;
  sizeInBytes: number;
  sizeLabel: string;
};

export type ParentChatMessage = {
  id: string;
  content: string | null;
  senderId: string;
  senderName: string;
  isMine: boolean;
  createdAt: string;
  timeLabel: string;
  attachments: ParentChatAttachment[];
};

export type ParentChatDateGroup = {
  label: string;
  messages: ParentChatMessage[];
};

export type ParentChatThread = {
  kind: ParentInboxKind;
  id: string;
  title: string;
  subtitle: string | null;
  avatarUrl: string | null;
  canCompose: boolean;
  allowAttachments: boolean;
  dateGroups: ParentChatDateGroup[];
};

export type ParentChatContact = {
  userId: string;
  fullName: string;
  profileImageUrl: string | null;
  role: string;
  subtitle: string | null;
  isSupport: boolean;
};

export type SendParentChatAttachment = {
  attachmentType: number;
  url: string;
  fileName: string;
  mimeType: string;
  sizeInBytes: number;
  previewUrl?: string | null;
};

export type SendParentChatPayload = {
  content?: string;
  attachments?: SendParentChatAttachment[];
};
