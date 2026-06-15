"use client";

import { AdminHelperFileManagementAddPage } from "./AdminHelperFileManagementAddPage";
import { useScopedDashboardRoutes } from "@/shared/application/hooks/useScopedDashboardRoutes";

interface AdminJourneyHelperResourceEditorPageProps {
  journeyId: string;
  stationId: string;
}

export function AdminJourneyHelperResourceEditorPage({
  journeyId,
  stationId,
}: AdminJourneyHelperResourceEditorPageProps) {
  const routes = useScopedDashboardRoutes();

  return (
    <AdminHelperFileManagementAddPage
      stationContext={{
        journeyId,
        stationId,
        returnHref: routes.journeyEditor.EDITOR(journeyId),
      }}
    />
  );
}
