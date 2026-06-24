export type TeacherTrendDirection = "up" | "down" | "neutral";

export interface TeacherKpiStat {
  id: string;
  labelKey: string;
  value: string;
  trend?: string;
  trendDirection?: TeacherTrendDirection;
}

export interface TeacherLevelProgress {
  level: number;
  qualityLabelKey: string;
  currentXp: number;
  maxXp: number;
}

export interface TeacherPerformanceChartPoint {
  dayLabel: string;
  interactionRate: number;
  referenceAverage?: number;
}

export interface TeacherPerformanceChartData {
  currentWeek: TeacherPerformanceChartPoint[];
  previousWeek: TeacherPerformanceChartPoint[];
}

export interface TeacherCourseCard {
  id: string;
  title: string;
  durationWeeks: number;
  studentCount: number;
  progressPercent: number;
  imageUrl: string | null;
}

export interface TeacherLiveClassItem {
  id: string;
  title: string;
  courseTitle?: string;
  timeLabel: string;
  status: "active" | "upcoming";
}

export interface TeacherPerformanceAlert {
  id: string;
  tone: "danger" | "warning";
  title: string;
  description: string;
}

export interface TeacherUpcomingSession {
  id: string;
  title: string;
  courseTitle?: string;
  dateLabel: string;
  timeLabel: string;
  studentCount: number;
}

export interface TeacherInstructorMetric {
  id: string;
  labelKey: string;
  percent: number;
  value?: string;
  tone: "success" | "warning" | "primary";
}

export interface TeacherAttendanceChartPoint {
  dayLabel: string;
  attendance: number;
  isHighlighted?: boolean;
}

export interface TeacherAbsentStudent {
  id: string;
  studentId: string;
  liveSessionId?: string;
  fullName: string;
  lastSeenLabel: string;
  avatarInitials: string;
  profileImageUrl?: string | null;
  sessionTitle?: string;
  courseTitle?: string;
}

export interface TeacherScheduleTopic {
  id: string;
  title: string;
  badge: string;
  liveSessionId?: string;
}

export interface TeacherFeaturedSession {
  id: string;
  stationId?: string;
  title: string;
  level: string;
  status: "live" | "upcoming" | "ready";
  registeredCount: number;
  durationMinutes: number;
  resourceCount: number;
  statusLabel: string;
  canStartBroadcast?: boolean;
  coverImageUrl?: string | null;
}

export interface TeacherCalendarDay {
  dateUtc: string;
  dayLabel: string;
  dayNumber: number;
  isToday?: boolean;
  sessions: Array<{
    id: string;
    title: string;
    timeLabel: string;
  }>;
}

export interface TeacherScheduleSessionRow {
  id: string;
  stationId?: string;
  dateBadge: string;
  title: string;
  level: string;
  instructor: string;
  timeRangeLabel: string;
  studentCount: number;
  avatarCount: number;
  canStartBroadcast?: boolean;
}

export type TeacherLiveSessionStatus = "live" | "upcoming" | "ended" | "recorded";

export interface TeacherLiveSessionRow {
  id: string;
  stationId?: string;
  courseId?: string;
  title: string;
  subject: string;
  lecturer: string;
  dateTimeLabel: string;
  durationLabel: string;
  status: TeacherLiveSessionStatus;
  attendanceCount?: number;
}

export interface TeacherSessionTask {
  id: string;
  label: string;
  completed: boolean;
}

export interface TeacherLearningResource {
  id: string;
  title: string;
  fileType: string;
  mediaKind?: string | null;
  sizeLabel: string;
  fileUrl?: string;
}

export interface TeacherRelatedLesson {
  id: string;
  title: string;
  status: "watched" | "comingSoon";
  imageUrl: string;
}

export interface TeacherSessionDetails {
  id: string;
  stationId?: string;
  courseId?: string;
  title: string;
  courseTitle?: string;
  subjectName?: string;
  gradeName?: string;
  status: "live" | "upcoming" | "ended";
  instructor: string;
  dateLabel: string;
  timeRangeLabel: string;
  durationLabel?: string;
  attendancePercent: number;
  enrolledCount?: number;
  attendanceCount?: number;
  overview: string;
  goals: string[];
  tasks: TeacherSessionTask[];
  resources: TeacherLearningResource[];
  relatedLessons: TeacherRelatedLesson[];
  canStartBroadcast?: boolean;
  hostTokenPath?: string;
  relativeLabel?: string;
  coverImageUrl?: string | null;
}

export interface TeacherDashboardData {
  level: TeacherLevelProgress;
  stats: TeacherKpiStat[];
  performanceChart: TeacherPerformanceChartData;
  courses: TeacherCourseCard[];
  liveClasses: TeacherLiveClassItem[];
  alerts: TeacherPerformanceAlert[];
}

export interface TeacherLiveAnalyticsParams {
  chartPeriod?: "weekly" | "monthly";
  absentPage?: number;
  absentPageSize?: number;
  absentKeyword?: string;
  absentLiveSessionId?: string;
}

