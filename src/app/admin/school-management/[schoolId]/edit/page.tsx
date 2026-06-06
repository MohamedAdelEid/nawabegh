import { AdminEditSchoolPage } from "@/modules/admin/presentation/pages/AdminEditSchoolPage";

type SchoolManagementEditRouteParams = {
  params: Promise<{ schoolId: string }>;
};

export default async function SchoolManagementEditRoute({
  params,
}: SchoolManagementEditRouteParams) {
  const { schoolId } = await params;
  return <AdminEditSchoolPage schoolId={schoolId} />;
}
