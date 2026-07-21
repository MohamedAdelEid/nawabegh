export type StudentProfileBadge = {
  badgeId: string;
  name: string;
  iconUrl: string;
  earnedAt: string | null;
  isNew: boolean;
};

export type StudentBadgesMyDto = {
  earnedBadges: StudentProfileBadge[];
  availableBadges: StudentProfileBadge[];
  currentPoints: number;
};

export type StudentSchoolRankDto = {
  rank: number | null;
  schoolName: string;
  currentPoints: number;
};

export type UpdateStudentProfilePayload = {
  fullName: string;
  profileImageUrl?: string | null;
  phoneNumber?: string | null;
  phoneCountryCode?: number | null;
  whatsAppNumber?: string | null;
  whatsAppCountryCode?: number | null;
  alternativePhone?: string | null;
  parentPhone?: string | null;
  address?: string | null;
  educationLevelId?: string | null;
  gradeId?: string | null;
  schoolId?: string | null;
  academicTerm?: number | null;
};

export type StudentProfileNotificationPrefs = {
  liveSessionAlerts: boolean;
  quizResults: boolean;
  achievementMessages: boolean;
};

export type StudentProfileKpis = {
  completedStations: number | null;
  overallProgressPercentage: number;
  liveSessionsAttended: number;
  quizzesCompleted: number;
};