export interface TeacherLiveAnalyticsData {
  stats: TeacherKpiStat[];
  upcomingSessions: TeacherUpcomingSession[];
  instructorMetrics: TeacherInstructorMetric[];
  tipKey: string;
  attendanceChart: TeacherAttendanceChartPoint[];
  absentStudents: TeacherAbsentStudent[];
  absentSessionTitle: string;
  absentSessionTime: string;
  totalAbsentCount: number;
}

export interface TeacherScheduleParams {
  view?: "weekly" | "monthly";
  anchorDate?: string;
  upcomingLimit?: number;
}

export interface TeacherScheduleData {
  completedSessions: number;
  plannedSessions: number;
  completionPercent: number;
  performanceMessage: string;
  topics: TeacherScheduleTopic[];
  featuredSession: TeacherFeaturedSession;
  calendarDays: TeacherCalendarDay[];
  sessions: TeacherScheduleSessionRow[];
  rangeStart?: string;
  rangeEnd?: string;
}

export interface TeacherLiveSessionsListParams {
  keyword?: string;
  subject?: string;
  status?: "all" | TeacherLiveSessionStatus;
  page?: number;
  pageSize?: number;
}

export interface TeacherLiveSessionsData {
  stats: TeacherKpiStat[];
  sessions: TeacherLiveSessionRow[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
  };
}

export interface TeacherProfileData {
  name: string;
  email: string;
  password: string;
  role: string;
}

export type TeacherCourseAccessType = "free" | "paid" | "subscription" | "unspecified";
export type TeacherCourseStatus = "draft" | "pending" | "approved" | "rejected" | "archived";

export interface TeacherCourseListRow {
  id: string;
  title: string;
  subject: string;
  grade: string;
  accessType: TeacherCourseAccessType;
  status: TeacherCourseStatus;
  coverTone: "blue" | "green" | "gold" | "slate";
  coverLabel: string;
  coverImageUrl?: string | null;
  studentCount?: number;
  learningPathCount?: number;
  stationCount?: number;
  fileCount?: number;
  price?: number;
  originalPrice?: number;
  isPublished?: boolean;
  term?: number;
}

export interface TeacherCoursesListParams {
  query?: string;
  gradeId?: string;
  subjectId?: string;
  subjectName?: string;
  status?: TeacherCourseStatus | "all";
  page?: number;
  pageSize?: number;
}

export interface TeacherCoursesListData {
  stats: TeacherKpiStat[];
  rows: TeacherCourseListRow[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
  };
  filterOptions: {
    grades: Array<{ id: string; labelKey?: string; label?: string }>;
    subjects: Array<{ id: string; labelKey?: string; label?: string }>;
    statuses: Array<{ id: TeacherCourseStatus | "all"; labelKey: string }>;
  };
}

export interface TeacherCourseCurriculumItem {
  id: string;
  title: string;
  type: "video" | "quiz" | "pdf" | "locked";
  metaLabel: string;
  order: number;
  locked?: boolean;
}

export interface TeacherCourseCurriculumUnit {
  id: string;
  title: string;
  items: TeacherCourseCurriculumItem[];
  order: number;
  status?: TeacherCourseStatus;
}

export interface TeacherCourseDetail {
  id: string;
  title: string;
  description?: string | null;
  subject: string;
  subjectNameEn?: string;
  term: number;
  termLabel: string;
  grade: string;
  gradeId: number;
  status: TeacherCourseStatus;
  instructorName: string;
  instructorAvatarUrl?: string | null;
  coverImageUrl?: string | null;
  lessonCount: number;
  learningPathCount: number;
  stationCount: number;
  fileCount: number;
  priceLabel: string;
  originalPrice?: number;
  discountedPrice?: number;
  accessType: TeacherCourseAccessType;
  registeredStudents: number;
  curriculum: TeacherCourseCurriculumUnit[];
  canEditContent: boolean;
  canSendForReview: boolean;
  isPublished: boolean;
  rejectionNotes?: string | null;
  draftPathCount?: number;
  pendingPathCount?: number;
  approvedPathCount?: number;
  rejectedPathCount?: number;
}

export interface TeacherCourseStationPerformance {
  id: string;
  labelKey: string;
  percent: number;
  tone: "primary" | "warning" | "success" | "neutral";
}

export interface TeacherCourseWeeklyInteractionPoint {
  dayLabel: string;
  interaction: number;
  reference: number;
}

export interface TeacherCourseJourneyStation {
  id: string;
  labelKey: string;
  completedCount: number;
  status: "completed" | "current" | "locked";
}

export interface TeacherCourseStudentProgressRow {
  id: string;
  nameKey: string;
  avatarInitials: string;
  completionPercent: number;
  lastActivityKey?: string;
  status: "onTrack" | "needsHelp" | "atRisk";
}

export interface TeacherCourseWeeklyPerformancePoint {
  weekLabel: string;
  weekStart?: string;
  currentValue: number;
  previousValue: number;
}

export interface TeacherStationInsight {
  stationId: string;
  learningPathTitle: string;
  stationName: string;
  metricPercent: number;
  metricType: string;
  descriptionAr: string;
}

export interface TeacherInteractionBoost {
  titleAr: string;
  descriptionAr: string;
  actionLabelAr: string;
  suggestionType: string;
}

