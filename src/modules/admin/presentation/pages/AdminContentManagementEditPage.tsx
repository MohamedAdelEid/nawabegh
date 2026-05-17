"use client";

import { AdminContentManagementAddPage } from "./AdminContentManagementAddPage";

interface AdminContentManagementEditPageProps {
  fileId: string;
  routeConfig?: {
    LIST: string;
    VIEW: (fileId: string) => string;
  };
}

export function AdminContentManagementEditPage({
  fileId,
  routeConfig,
}: AdminContentManagementEditPageProps) {
  return <AdminContentManagementAddPage mode="edit" fileId={fileId} routeConfig={routeConfig} />;
}
