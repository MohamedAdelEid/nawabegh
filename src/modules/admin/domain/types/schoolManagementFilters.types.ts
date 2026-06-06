export type SchoolManagementFilterState = {
  keyword: string;
  city: string;
  country: string;
  points: string;
  performanceLevel: string;
};

export const DEFAULT_SCHOOL_MANAGEMENT_FILTERS: SchoolManagementFilterState = {
  keyword: "",
  city: "",
  country: "",
  points: "",
  performanceLevel: "all",
};
