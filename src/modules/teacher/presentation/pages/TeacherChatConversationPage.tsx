"use client";

import { TeacherChatConversationView } from "@/modules/teacher/presentation/components/chat-groups/TeacherChatConversationView";

export function TeacherChatConversationPage({ courseId }: { courseId: string }) {
  return <TeacherChatConversationView courseId={courseId} />;
}
