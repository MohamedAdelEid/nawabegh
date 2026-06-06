export type CurriculumManagementTab = "educationLevels" | "grades" | "subjects";

export type EducationLevelsFilterState = {
  countryId: string;
  keyword: string;
};

export type GradesFilterState = {
  countryId: string;
  educationLevelId: string;
  keyword: string;
};

export type SubjectsFilterState = {
  keyword: string;
};

export const DEFAULT_EDUCATION_LEVELS_FILTERS: EducationLevelsFilterState = {
  countryId: "all",
  keyword: "",
};

export const DEFAULT_GRADES_FILTERS: GradesFilterState = {
  countryId: "all",
  educationLevelId: "all",
  keyword: "",
};

export const DEFAULT_SUBJECTS_FILTERS: SubjectsFilterState = {
  keyword: "",
};
