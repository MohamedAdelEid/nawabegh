import type { TeacherChatConversationData } from "@/modules/teacher/domain/types/teacher.types";

const CONVERSATIONS: Record<string, TeacherChatConversationData> = {
  default: {
    courseId: "default",
    titleKey: "chatGroups.conversation.samples.physics.title",
    statusKey: "chatGroups.conversation.status.activeNow",
    lastSeenKey: "chatGroups.conversation.lastSeen.fiveMinutes",
    isActive: true,
    dateGroups: [
      {
        dateKey: "chatGroups.conversation.dates.today",
        messages: [
          {
            id: "msg-1",
            sender: {
              id: "teacher-1",
              nameKey: "chatGroups.conversation.samples.teacherName",
              role: "teacher",
              avatarInitials: "مع",
            },
            type: "text",
            content: "chatGroups.conversation.samples.greeting",
            timestamp: "9:15 AM",
          },
          {
            id: "msg-2",
            sender: {
              id: "teacher-1",
              nameKey: "chatGroups.conversation.samples.teacherName",
              role: "teacher",
              avatarInitials: "مع",
            },
            type: "file",
            fileName: "chatGroups.conversation.samples.fileName",
            fileSize: "2.4 MB",
            timestamp: "9:16 AM",
            reactions: [
              { emoji: "👏", count: 3 },
              { emoji: "🔥", count: 2 },
            ],
          },
          {
            id: "msg-3",
            sender: {
              id: "student-1",
              nameKey: "chatGroups.conversation.samples.studentSara",
              role: "student",
              avatarInitials: "سخ",
            },
            type: "text",
            content: "chatGroups.conversation.samples.studentReply",
            timestamp: "9:20 AM",
            read: true,
          },
          {
            id: "msg-4",
            sender: {
              id: "student-1",
              nameKey: "chatGroups.conversation.samples.studentSara",
              role: "student",
              avatarInitials: "سخ",
            },
            type: "voice",
            voiceDuration: "0:45",
            timestamp: "9:21 AM",
            read: true,
          },
          {
            id: "msg-5",
            sender: {
              id: "student-2",
              nameKey: "chatGroups.conversation.samples.studentAhmed",
              role: "student",
              avatarInitials: "أع",
            },
            type: "reply",
            content: "chatGroups.conversation.samples.mentionReply",
            replyTo: {
              senderNameKey: "chatGroups.conversation.samples.studentSara",
              content: "chatGroups.conversation.samples.studentReply",
            },
            timestamp: "9:25 AM",
            read: true,
          },
        ],
      },
    ],
  },
};

export function getTeacherChatConversationMock(courseId: string): TeacherChatConversationData {
  const conversation = CONVERSATIONS[courseId] ?? CONVERSATIONS.default;
  return { ...conversation, courseId } as TeacherChatConversationData;
}
