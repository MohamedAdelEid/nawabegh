/** Child learning flow DTOs — Parent_Portal_Screens_API.md Part B/D */

export type ParentChildCourseItem = {
  enrollmentId: string;
  courseId: string;
  title: string;
  coverImageUrl: string | null;
  subjectNameAr: string | null;
  subjectNameEn: string | null;
  instructorName: string | null;
  instructorImageUrl: string | null;
  lessonsCount: number;
  completedLessonsCount: number;
  progressPercent: number;
  status: string;
  statusLabelAr: string | null;
  actionLabelAr: string | null;
  startsAtUtc: string | null;
  endsAtUtc: string | null;
  attendancePercent?: number | null;
  quizAverageScorePercent?: number | null;
  originalPrice?: number | null;
  discountedPrice?: number | null;
  currency?: string | null;
};

export type ParentChildCoursesResponse = {
  studentUserId: string;
  childFullName: string;
  totalCourses: number;
  activeCourses: number;
  overallProgressPercent: number;
  courses: ParentChildCourseItem[];
};

export type ParentPieSlice = {
  key: string;
  labelAr: string;
  valuePercent: number;
};

export type ParentWeeklyPerformancePoint = {
  labelAr: string;
  weekStartUtc: string;
  averageScorePercent: number;
  attemptsCount: number;
};

export type ParentMonthlyPerformancePoint = {
  labelAr?: string;
  month?: string;
  monthLabelAr?: string;
  averageScorePercent: number;
  attemptsCount?: number;
};

export type ParentReportSubject = {
  courseId: string;
  courseTitle: string;
  subjectNameAr: string | null;
  progressPercent: number;
  quizAverageScorePercent: number;
  quizAttemptsCount: number;
  attendancePercent: number;
  estimatedHours: number;
  status: string;
  statusLabelAr: string | null;
};

export type ParentQuizResultRow = {
  attemptId?: string;
  stationId?: string;
  quizTitle: string;
  takenAtUtc: string | null;
  scorePercent: number;
  correctCount?: number;
  totalQuestions?: number;
  statusLabelAr?: string | null;
};

export type ParentChildReportsResponse = {
  studentUserId: string;
  childFullName: string;
  overallProgressPercent: number;
  attendancePercent: number;
  quizAverageScorePercent: number;
  examStats: {
    totalAttempts: number;
    passedAttempts: number;
    successRatePercent: number;
    averageScorePercent: number;
  };
  completionPie: ParentPieSlice[];
  attendancePie: ParentPieSlice[];
  weeklyActivity?: Array<{ labelAr?: string; count?: number; value?: number }>;
  weeklyPerformance: ParentWeeklyPerformancePoint[];
  monthlyPerformance?: ParentMonthlyPerformancePoint[];
  subjects: ParentReportSubject[];
  recentQuizzes?: ParentQuizResultRow[];
  rankLabel?: string | null;
  completedStationsCount?: number;
  totalStationsCount?: number;
  pointsEarned?: number;
  teacherFeedback?: {
    teacherName: string;
    teacherTitle?: string | null;
    teacherImageUrl?: string | null;
    note: string;
  } | null;
  chapters?: Array<{
    title: string;
    masteryLabelAr: string;
    progressPercent: number;
  }>;
};

export type ParentChildDashboardResponse = {
  studentUserId: string;
  childFullName: string;
  achievementRatePercent: number;
  weeklySummary: {
    lessonsCompleted: number;
    hoursStudied: number;
    assignmentsDone: number;
  };
  recentLessons: Array<{
    stationId: string;
    title: string;
    progressPercent?: number;
    coverImageUrl?: string | null;
  }>;
  weeklySchedule: unknown[];
  dailyTasks: unknown[];
  currentStations: unknown[];
  recentActivities: unknown[];
  pointsTowardNextBadge?: number;
  pointsCurrent?: number;
  pointsTarget?: number;
  weekStationsCompleted?: number;
  weekImprovementPercent?: number;
};

export type ParentJourneyStation = {
  stationId: string;
  name: string;
  order: number;
  stationType: string;
  status: string;
  progressPercent?: number;
  hasRecording?: boolean;
  hasQuiz?: boolean;
};

export type ParentJourneyPath = {
  learningPathId: string;
  title: string;
  stations: ParentJourneyStation[];
};

export type ParentCourseJourneyResponse = {
  courseId: string;
  courseTitle: string;
  progressPercent: number;
  paths: ParentJourneyPath[];
  childFullName?: string;
};

export type ParentResourceItem = {
  resourceId: string;
  title: string;
  coverImageUrl?: string | null;
  mediaKind: string;
  fileUrl?: string | null;
  courseId?: string | null;
  courseTitle?: string | null;
  stationName?: string | null;
  fileSizeLabel?: string | null;
  uploadedAtUtc?: string | null;
  actionWatchLabelAr?: string | null;
  actionDownloadLabelAr?: string | null;
};

export type ParentResourcesPage = {
  items: ParentResourceItem[];
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
};

export type ParentStationDetail = {
  stationId: string;
  title: string;
  stationType: string;
  progressPercent: number;
  description?: string | null;
  videoUrl?: string | null;
  learningGoals?: string[];
  tasks?: Array<{ title: string; isCompleted?: boolean }>;
  attachments?: ParentResourceItem[];
  quiz?: {
    attemptId?: string;
    scorePercent?: number;
    totalQuestions?: number;
    correctCount?: number;
    canStartTest?: boolean;
    statusLabelAr?: string | null;
  } | null;
  courseId?: string;
  courseTitle?: string;
  learningPathTitle?: string;
  instructorName?: string | null;
  instructorImageUrl?: string | null;
};

export type ParentCatalogCourseItem = {
  courseId: string;
  title: string;
  description?: string | null;
  coverImageUrl: string | null;
  subjectNameAr: string | null;
  gradeNameAr: string | null;
  gradeId?: number | null;
  instructorName: string | null;
  accessType: string;
  originalPrice: number | null;
  discountedPrice: number | null;
  currency: string;
  lessonsCount: number;
  isEnrolledForChild: boolean;
  enrollmentStatus: string;
  actionLabelAr: string | null;
};

export type ParentCatalogPage = {
  items: ParentCatalogCourseItem[];
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
};

/** Merged catalog + enrollment view used by the course detail & checkout screens. */
export type ParentCourseSummary = {
  courseId: string;
  title: string;
  description: string | null;
  coverImageUrl: string | null;
  subjectName: string | null;
  gradeName: string | null;
  instructorName: string | null;
  instructorImageUrl: string | null;
  lessonsCount: number;
  completedLessonsCount: number;
  progressPercent: number;
  isEnrolledForChild: boolean;
  enrollmentStatus: string | null;
  actionLabelAr: string | null;
  originalPrice: number | null;
  discountedPrice: number | null;
  currency: string;
};

export type ParentSubscriptionDetail = {
  enrollmentId: string;
  courseId: string;
  packageName: string;
  price: number;
  currency: string;
  startsAtUtc: string | null;
  endsAtUtc: string | null;
  lastPaymentMethodLabelAr?: string | null;
  canRenew: boolean;
};
