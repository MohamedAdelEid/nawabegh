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
  countryId: AddUserCountryId;
  educationalStageId: AddUserStageId;
  schoolYearId: AddUserSchoolYearId;
  phoneNumber: string;
  schoolName: string;
  email: string;
  password: string;
  avatarFile: File | null;
  avatarPreviewUrl: string | null;
  linkParentEnabled: boolean;
  parentSearch: string;
  selectedParentId: string | null;
  subscriptionPlanId: AddUserSubscriptionPlanId;
  subscriptionStartDate: string;
  subscriptionEndDate: string;
}

export interface TeacherAccountFormValues {
  fullName: string;
  phoneNumber: string;
  countryId: AddUserCountryId;
  jobTitle: string;
  schoolName: string;
  password: string;
  address: string;
  avatarFile: File | null;
  avatarPreviewUrl: string | null;
  subjectIds: AddUserSubjectId[];
  gradeLevelIds: AddUserGradeLevelId[];
  permissionIds: AddUserPermissionId[];
}

export interface ParentAccountFormValues {
  fullName: string;
  phoneNumber: string;
  countryId: AddUserCountryId;
  address: string;
  email: string;
  password: string;
  avatarFile: File | null;
  avatarPreviewUrl: string | null;
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
