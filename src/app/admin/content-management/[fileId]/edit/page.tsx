import { AdminContentManagementEditPage } from "@/modules/admin/presentation/pages/AdminContentManagementEditPage";

type ContentManagementEditRouteParams = {
  params: Promise<{ fileId: string }>;
};

export default async function ContentManagementEditRoute({
  params,
}: ContentManagementEditRouteParams) {
  const { fileId } = await params;
  return <AdminContentManagementEditPage fileId={fileId} />;
}
