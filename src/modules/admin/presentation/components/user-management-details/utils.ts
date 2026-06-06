import type { UserManagementStatusId } from "@/modules/admin/domain/data/userManagementDashboardData";
import type { DashboardBadgeTone } from "@/shared/presentation/components/dashboard";

export function formatPhoneNumber(
  phoneNumber: string,
  phoneCountryCode: number | null,
  emptyLabel: string,
) {
  if (!phoneNumber.trim()) return emptyLabel;

  return phoneCountryCode ? `+${phoneCountryCode} ${phoneNumber}` : phoneNumber;
}

export function detailsStatusTone(statusId: UserManagementStatusId): DashboardBadgeTone {
  return statusId === "active" ? "success" : "neutral";
}
