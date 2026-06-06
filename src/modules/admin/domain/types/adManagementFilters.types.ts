import type { AdDisplayType, AdLifecycleStatus } from "@/modules/admin/domain/types/adManagement.types";

export type AdPlacementFilter = "Banner" | "Popup" | "Card";

export type AdManagementFilterState = {
  keyword: string;
  type: AdDisplayType | "all";
  placement: AdPlacementFilter | "all";
  status: AdLifecycleStatus | "all";
};

export const DEFAULT_AD_MANAGEMENT_FILTERS: AdManagementFilterState = {
  keyword: "",
  type: "all",
  placement: "all",
  status: "all",
};
