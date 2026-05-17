"use client";

import { AdminContentManagementEditPage } from "./AdminContentManagementEditPage";
import { ROUTES } from "@/shared/infrastructure/config/routes";

interface AdminHelperFileManagementEditPageProps {
  fileId: string;
}

export function AdminHelperFileManagementEditPage({
  fileId,
}: AdminHelperFileManagementEditPageProps) {
  return <AdminContentManagementEditPage fileId={fileId} routeConfig={ROUTES.ADMIN.HELPER_FILE_MANAGEMENT} />;
}
