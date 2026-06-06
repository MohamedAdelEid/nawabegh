import { AdminStudentResultsPage } from "@/modules/admin/presentation/pages/AdminStudentResultsPage";

type PageProps = {
  params: Promise<{ studentId: string }>;
};

export default async function Page({ params }: PageProps) {
  const { studentId } = await params;
  return <AdminStudentResultsPage studentId={studentId} />;
}
