export type AddUserType = "student" | "teacher" | "parent";

export type AddUserCountryId = "egypt" | "saudi";
export type AddUserStageId = "primary" | "middle" | "secondary";
export type AddUserSchoolYearId = "year1" | "year2" | "year3";
export type AddUserSubscriptionPlanId = "trial" | "active" | "none";
export type AddUserSubjectId = "arabic" | "science" | "math";
export type AddUserGradeLevelId =
  | "first"
  | "second"
  | "third"
  | "fourth"
  | "fifth"
  | "sixth";
export type AddUserPermissionId =
  | "createLessons"
  | "liveBroadcast"
  | "uploadFiles"
  | "addTests"
  | "manageChats";

export interface AddUserOption<T extends string = string> {
  id: T;
  labelKey: string;
  descriptionKey?: string;
}

export interface AddUserPickerOption {
  id: AddUserType;
  titleKey: string;
  descriptionKey: string;
  accentTone: "primary" | "success" | "warning";
}

export interface StudentAccountFormValues {
  fullName: string;
  /** Numeric id from Countries dropdown (string for controlled select values). */
  countryId: string;
  /** Numeric id from EducationLevels dropdown for the selected country. */
  educationLevelId: string;
  /** Numeric id from Grades dropdown for the selected education level. */
  gradeId: string;
  phoneNumber: string;
  /** School GUID from School dropdown. */
  schoolId: string;
  /** Selected school display name (sent as address / context). */
  schoolName: string;
  email: string;
  password: string;
  avatarFile: File | null;
  avatarPreviewUrl: string | null;
  /** Stored backend file path returned by FileUpload endpoint. */
  avatarFilePath: string | null;
  linkParentEnabled: boolean;
  parentSearch: string;
  selectedParentId: string | null;
  subscriptionPlanId: AddUserSubscriptionPlanId;
  subscriptionStartDate: string;
  subscriptionEndDate: string;
}

export interface TeacherAccountFormValues {
  fullName: string;
  email: string;
  phoneNumber: string;
  /** Numeric id from Countries dropdown. */
  countryId: string;
  /** Numeric id from EducationLevels dropdown (used to load grades). */
  educationLevelId: string;
  jobTitle: string;
  /** School GUID from School dropdown. */
  schoolId: string;
  schoolName: string;
  password: string;
  address: string;
  avatarFile: File | null;
  avatarPreviewUrl: string | null;
  /** Stored backend file path returned by FileUpload endpoint. */
  avatarFilePath: string | null;
  subjectIds: AddUserSubjectId[];
  /** Grade ids from Grades dropdown (numeric strings). */
  gradeLevelIds: string[];
  permissionIds: AddUserPermissionId[];
}

export interface ParentAccountFormValues {
  fullName: string;
  phoneNumber: string;
  /** Numeric id from Countries dropdown (string for controlled select values). */
  countryId: string;
  address: string;
  email: string;
  password: string;
  avatarFile: File | null;
  avatarPreviewUrl: string | null;
  /** Stored backend file path returned by FileUpload endpoint. */
  avatarFilePath: string | null;
  studentSearch: string;
  selectedStudentIds: string[];
}

export interface AddUserLinkedEntity {
  id: string;
  name: string;
  secondaryLabel: string;
  tertiaryLabel?: string;
  avatarInitials: string;
  avatarClassName: string;
}
