import { AdminFinalExamEditPage } from "@/modules/admin/presentation/pages/AdminFinalExamEditPage";

type PageProps = {
  params: Promise<{ courseId: string }>;
};

export default async function Page({ params }: PageProps) {
  const { courseId } = await params;
  return <AdminFinalExamEditPage courseId={courseId} />;
}
