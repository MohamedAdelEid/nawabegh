export type ExamsManagementFilterState = {
  search: string;
  courseId: string;
  status: string;
};

export const DEFAULT_EXAMS_MANAGEMENT_FILTERS: ExamsManagementFilterState = {
  search: "",
  courseId: "",
  status: "",
};
