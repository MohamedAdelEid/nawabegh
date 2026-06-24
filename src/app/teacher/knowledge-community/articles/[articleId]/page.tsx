import { TeacherCommunityArticlePage } from "@/modules/teacher/presentation/pages/TeacherCommunityArticlePage";

type PageProps = {
  params: Promise<{ articleId: string }>;
};

export default async function Page({ params }: PageProps) {
  const { articleId } = await params;
  return <TeacherCommunityArticlePage articleId={articleId} />;
}
