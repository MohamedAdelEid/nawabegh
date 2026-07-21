import { SchoolArticleCreatePage } from "@/modules/school/presentation/pages/SchoolArticleCreatePage";

export default async function SchoolArticleEditRoutePage({
  params,
}: {
  params: Promise<{ articleId: string }>;
}) {
  const { articleId } = await params;
  return <SchoolArticleCreatePage articleId={articleId} />;
}
