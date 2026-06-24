import { TeacherHelperFileManagementEditPage } from "@/modules/teacher/presentation/pages/TeacherHelperFileManagementEditPage";

export default async function Page({
  params,
}: {
  params: Promise<{ fileId: string }>;
}) {
  const { fileId } = await params;
  return <TeacherHelperFileManagementEditPage fileId={fileId} />;
}
