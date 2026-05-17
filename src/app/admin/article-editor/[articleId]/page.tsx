import { AdminArticleEditorReviewPage } from "@/modules/admin/presentation/pages/AdminArticleEditorReviewPage";

type ArticleEditorReviewRouteParams = {
  params: Promise<{ articleId: string }>;
};

export default async function ArticleEditorReviewRoute({
  params,
}: ArticleEditorReviewRouteParams) {
  const { articleId } = await params;
  return <AdminArticleEditorReviewPage articleId={articleId} />;
}
