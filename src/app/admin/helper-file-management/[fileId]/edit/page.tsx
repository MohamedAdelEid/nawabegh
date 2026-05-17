import { AdminHelperFileManagementEditPage } from "@/modules/admin/presentation/pages/AdminHelperFileManagementEditPage";

type HelperFileManagementEditRouteParams = {
  params: Promise<{ fileId: string }>;
};

export default async function HelperFileManagementEditRoute({
  params,
}: HelperFileManagementEditRouteParams) {
  const { fileId } = await params;
  return <AdminHelperFileManagementEditPage fileId={fileId} />;
}
