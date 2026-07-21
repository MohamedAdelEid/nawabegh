import {
  LiveSessionRuntimeMode,
  StudentPathProgressStatus,
  StudentStationProgressStatus,
} from "@/modules/student/domain/progress/progress.enums";
import type {
  CoursePathProgressDto,
  CourseProgressDto,
  EnrolledCourseCardDto,
  JourneyCompletionNotice,
  LearningPathDropdownItemDto,
  LearningPathStationsProgressDto,
  LiveSessionScheduleDto,
  MilestoneBoxDto,
  MilestoneOpenResultDto,
  PathStationProgressDto,
  ProgressTimelineNode,
  SubscriptionsDashboardDto,
} from "@/modules/student/domain/progress/progress.types";
import { StationType } from "@/shared/domain/enums/learning-path.enums";

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

function mapLiveSessionSchedule(row: unknown): LiveSessionScheduleDto | null {
  const record = asRecord(row);
  if (!record) return null;
  return {
    scheduledAt: toOptionalString(record.scheduledAt),
    runtimeMode: toNumber(record.runtimeMode, LiveSessionRuntimeMode.Upcoming) as LiveSessionRuntimeMode,
    countdownSeconds:
      record.countdownSeconds != null ? toNumber(record.countdownSeconds) : null,
  };
}

function mapPathStationProgress(row: unknown): PathStationProgressDto | null {
  const record = asRecord(row);
  if (!record) return null;
  const stationId = toOptionalString(record.stationId);
  if (!stationId) return null;

  const liveRaw = record.liveSessionSchedule;
  return {
    stationId,
    stationName: toOptionalString(record.stationName),
    order: toNumber(record.order),
    stationType: toNumber(record.stationType, StationType.HelperResource) as StationType,
    status: toNumber(record.status, StudentStationProgressStatus.Locked) as StudentStationProgressStatus,
    liveSessionSchedule: liveRaw != null ? mapLiveSessionSchedule(liveRaw) : null,
  };
}

function mapEnrollmentStatus(value: unknown): EnrolledCourseCardDto["status"] {
  const normalized = toOptionalString(value).toLowerCase();
  if (normalized === "expired") return "expired";
  if (normalized === "inactive") return "inactive";
  return "active";
}

export function mapEnrolledCourseCard(row: unknown): EnrolledCourseCardDto | null {
  const record = asRecord(row);
  if (!record) return null;
  const courseId = toOptionalString(record.courseId);
  if (!courseId) return null;

  return {
    enrollmentId: toOptionalString(record.enrollmentId),
    courseId,
    title: toOptionalString(record.title),
    thumbnailUrl: record.thumbnailUrl != null ? toOptionalString(record.thumbnailUrl) : null,
    subjectNameAr: toOptionalString(record.subjectNameAr),
    subjectNameEn: toOptionalString(record.subjectNameEn),
    instructorName: toOptionalString(record.instructorName),
    instructorImageUrl:
      record.instructorImageUrl != null ? toOptionalString(record.instructorImageUrl) : null,
    status: mapEnrollmentStatus(record.status),
    startsAt: record.startsAt != null ? toOptionalString(record.startsAt) : null,
    endsAt: record.endsAt != null ? toOptionalString(record.endsAt) : null,
    progressPercentage: toNumber(record.progressPercentage),
    isCompleted: Boolean(record.isCompleted),
    canViewCertificate: Boolean(record.canViewCertificate),
    certificateUrl: record.certificateUrl != null ? toOptionalString(record.certificateUrl) : null,
  };
}

export function sortSubscriptionCourses(courses: EnrolledCourseCardDto[]): EnrolledCourseCardDto[] {
  return [...courses].sort((a, b) => {
    if (a.isCompleted !== b.isCompleted) return a.isCompleted ? -1 : 1;
    return b.progressPercentage - a.progressPercentage;
  });
}

export function sumCourseStationCounts(
  paths: CoursePathProgressDto[],
): { completed: number; total: number } {
  return paths.reduce(
    (acc, path) => ({
      completed: acc.completed + path.completedStations,
      total: acc.total + path.totalStations,
    }),
    { completed: 0, total: 0 },
  );
}

export function isLifetimeEnrollmentEnd(endsAt: string | null): boolean {
  if (!endsAt) return true;
  const year = new Date(endsAt).getUTCFullYear();
  return Number.isFinite(year) && year >= 9999;
}

