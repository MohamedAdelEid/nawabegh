"use client";

import { useTranslations } from "next-intl";
import { DashboardBadge } from "@/shared/presentation/components/dashboard/DashboardBadge";
import {
  statusBadgeTone,
  statusText,
} from "@/modules/school/presentation/lib/schoolAnnouncementLabels";
import type { SchoolAnnouncementStatusTone } from "@/modules/school/domain/types/schoolAnnouncements.types";

export function SchoolStatusBadge({
  tone,
  label,
  withDot,
}: {
  tone: SchoolAnnouncementStatusTone;
  label?: string;
  withDot?: boolean;
}) {
  const t = useTranslations("school.dashboard");
  return (
    <DashboardBadge tone={statusBadgeTone(tone)} withDot={withDot}>
      {statusText(t, tone, label)}
    </DashboardBadge>
  );
}
