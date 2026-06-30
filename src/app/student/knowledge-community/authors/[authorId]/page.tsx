import { StudentCommunityAuthorPage } from "@/modules/student/presentation/pages/StudentCommunityAuthorPage";

type PageProps = {
  params: Promise<{ authorId: string }>;
};

export default async function Page({ params }: PageProps) {
  const { authorId } = await params;
  return <StudentCommunityAuthorPage authorId={authorId} />;
}
