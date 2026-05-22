"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/shared/infrastructure/config/routes";

interface AdminHelperFileManagementEditPageProps {
  fileId: string;
}

/** Helper resources are view-only; edit route redirects to details. */
export function AdminHelperFileManagementEditPage({
  fileId,
}: AdminHelperFileManagementEditPageProps) {
  const router = useRouter();

  useEffect(() => {
    router.replace(ROUTES.ADMIN.HELPER_FILE_MANAGEMENT.VIEW(fileId));
  }, [fileId, router]);

  return null;
}