export interface TeacherCourseStatisticsHeader {
  courseId: string;
  title: string;
  subjectNameAr: string;
  gradeNameAr: string;
  coverImageUrl?: string | null;
  enrolledStudentCount: number;
  learningPathCount: number;
  averageCompletionPercent: number;
}

export interface TeacherCourseUpcomingLiveSession {
  id: string;
  title: string;
  scheduledAtUtc: string;
  relativeLabelAr: string;
}

export interface TeacherInteractiveStudent {
  id: string;
  name: string;
  profileImageUrl?: string | null;
  interactionPoints: number;
}

export interface TeacherCourseStatisticsData {
  courseId: string;
  header: TeacherCourseStatisticsHeader;
  stats: TeacherKpiStat[];
  performanceChart: TeacherCourseWeeklyPerformancePoint[];
  topInteractingStudents: TeacherInteractiveStudent[];
  upcomingLiveSessions: TeacherCourseUpcomingLiveSession[];
  highestAchievement?: TeacherStationInsight | null;
  hardestLesson?: TeacherStationInsight | null;
  interactionBoost?: TeacherInteractionBoost | null;
}

export type TeacherChatMessageType = "text" | "file" | "voice" | "reply" | "image";

export interface TeacherChatReaction {
  emoji: string;
  count: number;
  reactedByCurrentUser?: boolean;
}

export interface TeacherChatMessageSender {
  id: string;
  name: string;
  role: "teacher" | "student";
  avatarInitials: string;
  profileImageUrl?: string | null;
}

export interface TeacherChatMessage {
  id: string;
  sender: TeacherChatMessageSender;
  type: TeacherChatMessageType;
  content?: string;
  timestamp: string;
  dateGroupLabel?: string;
  read?: boolean;
  fileName?: string;
  fileSize?: string;
  fileUrl?: string | null;
  voiceDuration?: string;
  replyTo?: {
    senderName: string;
    content: string;
  };
  reactions?: TeacherChatReaction[];
  isPinned?: boolean;
}

export interface TeacherChatDateGroup {
  dateLabel: string;
  messages: TeacherChatMessage[];
}

export interface TeacherChatConversationData {
  courseId: string;
  title: string;
  subjectName: string;
  isLocked: boolean;
  isTeachersOnly: boolean;
  isActive: boolean;
  isMuted: boolean;
  isPinnedInList: boolean;
  allowImages: boolean;
  allowDocuments: boolean;
  allowWebLinks: boolean;
  allowParentView: boolean;
  dateGroups: TeacherChatDateGroup[];
}

export type TeacherChatParticipantStatus = "online" | "offline" | "typing" | "away";

export interface TeacherChatParticipant {
  id: string;
  name: string;
  role: "teacher" | "student";
  avatarInitials: string;
  profileImageUrl?: string | null;
  status: TeacherChatParticipantStatus;
  isMuted?: boolean;
  isCurrentUser?: boolean;
  isGroupAdmin?: boolean;
}

export interface TeacherChatSharedFile {
  id: string;
  name: string;
  type: "pdf" | "doc" | "img";
  sizeLabel: string;
  dateLabel: string;
  url?: string | null;
}

export interface TeacherChatGroupSettings {
  muteNotifications: boolean;
  pinGroup: boolean;
  chatOpen: boolean;
}

export interface TeacherChatMembersData {
  courseId: string;
  title: string;
  description: string;
  createdAtLabel: string;
  imageUrl?: string;
  participants: TeacherChatParticipant[];
  totalParticipants: number;
  visibleParticipants: number;
  settings: TeacherChatGroupSettings;
  mediaUrls: string[];
  extraMediaCount: number;
  files: TeacherChatSharedFile[];
}

export interface TeacherCoursesStatisticsAlert {
  id: string;
  tone: "danger" | "warning" | "neutral";
  title: string;
  description: string;
  count?: number | null;
}

export interface TeacherCoursePerformanceCard {
  id: string;
  title: string;
  subjectName?: string;
  gradeName?: string;
  coverImageUrl?: string | null;
  studentCount: number;
  statusLabel: string;
  statusTone: "success" | "warning" | "neutral";
  achievementPercent: number;
  achievementTone: "primary" | "warning" | "success";
  interactionPercent: number;
  attendancePercent: number;
  strugglingCount: number;
}

export interface TeacherCoursesStatisticsOverviewData {
  stats: TeacherKpiStat[];
  alerts: TeacherCoursesStatisticsAlert[];
  weeklyActivity: TeacherCourseWeeklyInteractionPoint[];
  coursePerformance: TeacherCoursePerformanceCard[];
  filters?: {
    periodDays: number;
    subjectId?: number | null;
    gradeId?: number | null;
  };
}

export type TeacherCoursePricingType = "free" | "oneTime" | "monthly";

export interface TeacherCourseCreatePayload {
  title: string;
  description: string;
  gradeId: string;
  subjectId: string;
  termId: string;
  pricingType: TeacherCoursePricingType;
  basePrice: string;
  offerPrice: string;
  coverImageUrl?: string;
}

export interface TeacherCourseCreateResult {
  courseId: string;
}
