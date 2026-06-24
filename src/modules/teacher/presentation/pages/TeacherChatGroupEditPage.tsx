"use client";

import { TeacherEditChatGroupPage } from "@/modules/teacher/presentation/pages/TeacherEditChatGroupPage";

export function TeacherChatGroupEditPage({ courseId }: { courseId: string }) {
  return <TeacherEditChatGroupPage courseId={courseId} />;
}
