"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useScopedDashboardRoutes } from "@/shared/application/hooks/useScopedDashboardRoutes";

interface AdminHelperFileManagementEditPageProps {
  fileId: string;
}

/** Helper resources are view-only; edit route redirects to details. */
export function AdminHelperFileManagementEditPage({
  fileId,
}: AdminHelperFileManagementEditPageProps) {
  const router = useRouter();
  const routes = useScopedDashboardRoutes();

  useEffect(() => {
    router.replace(routes.helperFileManagement.VIEW(fileId));
  }, [fileId, router, routes.helperFileManagement]);

  return null;
}
