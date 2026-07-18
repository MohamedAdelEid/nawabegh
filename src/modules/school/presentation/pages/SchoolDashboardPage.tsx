"use client";

import { SchoolAnnouncementsCenter } from "@/modules/school/presentation/components/dashboard/SchoolAnnouncementsCenter";
import { SchoolPageTransition } from "@/modules/school/presentation/components/shared/SchoolPageTransition";

export function SchoolDashboardPage() {
  return (
    <SchoolPageTransition>
      <SchoolAnnouncementsCenter />
    </SchoolPageTransition>
  );
}
