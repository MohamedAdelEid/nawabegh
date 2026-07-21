"use client";

import type { SchoolEventsInitialData } from "@/modules/student/application/hooks/useSchoolEvents";
import { SchoolEventsDashboard } from "@/modules/student/presentation/components/school-events/SchoolEventsDashboard";

type StudentSchoolEventsPageProps = {
  initial?: SchoolEventsInitialData;
};

export function StudentSchoolEventsPage({ initial }: StudentSchoolEventsPageProps) {
  return <SchoolEventsDashboard initial={initial} />;
}
