import { AdminInteractiveBookManagePage } from "@/modules/admin/presentation/pages/AdminInteractiveBookManagePage";

type InteractiveBookManageEditRouteParams = {
  params: Promise<{ courseId: string }>;
};

export default async function InteractiveBookManageEditRoute({
  params,
}: InteractiveBookManageEditRouteParams) {
  const { courseId } = await params;
  return <AdminInteractiveBookManagePage editCourseId={courseId} />;
}
