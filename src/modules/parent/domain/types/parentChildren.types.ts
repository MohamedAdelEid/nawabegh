import type {
  StudentWeeklyScheduleDto,
} from "@/modules/student/domain/weekly-schedule/weekly-schedule.types";

export type ParentChildListItem = {
  studentUserId: string;
  fullName: string;
  profileImageUrl: string | null;
  gradeNameAr: string | null;
  gradeNameEn?: string | null;
  educationLevelNameAr: string | null;
  educationLevelNameEn?: string | null;
  schoolName: string | null;
  username: string | null;
  isActive: boolean;
};

export type ParentChildSearchItem = ParentChildListItem & {
  alreadyLinked: boolean;
  email?: string | null;
  phoneNumber?: string | null;
  averageScorePercent?: number | null;
  schoolRank?: number | null;
};

export type ParentChildSearchPage = {
  items: ParentChildSearchItem[];
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

export type ParentCreateChildDefaults = {
  countryId: number | null;
  phoneNumber: string | null;
  phoneCountryCode: number | null;
  address: string | null;
  academicTerm: number | null;
};

export type ParentCreateChildRequest = {
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
  phoneCountryCode: number;
  address: string;
  educationLevelId: number;
  gradeId: number;
  schoolId?: string | null;
  academicTerm?: number | null;
  countryId?: number | null;
};

export type ParentCreateChildResult = {
  studentUserId?: string | null;
  email: string;
  requiresEmailOtp?: boolean;
};

export type ParentLinkChildRequest = {
  studentUserId: string;
};

export type ParentChildSubjectProgress = {
  subjectId?: string | null;
  subjectNameAr: string;
  subjectNameEn?: string | null;
  progressPercent: number;
  levelLabelAr?: string | null;
  levelLabelEn?: string | null;
  completedLessons?: number | null;
  totalLessons?: number | null;
  iconUrl?: string | null;
};

export type ParentChildLearningPathItem = {
  id: string;
  titleAr: string;
  titleEn?: string | null;
  itemType: string;
  status: "completed" | "in_progress" | "pending" | string;
  scoreLabel?: string | null;
  progressLabel?: string | null;
};

export type ParentChildAlert = {
  type: string;
  severity: "warning" | "urgent" | string;
  titleAr: string;
  titleEn?: string | null;
  messageAr: string;
  messageEn?: string | null;
};

export type ParentChildAchievement = {
  id: string;
  titleAr: string;
  titleEn?: string | null;
  iconUrl?: string | null;
};

export type ParentChildDetails = {
  studentUserId: string;
  fullName: string;
  profileImageUrl: string | null;
  username?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  phoneCountryCode?: number | null;
  address?: string | null;
  isActive: boolean;
  gradeNameAr: string | null;
  gradeNameEn?: string | null;
  educationLevelNameAr: string | null;
  educationLevelNameEn?: string | null;
  schoolName: string | null;
  progressPercent: number;
  points: number;
  schoolRank: number | null;
  achievementsCount: number;
  examStats?: {
    totalAttempts: number;
    averageScorePercent: number;
    successRatePercent?: number | null;
  } | null;
  completedStationsCount?: number | null;
  totalStationsCount?: number | null;
  activeDaysLast30?: number | null;
  estimatedLevel?: number | null;
  subjects?: ParentChildSubjectProgress[];
  learningPath?: {
    unitTitleAr?: string | null;
    unitTitleEn?: string | null;
    items: ParentChildLearningPathItem[];
  } | null;
  achievements?: ParentChildAchievement[];
  alerts?: ParentChildAlert[];
  weeklyActivity?: Array<{
    labelAr: string;
    labelEn?: string | null;
    dayKey?: string | null;
    activityCount: number;
  }>;
  recentActivities?: Array<{
    type: string;
    titleAr: string;
    title: string;
    occurredAtUtc: string;
    scorePercent?: number | null;
  }>;
  upcomingTasks?: Array<{
    id: string;
    titleAr: string;
    titleEn?: string | null;
    scheduledLabelAr?: string | null;
    scheduledLabelEn?: string | null;
    tone?: "info" | "success" | "warning" | string;
  }>;
};

export type ParentChildWeeklySchedule = StudentWeeklyScheduleDto;
