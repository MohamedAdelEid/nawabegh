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
  dayKey: string;
  interactionRate: number;
  referenceAverage: number;
}

export interface TeacherCourseCard {
  id: string;
  titleKey: string;
  durationWeeks: number;
  studentCount: number;
  progressPercent: number;
  imageUrl: string;
}

export interface TeacherLiveClassItem {
  id: string;
  titleKey: string;
  timeLabel: string;
  status: "active" | "upcoming";
}

export interface TeacherPerformanceAlert {
  id: string;
  tone: "danger" | "warning";
  titleKey: string;
  descriptionKey: string;
}

export interface TeacherUpcomingSession {
  id: string;
  titleKey: string;
  dateLabelKey: string;
  timeLabel: string;
  studentCount: number;
}

export interface TeacherInstructorMetric {
  id: string;
  labelKey: string;
  percent: number;
  tone: "success" | "warning" | "primary";
}

export interface TeacherAttendanceChartPoint {
  dayKey: string;
  attendance: number;
  isHighlighted?: boolean;
}

export interface TeacherAbsentStudent {
  id: string;
  nameKey: string;
  lastSeenKey: string;
  avatarInitials: string;
}

export interface TeacherScheduleTopic {
  id: string;
  titleKey: string;
  badgeKey: string;
}

export interface TeacherFeaturedSession {
  id: string;
  titleKey: string;
  levelKey: string;
  status: "live" | "upcoming" | "ready";
  registeredCount: number;
  durationMinutes: number;
  resourceCount: number;
  statusLabelKey: string;
}

export interface TeacherCalendarDay {
  dateKey: string;
  dayNumber: number;
  isToday?: boolean;
  sessions: Array<{
    id: string;
    titleKey: string;
    timeLabel: string;
  }>;
}

export interface TeacherScheduleSessionRow {
  id: string;
  dateBadgeKey: string;
  titleKey: string;
  levelKey: string;
  instructorKey: string;
  timeRangeLabel: string;
  studentCount: number;
  avatarCount: number;
}

export interface TeacherLiveSessionRow {
  id: string;
  titleKey: string;
  subjectKey: string;
  lecturerKey: string;
  dateTimeLabelKey: string;
  durationKey: string;
  status: "live" | "upcoming" | "ended";
}

export interface TeacherSessionTask {
  id: string;
  labelKey: string;
  completed: boolean;
}

export interface TeacherLearningResource {
  id: string;
  titleKey: string;
  fileType: "pdf" | "pptx";
  sizeLabel: string;
}

export interface TeacherRelatedLesson {
  id: string;
  titleKey: string;
  status: "watched" | "comingSoon";
  imageUrl: string;
}

export interface TeacherSessionDetails {
  id: string;
  titleKey: string;
  status: "live" | "upcoming" | "ended";
  instructorKey: string;
  dateLabel: string;
  timeRangeLabel: string;
  attendancePercent: number;
  overviewKey: string;
  goals: string[];
  tasks: TeacherSessionTask[];
  resources: TeacherLearningResource[];
  relatedLessons: TeacherRelatedLesson[];
}

export interface TeacherDashboardData {
  level: TeacherLevelProgress;
  stats: TeacherKpiStat[];
  performanceChart: TeacherPerformanceChartPoint[];
  courses: TeacherCourseCard[];
  liveClasses: TeacherLiveClassItem[];
  alerts: TeacherPerformanceAlert[];
}

export interface TeacherLiveAnalyticsData {
  stats: TeacherKpiStat[];
  upcomingSessions: TeacherUpcomingSession[];
  instructorMetrics: TeacherInstructorMetric[];
  tipKey: string;
  attendanceChart: TeacherAttendanceChartPoint[];
  absentStudents: TeacherAbsentStudent[];
  absentSessionTitleKey: string;
  absentSessionTimeKey: string;
  totalAbsentCount: number;
}

export interface TeacherScheduleData {
  completedSessions: number;
  plannedSessions: number;
  performanceMessageKey: string;
  topics: TeacherScheduleTopic[];
  featuredSession: TeacherFeaturedSession;
  calendarDays: TeacherCalendarDay[];
  sessions: TeacherScheduleSessionRow[];
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
export type TeacherCourseStatus = "draft" | "pending" | "approved" | "rejected";

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
}

export interface TeacherCoursesListParams {
  query?: string;
  gradeId?: string;
  subjectId?: string;
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
    grades: Array<{ id: string; labelKey: string }>;
    subjects: Array<{ id: string; labelKey: string }>;
    statuses: Array<{ id: TeacherCourseStatus | "all"; labelKey: string }>;
  };
}

