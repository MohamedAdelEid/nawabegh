export type CompleteProfileRole = "Student" | "Parent" | "Teacher";

export type CompleteProfileStudentBody = {
  countryId: number;
  educationLevelId: number;
  gradeId: number;
  phoneNumber: string;
  phoneCountryCode: number;
  whatsAppNumber: string;
  whatsAppCountryCode: number;
  username: string;
  academicTerm?: number;
  schoolId?: string | null;
  address?: string | null;
  alternativePhone?: string | null;
  parentPhone?: string | null;
};

export type CompleteProfileParentBody = {
  countryId: number;
  phoneNumber: string;
  phoneCountryCode: number;
  address?: string | null;
};

export type CompleteProfileTeacherBody = {
  countryId: number;
  jobTitle: string;
  schoolId?: string | null;
  schoolName?: string | null;
  phoneNumber: string;
  phoneCountryCode: number;
  address?: string | null;
};

export type CompleteProfileBody =
  | CompleteProfileStudentBody
  | CompleteProfileParentBody
  | CompleteProfileTeacherBody;

export type CompleteProfileUser = {
  id: string;
  fullName?: string | null;
  email?: string | null;
  roles?: string[];
  photo?: string | null;
  requiresProfileCompletion?: boolean;
  countryId?: number | null;
};
