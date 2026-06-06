import { AdminFinalExamPreviewPage } from "@/modules/admin/presentation/pages/AdminFinalExamPreviewPage";

type PageProps = {
  params: Promise<{ courseId: string }>;
};

export default async function Page({ params }: PageProps) {
  const { courseId } = await params;
  return <AdminFinalExamPreviewPage courseId={courseId} />;
}
