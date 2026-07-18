export type ParentProfileSummary = {
  childrenCount: number;
  preferredTracksCount: number;
  totalPoints: number;
  upcomingSessionsCount: number;
};

export type ParentProfileChild = {
  studentUserId: string;
  studentProfileId: string;
  fullName: string;
  profileImageUrl: string | null;
  gradeNameAr: string;
  educationLevelNameAr: string;
  isActive: boolean;
  statusLabelAr: string;
  progressPercent: number;
};

export type ParentProfilePerformance = {
  attendancePercent: number;
  homeworkCompletionPercent: number;
  examResultsPercent: number;
};

export type ParentProfileNotification = {
  id: number;
  title: string;
  body: string;
  createdAtUtc: string;
  isRead: boolean;
};

export type ParentProfile = {
  userId: string;
  fullName: string;
  profileImageUrl: string | null;
  email: string;
  phoneNumber: string;
  phoneCountryCode: number;
  countryId: number;
  countryNameAr: string;
  address: string;
  isActive: boolean;
  memberSinceUtc: string;
  summary: ParentProfileSummary;
  children: ParentProfileChild[];
  performance: ParentProfilePerformance;
  recentNotifications: ParentProfileNotification[];
};

export type UpdateParentProfilePayload = Pick<
  ParentProfile,
  | "fullName"
  | "profileImageUrl"
  | "phoneNumber"
  | "phoneCountryCode"
  | "countryId"
  | "address"
>;

export type ParentChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};
