import { AdminHelperFileManagementEditPage } from "@/modules/admin/presentation/pages/AdminHelperFileManagementEditPage";

export default async function Page({
  params,
}: {
  params: Promise<{ fileId: string }>;
}) {
  const { fileId } = await params;
  return <AdminHelperFileManagementEditPage fileId={fileId} />;
}
