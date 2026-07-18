"use client";

import { SchoolAnnouncementsDashboard } from "@/modules/school/presentation/components/announcements/SchoolAnnouncementsDashboard";
import { SchoolPageTransition } from "@/modules/school/presentation/components/shared/SchoolPageTransition";

export function SchoolAnnouncementsListPage() {
  return (
    <SchoolPageTransition>
      <SchoolAnnouncementsDashboard />
    </SchoolPageTransition>
  );
}
