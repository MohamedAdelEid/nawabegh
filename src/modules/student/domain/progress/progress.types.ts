import type {
  LiveSessionRuntimeMode,
  StudentPathProgressStatus,
  StudentStationProgressStatus,
} from "@/modules/student/domain/progress/progress.enums";
import type { StationType } from "@/shared/domain/enums/learning-path.enums";

export type SubscriptionsDashboardStatsDto = {
  totalCourses: number;
  newCoursesThisMonth: number;
  overallProgressPercentage: number;
  completedCoursesCount: number;
  totalLearningHoursApproximate: number;
  betterThanPeersPercentile: number | null;
};

export type EnrollmentStatus = "active" | "expired" | "inactive";

export type EnrolledCourseCardDto = {
  enrollmentId: string;
  courseId: string;
  title: string;
  thumbnailUrl: string | null;
  subjectNameAr: string;
  subjectNameEn: string;
  instructorName: string;
  instructorImageUrl: string | null;
  status: EnrollmentStatus;
  startsAt: string | null;
  endsAt: string | null;
  progressPercentage: number;
  isCompleted: boolean;
  canViewCertificate: boolean;
  certificateUrl: string | null;
};

export type SubscriptionsDashboardDto = {
  studentName: string;
  stats: SubscriptionsDashboardStatsDto;
  courses: EnrolledCourseCardDto[];
};

export type CoursePathProgressDto = {
  pathId: string;
  pathName: string;
  pathProgressStatus: StudentPathProgressStatus;
  totalStations: number;
  completedStations: number;
  requiredStations: number;
  stationProgressPercent: number;
};

export type CourseProgressDto = {
  courseId: string;
  totalPaths: number;
  completedPaths: number;
  courseProgressPercent: number;
  hasFinalExam: boolean;
  finalExamPassed: boolean;
  canViewCertificate: boolean;
  paths: CoursePathProgressDto[];
};

export type LearningPathDropdownItemDto = {
  id: string;
  name: string;
};

export type LiveSessionScheduleDto = {
  scheduledAt: string;
  runtimeMode: LiveSessionRuntimeMode;
  countdownSeconds: number | null;
};

export type PathStationProgressDto = {
  stationId: string;
  stationName: string;
  order: number;
  stationType: StationType;
  status: StudentStationProgressStatus;
  liveSessionSchedule: LiveSessionScheduleDto | null;
};

export type MilestoneBoxDto = {
  order: number;
  pointsReward: number;
  requiredCompletedStations: number;
  afterStationOrder: number;
  completedStations: number;
  totalRequiredStations: number;
  isEligible: boolean;
  isOpened: boolean;
};

export type LearningPathStationsProgressDto = {
  learningPathId: string;
  learningPathTitle: string;
  stations: PathStationProgressDto[];
  milestoneBoxes: MilestoneBoxDto[];
};

export type MilestoneOpenResultDto = {
  milestoneOrder: number;
  pointsAwarded: number;
  totalPoints: number | null;
  currentLevel: number | null;
  pointsToNextLevel: number | null;
};

export type JourneyCompletionNotice = {
  variant: "station" | "path";
  pointsEarned: number;
  currentLevel: number;
  pointsToNextLevel: number;
  levelProgress: number;
};

export type ProgressTimelineStationNode = {
  kind: "station";
  id: string;
  station: PathStationProgressDto;
};

export type ProgressTimelineChestNode = {
  kind: "chest";
  id: string;
  milestone: MilestoneBoxDto;
};

export type ProgressTimelineNode =
  | ProgressTimelineStationNode
  | ProgressTimelineChestNode;

export type EnrolledCourseCardModel = EnrolledCourseCardDto;
export type CourseProgressModel = CourseProgressDto;
export type PathStationProgressModel = PathStationProgressDto;
export type LearningPathStationsProgressModel = LearningPathStationsProgressDto;
