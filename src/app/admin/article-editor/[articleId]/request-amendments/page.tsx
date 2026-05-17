import { AdminArticleEditorRequestAmendmentsPage } from "@/modules/admin/presentation/pages/AdminArticleEditorRequestAmendmentsPage";

type ArticleEditorRequestAmendmentsRouteParams = {
  params: Promise<{ articleId: string }>;
};

export default async function ArticleEditorRequestAmendmentsRoute({
  params,
}: ArticleEditorRequestAmendmentsRouteParams) {
  const { articleId } = await params;
  return <AdminArticleEditorRequestAmendmentsPage articleId={articleId} />;
}
