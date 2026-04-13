import { notFound } from "next/navigation";
import { getUserManagementDetail } from "@/modules/admin/domain/data/userManagementDetailsData";
import { AdminUserManagementDetailsPage } from "@/modules/admin/presentation/pages/AdminUserManagementDetailsPage";

export default async function AdminUserManagementDetailRoute({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;

  if (!getUserManagementDetail(userId)) {
    notFound();
  }

  return <AdminUserManagementDetailsPage userId={userId} />;
}
