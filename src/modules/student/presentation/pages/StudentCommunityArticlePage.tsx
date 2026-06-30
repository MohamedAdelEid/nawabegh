"use client";

import { StudentCommunityArticleView } from "@/modules/student/presentation/components/knowledge-community/StudentCommunityArticleView";

export function StudentCommunityArticlePage({ articleId }: { articleId: string }) {
  return <StudentCommunityArticleView articleId={articleId} />;
}
