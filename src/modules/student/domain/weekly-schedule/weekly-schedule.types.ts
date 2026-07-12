import type {
  StudentScheduleActionType,
  StudentScheduleDisplayStatus,
  StudentScheduleItemType,
} from "./weekly-schedule.enums";

export type WeeklyScheduleItemDto = {
  id: string;
  courseId: string;
  learningPathId: string;
  stationId: string;
  stationType: number;
  liveSessionId: string | null;
  itemType: StudentScheduleItemType;
  quizScope: number | null;
  title: string;
  instructorName: string;
  timeRangeLabel: string;
  scheduledStart: string;
  scheduledEnd: string;
  displayStatus: StudentScheduleDisplayStatus;
  actionType: StudentScheduleActionType;
  canEnter: boolean;
};

export type WeeklyScheduleDayDto = {
  dayOfWeek: number;
  dayNameAr: string;
  date: string;
  isToday: boolean;
  items: WeeklyScheduleItemDto[];
};

export type WeeklyScheduleNextSessionDto = {
  title: string;
  courseTitle: string;
  scheduledStart: string;
  minutesUntilStart: number;
  displayStatus: StudentScheduleDisplayStatus;
};

export type WeeklyScheduleStatsDto = {
  totalSessions: number;
  attendancePercentage: number;
  remainingHours: number;
};

export type StudentWeeklyScheduleDto = {
  weekStart: string;
  weekEndExclusive: string;
  generatedAtUtc: string;
  days: WeeklyScheduleDayDto[];
  nextSession: WeeklyScheduleNextSessionDto | null;
  stats: WeeklyScheduleStatsDto;
};
