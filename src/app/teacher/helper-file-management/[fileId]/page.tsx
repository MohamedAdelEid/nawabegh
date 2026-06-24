import { TeacherHelperFileManagementDetailsPage } from "@/modules/teacher/presentation/pages/TeacherHelperFileManagementDetailsPage";

export default async function Page({
  params,
}: {
  params: Promise<{ fileId: string }>;
}) {
  const { fileId } = await params;
  return <TeacherHelperFileManagementDetailsPage fileId={fileId} />;
}
