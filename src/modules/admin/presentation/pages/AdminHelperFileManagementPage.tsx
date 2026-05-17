"use client";

import { ContentManagementDashboard } from "@/modules/admin/presentation/components/dashboard/ContentManagementDashboard";
import { ROUTES } from "@/shared/infrastructure/config/routes";

export function AdminHelperFileManagementPage() {
  return <ContentManagementDashboard routeConfig={ROUTES.ADMIN.HELPER_FILE_MANAGEMENT} />;
}
