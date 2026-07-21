import { SchoolArticleReviewPage } from "@/modules/school/presentation/pages/SchoolArticleReviewPage";

export default async function SchoolArticleReviewRoutePage({
  params,
}: {
  params: Promise<{ articleId: string }>;
}) {
  const { articleId } = await params;
  return <SchoolArticleReviewPage articleId={articleId} />;
}
