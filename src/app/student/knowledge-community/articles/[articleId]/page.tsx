import { StudentCommunityArticlePage } from "@/modules/student/presentation/pages/StudentCommunityArticlePage";

type PageProps = {
  params: Promise<{ articleId: string }>;
};

export default async function Page({ params }: PageProps) {
  const { articleId } = await params;
  return <StudentCommunityArticlePage articleId={articleId} />;
}