export function mapSubscriptionsDashboardDto(item: unknown): SubscriptionsDashboardDto | null {
  const row = asRecord(item);
  if (!row) return null;

  const coursesRaw = Array.isArray(row.courses) ? row.courses : [];
  const statsRow = asRecord(row.stats) ?? {};

  return {
    studentName: toOptionalString(row.studentName),
    stats: {
      totalCourses: toNumber(statsRow.totalCourses),
      newCoursesThisMonth: toNumber(statsRow.newCoursesThisMonth),
      overallProgressPercentage: toNumber(statsRow.overallProgressPercentage),
      completedCoursesCount: toNumber(statsRow.completedCoursesCount),
      totalLearningHoursApproximate: toNumber(statsRow.totalLearningHoursApproximate),
      betterThanPeersPercentile:
        statsRow.betterThanPeersPercentile != null
          ? toNumber(statsRow.betterThanPeersPercentile)
          : null,
    },
    courses: coursesRaw
      .map(mapEnrolledCourseCard)
      .filter((course): course is EnrolledCourseCardDto => course != null),
  };
}

function mapCoursePathProgress(row: unknown): CoursePathProgressDto | null {
  const record = asRecord(row);
  if (!record) return null;
  const pathId = toOptionalString(record.pathId);
  if (!pathId) return null;

  return {
    pathId,
    pathName: toOptionalString(record.pathName),
    pathProgressStatus: toNumber(
      record.pathProgressStatus,
      StudentPathProgressStatus.Locked,
    ) as StudentPathProgressStatus,
    totalStations: toNumber(record.totalStations),
    completedStations: toNumber(record.completedStations),
    requiredStations: toNumber(record.requiredStations),
    stationProgressPercent: toNumber(record.stationProgressPercent),
  };
}

export function mapCourseProgressDto(item: unknown): CourseProgressDto | null {
  const row = asRecord(item);
  if (!row) return null;
  const courseId = toOptionalString(row.courseId);
  if (!courseId) return null;

  const pathsRaw = Array.isArray(row.paths) ? row.paths : [];

  return {
    courseId,
    totalPaths: toNumber(row.totalPaths),
    completedPaths: toNumber(row.completedPaths),
    courseProgressPercent: toNumber(row.courseProgressPercent),
    hasFinalExam: Boolean(row.hasFinalExam),
    finalExamPassed: Boolean(row.finalExamPassed),
    canViewCertificate: Boolean(row.canViewCertificate),
    paths: pathsRaw
      .map(mapCoursePathProgress)
      .filter((path): path is CoursePathProgressDto => path != null),
  };
}

export function mapLearningPathDropdownItem(row: unknown): LearningPathDropdownItemDto | null {
  const record = asRecord(row);
  if (!record) return null;
  const id = toOptionalString(record.id);
  if (!id) return null;
  return { id, name: toOptionalString(record.name) };
}

function mapMilestoneBox(row: unknown): MilestoneBoxDto | null {
  const record = asRecord(row);
  if (!record) return null;
  const order = toNumber(record.order);
  if (order < 1) return null;

  return {
    order,
    pointsReward: toNumber(record.pointsReward),
    requiredCompletedStations: toNumber(record.requiredCompletedStations),
    afterStationOrder: toNumber(record.afterStationOrder),
    completedStations: toNumber(record.completedStations),
    totalRequiredStations: toNumber(record.totalRequiredStations),
    isEligible: Boolean(record.isEligible),
    isOpened: Boolean(record.isOpened),
  };
}

export function mapLearningPathStationsProgressDto(
  item: unknown,
): LearningPathStationsProgressDto | null {
  const row = asRecord(item);
  if (!row) return null;
  const learningPathId = toOptionalString(row.learningPathId);
  if (!learningPathId) return null;

  const stationsRaw = Array.isArray(row.stations) ? row.stations : [];
  const milestonesRaw = Array.isArray(row.milestoneBoxes) ? row.milestoneBoxes : [];

  return {
    learningPathId,
    learningPathTitle: toOptionalString(row.learningPathTitle),
    stations: stationsRaw
      .map(mapPathStationProgress)
      .filter((station): station is PathStationProgressDto => station != null)
      .sort((a, b) => a.order - b.order),
    milestoneBoxes: milestonesRaw
      .map(mapMilestoneBox)
      .filter((box): box is MilestoneBoxDto => box != null)
      .sort((a, b) => a.order - b.order),
  };
}

