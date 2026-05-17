import { AdminUserManagementDetailsPage } from "@/modules/admin/presentation/pages/AdminUserManagementDetailsPage";

export default async function AdminUserManagementDetailRoute({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  return <AdminUserManagementDetailsPage userId={userId} />;
}