export interface TeacherCourseCurriculumItem {
  id: string;
  titleKey: string;
  type: "video" | "quiz" | "pdf" | "locked";
  metaKey: string;
  subMetaKey?: string;
  locked?: boolean;
}

export interface TeacherCourseCurriculumUnit {
  id: string;
  titleKey: string;
  items: TeacherCourseCurriculumItem[];
}

export interface TeacherCourseDetail {
  id: string;
  titleKey: string;
  subjectKey: string;
  termKey: string;
  gradeKey: string;
  status: TeacherCourseStatus;
  instructorNameKey: string;
  instructorAvatarUrl?: string;
  coverImageUrl?: string;
  subjectLabelKey: string;
  gradeLabelKey: string;
  lessonCount: number;
  priceLabel: string;
  registeredStudents: number;
  totalRevenueLabel: string;
  completionRate: number;
  curriculum: TeacherCourseCurriculumUnit[];
}

export interface TeacherCourseStationPerformance {
  id: string;
  labelKey: string;
  percent: number;
  tone: "primary" | "warning" | "success" | "neutral";
}

export interface TeacherCourseWeeklyInteractionPoint {
  dayKey: string;
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
  weekKey: string;
  lessonCompletion: number;
  testResults: number;
}

export interface TeacherCourseHighlightCard {
  id: string;
  tone: "warning" | "danger";
  titleKey: string;
  descriptionKey: string;
  actionKey: string;
}

export interface TeacherInteractiveStudent {
  id: string;
  nameKey: string;
  avatarInitials: string;
  interactionPoints: number;
  level: number;
}

export interface TeacherCourseUpcomingSessionCard {
  id: string;
  dateLabel: string;
  titleKey: string;
  timeLabel: string;
  registeredCount: number;
}

export interface TeacherCourseStatisticsData {
  courseId: string;
  titleKey: string;
  subtitleMeta?: {
    students: number;
    learningPaths: number;
    avgPerformance: string;
  };
  stats: TeacherKpiStat[];
  weeklyInteraction: TeacherCourseWeeklyInteractionPoint[];
  weeklyPerformance?: TeacherCourseWeeklyPerformancePoint[];
  stationPerformance: TeacherCourseStationPerformance[];
  highlightCards?: TeacherCourseHighlightCard[];
  topStudents?: TeacherInteractiveStudent[];
  upcomingSessions?: TeacherCourseUpcomingSessionCard[];
  interactionTipKey?: string;
  insightKey: string;
  journeyStations: TeacherCourseJourneyStation[];
  studentProgress: TeacherCourseStudentProgressRow[];
  chatMessagesToday: number;
  chatTags: string[];
  aiPredictionKey: string;
}

export type TeacherChatMessageType = "text" | "file" | "voice" | "reply";

export interface TeacherChatReaction {
  emoji: string;
  count: number;
}

export interface TeacherChatMessageSender {
  id: string;
  nameKey: string;
  role: "teacher" | "student";
  avatarInitials: string;
}

export interface TeacherChatMessage {
  id: string;
  sender: TeacherChatMessageSender;
  type: TeacherChatMessageType;
  content?: string;
  timestamp: string;
  read?: boolean;
  fileName?: string;
  fileSize?: string;
  voiceDuration?: string;
  replyTo?: {
    senderNameKey: string;
    content: string;
  };
  reactions?: TeacherChatReaction[];
}

export interface TeacherChatDateGroup {
  dateKey: string;
  messages: TeacherChatMessage[];
}

export interface TeacherChatConversationData {
  courseId: string;
  titleKey: string;
  statusKey: string;
  lastSeenKey: string;
  isActive: boolean;
  dateGroups: TeacherChatDateGroup[];
}

export type TeacherChatParticipantStatus = "online" | "offline" | "typing" | "away";

export interface TeacherChatParticipant {
  id: string;
  nameKey: string;
  role: "teacher" | "student";
  avatarInitials: string;
  status: TeacherChatParticipantStatus;
  lastSeenKey?: string;
  isMuted?: boolean;
  isCurrentUser?: boolean;
}

export interface TeacherChatSharedFile {
  id: string;
  name: string;
  type: "pdf" | "doc" | "img";
  sizeLabel: string;
  dateLabel: string;
}

export interface TeacherChatGroupSettings {
  muteNotifications: boolean;
  pinGroup: boolean;
  chatOpen: boolean;
}

export interface TeacherChatMembersData {
  courseId: string;
  titleKey: string;
  descriptionKey: string;
  createdAtKey: string;
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
  titleKey: string;
  descriptionKey: string;
}

export interface TeacherCoursePerformanceCard {
  id: string;
  titleKey: string;
  studentCount: number;
  statusKey: string;
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
