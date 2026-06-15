import { AdminHelperFileManagementDetailsPage } from "@/modules/admin/presentation/pages/AdminHelperFileManagementDetailsPage";

export default async function Page({
  params,
}: {
  params: Promise<{ fileId: string }>;
}) {
  const { fileId } = await params;
  return <AdminHelperFileManagementDetailsPage fileId={fileId} />;
}
