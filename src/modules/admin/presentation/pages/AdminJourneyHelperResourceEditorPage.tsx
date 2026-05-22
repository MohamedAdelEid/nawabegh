"use client";

import { AdminHelperFileManagementAddPage } from "./AdminHelperFileManagementAddPage";
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
    <AdminHelperFileManagementAddPage
      stationContext={{
        journeyId,
        stationId,
        returnHref: ROUTES.ADMIN.JOURNEY_EDITOR.EDITOR(journeyId),
      }}
    />
  );
}
