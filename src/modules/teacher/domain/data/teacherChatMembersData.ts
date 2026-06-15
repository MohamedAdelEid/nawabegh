import type { TeacherChatMembersData } from "@/modules/teacher/domain/types/teacher.types";

const MEMBERS: Record<string, TeacherChatMembersData> = {
  default: {
    courseId: "default",
    titleKey: "chatGroups.members.samples.physics.title",
    descriptionKey: "chatGroups.members.samples.physics.description",
    createdAtKey: "chatGroups.members.samples.createdAt",
    participants: [
      {
        id: "teacher-1",
        nameKey: "chatGroups.members.samples.teacherName",
        role: "teacher",
        avatarInitials: "دأ",
        status: "online",
        isCurrentUser: true,
      },
      {
        id: "student-1",
        nameKey: "chatGroups.members.samples.studentSara",
        role: "student",
        avatarInitials: "سم",
        status: "online",
      },
      {
        id: "student-2",
        nameKey: "chatGroups.members.samples.studentKhaled",
        role: "student",
        avatarInitials: "خع",
        status: "typing",
      },
      {
        id: "student-3",
        nameKey: "chatGroups.members.samples.studentAhmed",
        role: "student",
        avatarInitials: "أع",
        status: "away",
        lastSeenKey: "chatGroups.members.lastSeen.oneHour",
        isMuted: true,
      },
      {
        id: "student-4",
        nameKey: "chatGroups.members.samples.studentNoura",
        role: "student",
        avatarInitials: "نم",
        status: "offline",
        lastSeenKey: "chatGroups.members.lastSeen.yesterday",
      },
    ],
    totalParticipants: 42,
    visibleParticipants: 4,
    settings: {
      muteNotifications: false,
      pinGroup: true,
      chatOpen: true,
    },
    mediaUrls: [
      "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=200",
      "https://images.unsplash.com/photo-1507413245164-6160d8298e10?w=200",
      "https://images.unsplash.com/photo-1518152006812-edab29b069ac?w=200",
    ],
    extraMediaCount: 12,
    files: [
      {
        id: "file-1",
        name: "مخطط_المنهج.pdf",
        type: "pdf",
        sizeLabel: "1.2 MB",
        dateLabel: "15 Oct",
      },
      {
        id: "file-2",
        name: "ملخص_المحاضرة.docx",
        type: "doc",
        sizeLabel: "840 KB",
        dateLabel: "12 Oct",
      },
    ],
  },
};

export function getTeacherChatMembersMock(courseId: string): TeacherChatMembersData {
  const data = MEMBERS[courseId] ?? MEMBERS.default;
  return { ...data, courseId } as TeacherChatMembersData;
}
