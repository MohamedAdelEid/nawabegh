export interface SchoolAccountSummary {
  schoolId: string;
  name: string;
  logoUrl: string | null;
  coverImageUrl: string | null;
  profileCompletionPercent: number;
  city: string;
  countryName: string;
}

export interface SchoolAccountSchoolData {
  name: string;
  city: string;
  description: string;
  address: string;
  logoUrl: string | null;
  coverImageUrl: string | null;
  phoneNumber: string;
  countryId: number | null;
  countryName: string;
  educationLevelsLabel: string;
}

export interface SchoolAccountNotifications {
  enableAlerts: boolean;
  enableEmailNotifications: boolean;
  enableSmsNotifications: boolean;
  enableSubscriptionRenewalAlerts: boolean;
}

export interface SchoolAccountInfo {
  organizationEmail: string;
  canChangePassword: boolean;
  minimumPasswordLength: number;
  passwordRequirements: string;
}

export interface SchoolAccountSecurity {
  canRevokeAllSessions: boolean;
  canRemoveSessions: boolean;
}

export interface SchoolAccountSession {
  id: string;
  deviceLabel: string;
  browser: string;
  ipAddress: string;
  location: string;
  lastSeenAt: string | null;
  lastSeenLabel: string;
  isCurrent: boolean;
  isMobile: boolean;
}

export interface SchoolAccountSettingsData {
  summary: SchoolAccountSummary;
  schoolData: SchoolAccountSchoolData;
  notifications: SchoolAccountNotifications;
  account: SchoolAccountInfo;
  security: SchoolAccountSecurity;
  sessions: SchoolAccountSession[];
}

export interface UpdateSchoolAccountSettingsPayload {
  name: string;
  city: string;
  description: string;
  address: string;
  logoUrl?: string | null;
  coverImageUrl?: string | null;
  phoneNumber?: string | null;
  countryId?: number | null;
}

export interface UpdateSchoolAccountNotificationsPayload {
  enableAlerts: boolean;
  enableEmailNotifications: boolean;
  enableSmsNotifications: boolean;
  enableSubscriptionRenewalAlerts: boolean;
}

export interface SchoolChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface SchoolAccountFormValues {
  name: string;
  city: string;
  description: string;
  address: string;
  phoneNumber: string;
  countryId: string;
  logoUrl: string | null;
  coverImageUrl: string | null;
  logoPreviewUrl: string | null;
  coverPreviewUrl: string | null;
  logoFile: File | null;
  coverFile: File | null;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
