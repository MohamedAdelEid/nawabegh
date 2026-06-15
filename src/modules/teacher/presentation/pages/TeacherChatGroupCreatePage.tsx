"use client";

import { TeacherEditChatGroupPage } from "@/modules/teacher/presentation/pages/TeacherEditChatGroupPage";

export function TeacherChatGroupCreatePage() {
  return <TeacherEditChatGroupPage courseId="new" mode="create" />;
}
