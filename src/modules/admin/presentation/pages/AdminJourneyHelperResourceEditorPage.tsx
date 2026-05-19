"use client";

import { AdminContentManagementAddPage } from "./AdminContentManagementAddPage";
import { ROUTES } from "@/shared/infrastructure/config/routes";

interface AdminJourneyHelperResourceEditorPageProps {
  journeyId: string;
  stationId: string;
}

export function AdminJourneyHelperResourceEditorPage({
  journeyId,
  stationId,
}: AdminJourneyHelperResourceEditorPageProps) {
  return (
    <AdminContentManagementAddPage
      routeConfig={ROUTES.ADMIN.HELPER_FILE_MANAGEMENT}
      stationContext={{
        journeyId,
        stationId,
        returnHref: ROUTES.ADMIN.JOURNEY_EDITOR.EDITOR(journeyId),
      }}
    />
  );
}
