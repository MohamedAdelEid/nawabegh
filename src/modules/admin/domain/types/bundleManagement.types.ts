import type { BundleStatus } from "@/modules/admin/infrastructure/api/bundlesApi";

export type BundleManagementFilterState = {
  keyword: string;
  status: "all" | `${BundleStatus}`;
  createdFrom: string;
  createdTo: string;
  minPrice: string;
  maxPrice: string;
};

export const DEFAULT_BUNDLE_MANAGEMENT_FILTERS: BundleManagementFilterState = {
  keyword: "",
  status: "all",
  createdFrom: "",
  createdTo: "",
  minPrice: "0",
  maxPrice: "5000",
};

export type BundlePublishingMode = "activePublished" | "activeDraft" | "inactive";
