import type { TeacherChatConversationData } from "@/modules/teacher/domain/types/teacher.types";

const CONVERSATIONS: Record<string, TeacherChatConversationData> = {
  default: {
    courseId: "default",
    title: "الفيزياء - ميكانيكا الكم",
    subjectName: "فيزياء",
    isLocked: false,
    isTeachersOnly: false,
    isActive: true,
    isMuted: false,
    isPinnedInList: false,
    allowImages: true,
    allowDocuments: true,
    allowWebLinks: true,
    allowParentView: false,
    dateGroups: [
      {
        dateLabel: "اليوم",
        messages: [
          {
            id: "msg-1",
            sender: {
              id: "teacher-1",
              name: "أ. محمد علي",
              role: "teacher",
              avatarInitials: "مع",
            },
            type: "text",
            content: "السلام عليكم يا شباب، راجعوا الملخص المرفق قبل حصة الغد.",
            timestamp: "9:15 AM",
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
