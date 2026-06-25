"use client";

import { useEffect, useState } from "react";
import { AdminHelperFileManagementAddPage } from "./AdminHelperFileManagementAddPage";
import { AdminHelperFileManagementDetailsPage } from "./AdminHelperFileManagementDetailsPage";
import { getStationResourceFileId } from "@/modules/admin/infrastructure/api/stationsApi";
import { JourneyEditorStationPageSkeleton } from "@/modules/admin/presentation/components/journey-editor";
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
  const [resourceFileId, setResourceFileId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    void (async () => {
      setLoading(true);
      const result = await getStationResourceFileId(stationId);
      if (!alive) return;
      setResourceFileId(result.data);
      setLoading(false);
    })();

    return () => {
      alive = false;
    };
  }, [stationId]);

  if (loading) {
    return <JourneyEditorStationPageSkeleton />;
  }

  if (resourceFileId) {
    return (
      <AdminHelperFileManagementDetailsPage
        fileId={resourceFileId}
        journeyContext={{
          journeyId,
          returnHref: routes.journeyEditor.EDITOR(journeyId),
        }}
      />
    );
  }

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
