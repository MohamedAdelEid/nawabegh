"use client";

import { TeacherCommunityPostSubmittedView } from "@/modules/teacher/presentation/components/knowledge-community/TeacherCommunityPostSubmittedView";

type TeacherCommunityPostSubmittedPageProps = {
  articleId: string;
};

export function TeacherCommunityPostSubmittedPage({ articleId }: TeacherCommunityPostSubmittedPageProps) {
  return <TeacherCommunityPostSubmittedView articleId={articleId} />;
}
