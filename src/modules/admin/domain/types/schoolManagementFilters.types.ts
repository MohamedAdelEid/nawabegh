export type SchoolManagementFilterState = {
  keyword: string;
  city: string;
  country: string;
  performanceLevel: string;
  status: string;
};

export const DEFAULT_SCHOOL_MANAGEMENT_FILTERS: SchoolManagementFilterState = {
  keyword: "",
  city: "",
  country: "",
  performanceLevel: "all",
  status: "all",
};
