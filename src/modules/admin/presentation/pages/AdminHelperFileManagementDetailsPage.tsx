"use client";

import { AdminContentManagementDetailsPage } from "./AdminContentManagementDetailsPage";
import { ROUTES } from "@/shared/infrastructure/config/routes";

interface AdminHelperFileManagementDetailsPageProps {
  fileId: string;
}

export function AdminHelperFileManagementDetailsPage({
  fileId,
}: AdminHelperFileManagementDetailsPageProps) {
  return <AdminContentManagementDetailsPage fileId={fileId} routeConfig={ROUTES.ADMIN.HELPER_FILE_MANAGEMENT} />;
}
