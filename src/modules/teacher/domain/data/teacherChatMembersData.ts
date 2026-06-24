import type { TeacherChatMembersData } from "@/modules/teacher/domain/types/teacher.types";

const MEMBERS: Record<string, TeacherChatMembersData> = {
  default: {
    courseId: "default",
    title: "الفيزياء - ميكانيكا الكم",
    description: "مجموعة لمناقشة مفاهيم ميكانيكا الكم والواجبات والتحضير للاختبارات.",
    createdAtLabel: "15 أكتوبر 2023",
    participants: [
      {
        id: "teacher-1",
        name: "د. أحمد علي",
        role: "teacher",
        avatarInitials: "دأ",
        status: "online",
        isCurrentUser: true,
        isGroupAdmin: true,
      },
      {
        id: "student-1",
        name: "سارة محمود",
        role: "student",
        avatarInitials: "سم",
        status: "online",
      },
    ],
    totalParticipants: 42,
    visibleParticipants: 2,
    settings: {
      muteNotifications: false,
      pinGroup: true,
      chatOpen: true,
    },
    mediaUrls: [],
    extraMediaCount: 0,
    files: [],
  },
};

export function getTeacherChatMembersMock(courseId: string): TeacherChatMembersData {
  const data = MEMBERS[courseId] ?? MEMBERS.default;
  return { ...data, courseId } as TeacherChatMembersData;
}
