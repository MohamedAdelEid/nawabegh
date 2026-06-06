import { AdminQuizAnalysisPage } from "@/modules/admin/presentation/pages/AdminQuizAnalysisPage";

type PageProps = {
  params: Promise<{ quizId: string }>;
};

export default async function Page({ params }: PageProps) {
  const { quizId } = await params;
  return <AdminQuizAnalysisPage quizId={quizId} />;
}
