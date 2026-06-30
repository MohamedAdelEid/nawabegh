"use client";

import { StudentCommunityAuthorProfileView } from "@/modules/student/presentation/components/knowledge-community/StudentCommunityAuthorProfileView";

export function StudentCommunityAuthorPage({ authorId }: { authorId: string }) {
  return <StudentCommunityAuthorProfileView authorId={authorId} />;
}
