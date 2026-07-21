"use client";

import type { SchoolEventLiveInitialData } from "@/modules/student/application/hooks/useSchoolEventLive";
import { SchoolEventLiveDashboard } from "@/modules/student/presentation/components/school-event-live/SchoolEventLiveDashboard";

type StudentSchoolEventLivePageProps = {
  eventId: string;
  initial?: SchoolEventLiveInitialData;
};

export function StudentSchoolEventLivePage({
  eventId,
  initial,
}: StudentSchoolEventLivePageProps) {
  return <SchoolEventLiveDashboard eventId={eventId} initial={initial} />;
}
