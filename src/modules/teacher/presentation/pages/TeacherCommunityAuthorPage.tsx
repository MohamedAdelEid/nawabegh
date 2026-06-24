"use client";

import { TeacherCommunityAuthorProfileView } from "@/modules/teacher/presentation/components/knowledge-community/TeacherCommunityAuthorProfileView";

export function TeacherCommunityAuthorPage({ authorId }: { authorId: string }) {
  return <TeacherCommunityAuthorProfileView authorId={authorId} />;
}
