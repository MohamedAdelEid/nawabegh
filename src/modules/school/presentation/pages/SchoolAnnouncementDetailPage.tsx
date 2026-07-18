"use client";

import { SchoolAnnouncementDetailView } from "@/modules/school/presentation/components/announcements/SchoolAnnouncementDetailView";
import { SchoolPageTransition } from "@/modules/school/presentation/components/shared/SchoolPageTransition";

export function SchoolAnnouncementDetailPage({ announcementId }: { announcementId: string }) {
  return (
    <SchoolPageTransition>
      <SchoolAnnouncementDetailView announcementId={announcementId} />
    </SchoolPageTransition>
  );
}
