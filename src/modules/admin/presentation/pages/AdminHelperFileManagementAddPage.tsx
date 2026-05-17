"use client";

import { AdminContentManagementAddPage } from "./AdminContentManagementAddPage";
import { ROUTES } from "@/shared/infrastructure/config/routes";

interface AdminHelperFileManagementAddPageProps {
  mode?: "create" | "edit";
  fileId?: string;
}

export function AdminHelperFileManagementAddPage({
  mode = "create",
  fileId,
}: AdminHelperFileManagementAddPageProps) {
  return (
    <AdminContentManagementAddPage
      mode={mode}
      fileId={fileId}
      routeConfig={ROUTES.ADMIN.HELPER_FILE_MANAGEMENT}
    />
  );
}
