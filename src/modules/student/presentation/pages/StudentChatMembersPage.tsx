"use client";

import { StudentChatMembersView } from "@/modules/student/presentation/components/chat-groups/StudentChatMembersView";

export function StudentChatMembersPage({ courseId }: { courseId: string }) {
  return <StudentChatMembersView courseId={courseId} />;
}
