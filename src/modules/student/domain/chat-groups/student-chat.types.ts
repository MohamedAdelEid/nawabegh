import type {
  TeacherChatConversationData,
  TeacherChatDateGroup,
  TeacherChatGroupSettings,
  TeacherChatMembersData,
  TeacherChatMessage,
  TeacherChatParticipant,
  TeacherChatSharedFile,
} from "@/modules/teacher/domain/types/teacher.types";

export type StudentChatMessage = TeacherChatMessage;
export type StudentChatDateGroup = TeacherChatDateGroup;
export type StudentChatConversationData = TeacherChatConversationData;
export type StudentChatMembersData = TeacherChatMembersData;
export type StudentChatParticipant = TeacherChatParticipant;
export type StudentChatSharedFile = TeacherChatSharedFile;
export type StudentChatGroupSettings = TeacherChatGroupSettings;

export type StudentChatListFilter = "all" | "active";

export type StudentChatGroupListItem = {
  courseId: string;
  groupName: string;
  instructorName: string;
  coverImageUrl: string | null;
  participantsCount: number;
  isMuted: boolean;
  isPinnedInList: boolean;
  isActiveEnrollment: boolean;
  lastMessagePreview: string | null;
  lastMessageSender: string | null;
  lastMessageAt: string | null;
  lastMessageAtLabel: string | null;
};
