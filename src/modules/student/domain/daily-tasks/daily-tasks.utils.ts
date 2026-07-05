import {
  StudentDailyChallengeType,
  StudentDailyLiveRuntimeMode,
  StudentDailyStationProgressStatus,
} from "./daily-tasks.enums";
import type {
  DailyTasksChallengeDto,
  DailyTasksHeroMission,
  DailyTasksLiveSessionDto,
  StudentDailyTasksDto,
} from "./daily-tasks.types";
import type { CoursePathProgressDto } from "@/modules/student/domain/progress/progress.types";
import {
  StudentPathProgressStatus,
  StudentStationProgressStatus,
} from "@/modules/student/domain/progress/progress.enums";
import type { PathStationProgressDto } from "@/modules/student/domain/progress/progress.types";
import { formatCountdown } from "@/modules/student/domain/progress/progress.utils";

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

function mapLiveSession(row: unknown): DailyTasksLiveSessionDto | null {
  const record = asRecord(row);
  if (!record) return null;
  const liveSessionId = toOptionalString(record.liveSessionId);
  const stationId = toOptionalString(record.stationId);
  if (!liveSessionId || !stationId) return null;

  return {
    liveSessionId,
    stationId,
    courseId: toOptionalString(record.courseId),
    courseTitle: toOptionalString(record.courseTitle),
    title: toOptionalString(record.title),
    teacherName: toOptionalString(record.teacherName),
    runtimeMode: toNumber(
      record.runtimeMode,
      StudentDailyLiveRuntimeMode.Upcoming,
    ) as StudentDailyLiveRuntimeMode,
    isLive: Boolean(record.isLive),
    scheduledStartUtc: toOptionalString(record.scheduledStartUtc),
    scheduledEndUtc: toOptionalString(record.scheduledEndUtc),
    remainingSeconds: toNumber(record.remainingSeconds),
    durationMinutes: toNumber(record.durationMinutes),
    pointsReward: toNumber(record.pointsReward),
    progressStatus: toNumber(
      record.progressStatus,
      StudentDailyStationProgressStatus.Locked,
    ) as StudentDailyStationProgressStatus,
  };
}

function mapChallenge(row: unknown): DailyTasksChallengeDto | null {
  const record = asRecord(row);
  if (!record) return null;
  const challengeId = toOptionalString(record.challengeId);
  const stationId = toOptionalString(record.stationId);
  if (!challengeId || !stationId) return null;

  return {
    challengeId,
    stationId,
    courseId: toOptionalString(record.courseId),
    courseTitle: toOptionalString(record.courseTitle),
    title: toOptionalString(record.title),
    type: toNumber(record.type, StudentDailyChallengeType.QuickChallenge) as StudentDailyChallengeType,
    isLive: Boolean(record.isLive),
    windowStartUtc: toOptionalString(record.windowStartUtc),
    windowEndUtc: toOptionalString(record.windowEndUtc),
    remainingSeconds: toNumber(record.remainingSeconds),
    durationMinutes: toNumber(record.durationMinutes),
    pointsReward: toNumber(record.pointsReward),
    progressStatus: toNumber(
      record.progressStatus,
      StudentDailyStationProgressStatus.Locked,
    ) as StudentDailyStationProgressStatus,
    canEnter: Boolean(record.canEnter),
  };
}

export function mapStudentDailyTasksDto(item: unknown): StudentDailyTasksDto | null {
  const row = asRecord(item);
  if (!row) return null;

  const liveRaw = Array.isArray(row.liveSessions) ? row.liveSessions : [];
  const challengesRaw = Array.isArray(row.challenges) ? row.challenges : [];

  return {
    liveSessions: liveRaw
      .map(mapLiveSession)
      .filter((session): session is DailyTasksLiveSessionDto => session != null),
    challenges: challengesRaw
      .map(mapChallenge)
      .filter((challenge): challenge is DailyTasksChallengeDto => challenge != null),
  };
}

export function pickFeaturedLiveSession(
  sessions: DailyTasksLiveSessionDto[],
): DailyTasksLiveSessionDto | null {
  const live = sessions.find((session) => session.isLive);
  if (live) return live;
  return sessions[0] ?? null;
}

export function pickFeaturedChallenge(
  challenges: DailyTasksChallengeDto[],
): DailyTasksChallengeDto | null {
  const open = challenges.find((challenge) => challenge.isLive && challenge.canEnter);
  if (open) return open;
  const live = challenges.find((challenge) => challenge.isLive);
  if (live) return live;
  return challenges[0] ?? null;
}

export function formatRemainingClock(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  if (safe >= 3600) return formatCountdown(safe);
  const minutes = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export function resolveHeroMission(input: {
  courseId: string;
  courseTitle: string;
  pathId: string;
  pathProgress: CoursePathProgressDto | null;
  stations: PathStationProgressDto[];
}): DailyTasksHeroMission | null {
  const { courseId, courseTitle, pathId, pathProgress, stations } = input;
  if (!pathId || stations.length === 0) return null;

  const nextStation = stations.find(
    (station) =>
      station.status === StudentStationProgressStatus.Available ||
      station.status === StudentStationProgressStatus.InProgress,
  );
  if (!nextStation) return null;

  const currentProgress = pathProgress?.stationProgressPercent ?? 0;
  const totalStations = pathProgress?.totalStations ?? stations.length;
  const boost =
    totalStations > 0 ? Math.max(1, Math.round(100 / totalStations)) : 5;

  return {
    courseId,
    pathId,
    stationId: nextStation.stationId,
    stationName: nextStation.stationName,
    courseTitle,
    currentProgressPercent: currentProgress,
    projectedProgressPercent: Math.min(100, currentProgress + boost),
    estimatedMinutes: 15,
    pointsReward: 80,
  };
}

export function isActivePath(path: CoursePathProgressDto): boolean {
  return (
    path.pathProgressStatus === StudentPathProgressStatus.InProgress ||
    path.pathProgressStatus === StudentPathProgressStatus.Available
  );
}
