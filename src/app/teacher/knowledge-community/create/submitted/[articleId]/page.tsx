import { TeacherCommunityPostSubmittedPage } from "@/modules/teacher/presentation/pages/TeacherCommunityPostSubmittedPage";

type TeacherCommunitySubmittedRouteParams = {
  params: Promise<{ articleId: string }>;
};

export default async function TeacherCommunitySubmittedRoute({
  params,
}: TeacherCommunitySubmittedRouteParams) {
  const { articleId } = await params;
  return <TeacherCommunityPostSubmittedPage articleId={articleId} />;
}
