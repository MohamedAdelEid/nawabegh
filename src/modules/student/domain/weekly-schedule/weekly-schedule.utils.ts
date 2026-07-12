import {
  StudentScheduleActionType,
  StudentScheduleDisplayStatus,
  StudentScheduleItemType,
} from "./weekly-schedule.enums";
import type {
  StudentWeeklyScheduleDto,
  WeeklyScheduleDayDto,
  WeeklyScheduleItemDto,
  WeeklyScheduleNextSessionDto,
  WeeklyScheduleStatsDto,
} from "./weekly-schedule.types";

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord | null {
  return value !== null && typeof value === "object" ? (value as UnknownRecord) : null;
}

function toNumber(value: unknown, fallback = 0): number {
  if (value == null || value === "") return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toOptionalString(value: unknown): string {
  if (value == null) return "";
  return String(value).trim();
}

function toNullableString(value: unknown): string | null {
  const text = toOptionalString(value);
  return text || null;
}

function toDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getCurrentWeekStart(): string {
  const today = new Date();
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - today.getDay());
  return toDateInputValue(sunday);
}

export function shiftWeekStart(weekStart: string, direction: -1 | 1): string {
  const date = new Date(`${weekStart}T12:00:00`);
  date.setDate(date.getDate() + direction * 7);
  return toDateInputValue(date);
}

function mapScheduleItem(row: unknown): WeeklyScheduleItemDto | null {
  const record = asRecord(row);
  if (!record) return null;

  const id = toOptionalString(record.id);
  const stationId = toOptionalString(record.stationId);
  if (!id || !stationId) return null;

  return {
    id,
    courseId: toOptionalString(record.courseId),
    learningPathId: toOptionalString(record.learningPathId),
    stationId,
    stationType: toNumber(record.stationType),
    liveSessionId: toNullableString(record.liveSessionId),
    itemType: toNumber(record.itemType, StudentScheduleItemType.LiveSession) as StudentScheduleItemType,
    quizScope: record.quizScope == null ? null : toNumber(record.quizScope),
    title: toOptionalString(record.title),
    instructorName: toOptionalString(record.instructorName),
    timeRangeLabel: toOptionalString(record.timeRangeLabel),
    scheduledStart: toOptionalString(record.scheduledStart),
    scheduledEnd: toOptionalString(record.scheduledEnd),
    displayStatus: toNumber(
      record.displayStatus,
      StudentScheduleDisplayStatus.Upcoming,
    ) as StudentScheduleDisplayStatus,
    actionType: toNumber(
      record.actionType,
      StudentScheduleActionType.ViewDetails,
    ) as StudentScheduleActionType,
    canEnter: Boolean(record.canEnter),
  };
}

function mapScheduleDay(row: unknown): WeeklyScheduleDayDto | null {
  const record = asRecord(row);
  if (!record) return null;

  const itemsRaw = Array.isArray(record.items) ? record.items : [];
  const items = itemsRaw
    .map(mapScheduleItem)
    .filter((item): item is WeeklyScheduleItemDto => item !== null)
    .sort((a, b) => a.scheduledStart.localeCompare(b.scheduledStart));

  return {
    dayOfWeek: toNumber(record.dayOfWeek),
    dayNameAr: toOptionalString(record.dayNameAr),
    date: toOptionalString(record.date),
    isToday: Boolean(record.isToday),
    items,
  };
}

function mapNextSession(row: unknown): WeeklyScheduleNextSessionDto | null {
  const record = asRecord(row);
  if (!record) return null;

  const title = toOptionalString(record.title);
  const courseTitle = toOptionalString(record.courseTitle);
  if (!title && !courseTitle) return null;

  return {
    title,
    courseTitle,
    scheduledStart: toOptionalString(record.scheduledStart),
    minutesUntilStart: toNumber(record.minutesUntilStart),
    displayStatus: toNumber(
      record.displayStatus,
      StudentScheduleDisplayStatus.Upcoming,
    ) as StudentScheduleDisplayStatus,
  };
}

function mapStats(row: unknown): WeeklyScheduleStatsDto {
  const record = asRecord(row);
  return {
    totalSessions: toNumber(record?.totalSessions),
    attendancePercentage: toNumber(record?.attendancePercentage),
    remainingHours: toNumber(record?.remainingHours),
  };
}

export function mapStudentWeeklyScheduleDto(data: unknown): StudentWeeklyScheduleDto | null {
  const record = asRecord(data);
  if (!record) return null;

  const daysRaw = Array.isArray(record.days) ? record.days : [];
  const days = daysRaw
    .map(mapScheduleDay)
    .filter((day): day is WeeklyScheduleDayDto => day !== null);

  const nextSessionRaw = record.nextSession;
  const nextSession =
    nextSessionRaw == null ? null : mapNextSession(nextSessionRaw);

  return {
    weekStart: toOptionalString(record.weekStart),
    weekEndExclusive: toOptionalString(record.weekEndExclusive),
    generatedAtUtc: toOptionalString(record.generatedAtUtc),
    days,
    nextSession,
    stats: mapStats(record.stats),
  };
}

export function hasLiveScheduleItems(schedule: StudentWeeklyScheduleDto | undefined): boolean {
  if (!schedule) return false;
  return schedule.days.some((day) =>
    day.items.some((item) => item.displayStatus === StudentScheduleDisplayStatus.LiveNow),
  );
}
