export interface TeacherAccountSummary {
  userId: string;
  fullName: string;
  profileImageUrl: string | null;
  jobTitle: string;
  schoolName: string;
  studentCount: number;
  courseCount: number;
  profileCompletionPercent: number;
}

export interface TeacherAccountPersonalInfo {
  fullName: string;
  schoolName: string;
  jobTitle: string;
  about: string;
  yearsOfExperience: number | null;
}

export interface TeacherAccountContactInfo {
  email: string;
  phoneNumber: string;
  phoneCountryCode: number;
  countryId: number;
  countryNameAr: string;
  city: string;
  address: string;
  countryCityLabelAr: string;
}

export interface TeacherAccountSecurity {
  canChangePassword: boolean;
  minimumPasswordLength: number;
  passwordRequirementsAr: string;
}

export interface TeacherWeeklyStudentPerformance {
  activeStudentsThisWeek: number;
  totalStudents: number;
  activeRatePercent: number;
  changePercentVsLastWeek: number;
  weekLabelAr: string;
}

export interface TeacherAccountSettingsData {
  summary: TeacherAccountSummary;
  personalInfo: TeacherAccountPersonalInfo;
  contactInfo: TeacherAccountContactInfo;
  security: TeacherAccountSecurity;
  weeklyStudentPerformance: TeacherWeeklyStudentPerformance;
}

export interface TeacherAccountSettingsUpdatePayload {
  fullName: string;
  profileImageUrl?: string | null;
  jobTitle: string;
  schoolName: string;
  phoneNumber: string;
  phoneCountryCode: number;
  countryId: number;
  city?: string;
  address?: string;
  about?: string;
  yearsOfExperience?: number | null;
}

export interface TeacherChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface TeacherAccountFormValues {
  fullName: string;
  jobTitle: string;
  schoolName: string;
  about: string;
  yearsOfExperience: string;
  phoneNumber: string;
  phoneCountryCode: string;
  countryId: string;
  city: string;
  address: string;
  profileImageUrl: string | null;
  avatarPreviewUrl: string | null;
  avatarFile: File | null;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
