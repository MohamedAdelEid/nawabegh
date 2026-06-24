import { TeacherCommunityAuthorPage } from "@/modules/teacher/presentation/pages/TeacherCommunityAuthorPage";

type PageProps = {
  params: Promise<{ authorId: string }>;
};

export default async function Page({ params }: PageProps) {
  const { authorId } = await params;
  return <TeacherCommunityAuthorPage authorId={authorId} />;
}
