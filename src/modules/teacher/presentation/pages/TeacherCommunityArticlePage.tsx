"use client";

import { TeacherCommunityArticleView } from "@/modules/teacher/presentation/components/knowledge-community/TeacherCommunityArticleView";

export function TeacherCommunityArticlePage({ articleId }: { articleId: string }) {
  return <TeacherCommunityArticleView articleId={articleId} />;
}
