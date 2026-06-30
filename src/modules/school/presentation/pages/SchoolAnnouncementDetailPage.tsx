"use client";

import { SchoolAnnouncementDetailView } from "@/modules/school/presentation/components/announcements/SchoolAnnouncementDetailView";

export function SchoolAnnouncementDetailPage({ announcementId }: { announcementId: string }) {
  return <SchoolAnnouncementDetailView announcementId={announcementId} />;
}
