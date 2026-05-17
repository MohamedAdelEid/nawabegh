import { AdminHelperFileManagementDetailsPage } from "@/modules/admin/presentation/pages/AdminHelperFileManagementDetailsPage";

type HelperFileManagementDetailsRouteParams = {
  params: Promise<{ fileId: string }>;
};

export default async function HelperFileManagementDetailsRoute({
  params,
}: HelperFileManagementDetailsRouteParams) {
  const { fileId } = await params;
  return <AdminHelperFileManagementDetailsPage fileId={fileId} />;
}
