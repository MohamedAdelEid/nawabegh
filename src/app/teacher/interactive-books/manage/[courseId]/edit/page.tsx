import { AdminInteractiveBookManagePage } from "@/modules/admin/presentation/pages/AdminInteractiveBookManagePage";

export default async function Page({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  return <AdminInteractiveBookManagePage editCourseId={courseId} />;
}
