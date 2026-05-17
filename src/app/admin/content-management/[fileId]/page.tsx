import { AdminContentManagementDetailsPage } from "@/modules/admin/presentation/pages/AdminContentManagementDetailsPage";

type ContentManagementDetailsRouteParams = {
  params: Promise<{ fileId: string }>;
};

export default async function ContentManagementDetailsRoute({
  params,
}: ContentManagementDetailsRouteParams) {
  const { fileId } = await params;
  return <AdminContentManagementDetailsPage fileId={fileId} />;
}
