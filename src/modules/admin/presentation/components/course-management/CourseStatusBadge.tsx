"use client";

import { DashboardBadge } from "@/shared/presentation/components/dashboard";
import type {
  CourseAccessTypeId,
  CourseStatusId,
} from "@/modules/admin/domain/data/courseManagementData";

export function courseStatusTone(status: CourseStatusId) {
  if (status === "approved") return "success" as const;
  if (status === "pending") return "warning" as const;
  if (status === "rejected") return "danger" as const;
  if (status === "archived") return "neutral" as const;
  return "neutral" as const;
}

export function courseAccessTone(accessType: CourseAccessTypeId) {
  if (accessType === "free") return "success" as const;
  if (accessType === "paid") return "info" as const;
  if (accessType === "subscription") return "primary" as const;
  return "neutral" as const;
}

export function CourseStatusBadge({
  status,
  label,
}: {
  status: CourseStatusId;
  label: string;
}) {
  return (
    <DashboardBadge tone={courseStatusTone(status)} withDot>
      {label}
    </DashboardBadge>
  );
}

export function CourseAccessBadge({
  accessType,
  label,
}: {
  accessType: CourseAccessTypeId;
  label: string;
}) {
  return <DashboardBadge tone={courseAccessTone(accessType)}>{label}</DashboardBadge>;
}

export function CoursePublishedBadge({ label }: { label: string }) {
  return <DashboardBadge tone="success">{label}</DashboardBadge>;
}

export function CourseUnpublishedBadge({ label }: { label: string }) {
  return <DashboardBadge tone="neutral">{label}</DashboardBadge>;
}