export function mapMilestoneOpenResult(item: unknown): MilestoneOpenResultDto | null {
  const row = asRecord(item);
  if (!row) return null;

  return {
    milestoneOrder: toNumber(row.milestoneOrder),
    pointsAwarded: toNumber(row.pointsAwarded),
    totalPoints: row.totalPoints != null ? toNumber(row.totalPoints) : null,
    currentLevel: row.currentLevel != null ? toNumber(row.currentLevel) : null,
    pointsToNextLevel:
      row.pointsToNextLevel != null ? toNumber(row.pointsToNextLevel) : null,
  };
}

export function isMilestoneClaimable(
  milestone: MilestoneBoxDto,
  stations: PathStationProgressDto[],
): boolean {
  if (milestone.isOpened) return false;
  if (milestone.isEligible) return true;

  const completedBeforeMilestone = stations.filter(
    (station) =>
      station.order <= milestone.afterStationOrder &&
      station.status === StudentStationProgressStatus.Completed,
  ).length;

  return completedBeforeMilestone >= milestone.requiredCompletedStations;
}

/** Insert milestone chests after `afterStationOrder` (mobile `journey_ui_mapper`). */
export function buildProgressTimelineNodes(
  stations: PathStationProgressDto[],
  milestoneBoxes: MilestoneBoxDto[],
): ProgressTimelineNode[] {
  const sortedStations = [...stations].sort((a, b) => a.order - b.order);
  const boxes = [...milestoneBoxes].sort((a, b) => a.order - b.order);
  const placed = new Set<number>();
  const nodes: ProgressTimelineNode[] = [];

  for (const station of sortedStations) {
    nodes.push({
      kind: "station",
      id: `station-${station.stationId}`,
      station,
    });

    for (const box of boxes) {
      if (placed.has(box.order)) continue;
      if (station.order === box.afterStationOrder) {
        nodes.push({ kind: "chest", id: `chest-${box.order}`, milestone: box });
        placed.add(box.order);
      }
    }
  }

  for (const box of boxes) {
    if (placed.has(box.order)) continue;
    nodes.push({ kind: "chest", id: `chest-${box.order}`, milestone: box });
  }

  return nodes;
}

export function journeyCompletionLevelProgress(
  pointsEarned: number,
  pointsToNextLevel: number,
): number {
  if (pointsEarned <= 0 && pointsToNextLevel <= 0) return 0.75;
  const span = pointsEarned + pointsToNextLevel;
  if (span <= 0) return 0;
  return Math.min(1, Math.max(0, pointsEarned / span));
}

export function buildJourneyCompletionNotice(input: {
  variant?: "station" | "path";
  pointsEarned: number;
  currentLevel?: number | null;
  pointsToNextLevel?: number | null;
}): JourneyCompletionNotice {
  const pointsEarned = Math.max(0, input.pointsEarned);
  const currentLevel = input.currentLevel ?? 1;
  const pointsToNextLevel = input.pointsToNextLevel ?? 0;

  return {
    variant: input.variant ?? "station",
    pointsEarned,
    currentLevel,
    pointsToNextLevel,
    levelProgress: journeyCompletionLevelProgress(pointsEarned, pointsToNextLevel),
  };
}

export function hasActiveLiveStation(stations: PathStationProgressDto[]): boolean {
  return stations.some(
    (station) =>
      station.stationType === StationType.LiveStream &&
      station.liveSessionSchedule?.runtimeMode === LiveSessionRuntimeMode.Live,
  );
}

/** Figma live chip: `{days} أيام | {hh} ساعات | {mm} دقيقة | {ss} ثانية` */
export function formatCountdown(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const days = Math.floor(safe / 86_400);
  const hours = Math.floor((safe % 86_400) / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const secs = safe % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${days} أيام | ${pad(hours)} ساعات | ${pad(minutes)} دقيقة | ${pad(secs)} ثانية`;
}

export function resolveActivePathId(
  paths: CoursePathProgressDto[],
  preferredPathId?: string | null,
): string | null {
  if (preferredPathId && paths.some((path) => path.pathId === preferredPathId)) {
    return preferredPathId;
  }
  const inProgress = paths.find(
    (path) => path.pathProgressStatus === StudentPathProgressStatus.InProgress,
  );
  if (inProgress) return inProgress.pathId;
  const available = paths.find(
    (path) => path.pathProgressStatus === StudentPathProgressStatus.Available,
  );
  if (available) return available.pathId;
  return paths[0]?.pathId ?? null;
}

export function resolveActiveCourseId(
  courses: EnrolledCourseCardDto[],
  preferredCourseId?: string | null,
): string | null {
  if (preferredCourseId && courses.some((course) => course.courseId === preferredCourseId)) {
    return preferredCourseId;
  }
  return courses[0]?.courseId ?? null;
}
