"use client";

import { StudentChatConversationView } from "@/modules/student/presentation/components/chat-groups/StudentChatConversationView";

export function StudentChatConversationPage({ courseId }: { courseId: string }) {
  return <StudentChatConversationView courseId={courseId} />;
}
