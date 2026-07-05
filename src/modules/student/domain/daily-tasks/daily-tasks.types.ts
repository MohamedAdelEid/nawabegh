import type {
  StudentDailyChallengeType,
  StudentDailyLiveRuntimeMode,
  StudentDailyStationProgressStatus,
} from "./daily-tasks.enums";

export type DailyTasksLiveSessionDto = {
  liveSessionId: string;
  stationId: string;
  courseId: string;
  courseTitle: string;
  title: string;
  teacherName: string;
  runtimeMode: StudentDailyLiveRuntimeMode;
  isLive: boolean;
  scheduledStartUtc: string;
  scheduledEndUtc: string;
  remainingSeconds: number;
  durationMinutes: number;
  pointsReward: number;
  progressStatus: StudentDailyStationProgressStatus;
};

export type DailyTasksChallengeDto = {
  challengeId: string;
  stationId: string;
  courseId: string;
  courseTitle: string;
  title: string;
  type: StudentDailyChallengeType;
  isLive: boolean;
  windowStartUtc: string;
  windowEndUtc: string;
  remainingSeconds: number;
  durationMinutes: number;
  pointsReward: number;
  progressStatus: StudentDailyStationProgressStatus;
  canEnter: boolean;
};

export type StudentDailyTasksDto = {
  liveSessions: DailyTasksLiveSessionDto[];
  challenges: DailyTasksChallengeDto[];
};

export type DailyTasksHeroMission = {
  courseId: string;
  pathId: string;
  stationId: string;
  stationName: string;
  courseTitle: string;
  currentProgressPercent: number;
  projectedProgressPercent: number;
  estimatedMinutes: number;
  pointsReward: number;
};
