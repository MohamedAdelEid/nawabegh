"use client";

import { TeacherChatMembersView } from "@/modules/teacher/presentation/components/chat-groups/TeacherChatMembersView";

export function TeacherChatMembersPage({ courseId }: { courseId: string }) {
  return <TeacherChatMembersView courseId={courseId} />;
}
