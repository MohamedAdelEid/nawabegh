import { CourseAccessType } from "@/shared/domain/enums/course.enums";
import {
  LearningPathStatus,
  StationAccessPolicy,
  StationProgressStatus,
  StationType,
} from "@/shared/domain/enums/learning-path.enums";
import {
  EMPTY_COURSE_DETAILS_CHAT,
  type CourseDetailsChatDto,
  type CourseDetailsDto,
  type CourseDetailsLearningPathDto,
  type CourseDetailsModel,
  type CourseDetailsNextLearningPathDto,
  type CourseDetailsNextStationDto,
  type CourseDetailsStationDto,
  type CourseDetailsTeacherDto,
  type CourseFaqItemDto,
  type CourseLearningOutcomeDto,
} from "@/shared/domain/types/course.types";

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

function mapLearningPathStatus(value: unknown): LearningPathStatus {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value as LearningPathStatus;
  }
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    const byName: Record<string, LearningPathStatus> = {
      draft: LearningPathStatus.Draft,
      pending: LearningPathStatus.Pending,
      approved: LearningPathStatus.Approved,
      rejected: LearningPathStatus.Rejected,
    };
    const mapped = byName[normalized];
    if (mapped != null) return mapped;
  }
  return LearningPathStatus.Approved;
}

function mapStationAccessPolicy(value: unknown): StationAccessPolicy {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value as StationAccessPolicy;
  }
  if (typeof value === "string") {
    return value.trim().toLowerCase() === "subscribers"
      ? StationAccessPolicy.Subscribers
      : StationAccessPolicy.All;
  }
  return StationAccessPolicy.All;
}

function mapStationType(row: UnknownRecord): StationType {
  if (typeof row.stationType === "number" && Number.isFinite(row.stationType)) {
    return row.stationType as StationType;
  }
  if (typeof row.type === "string") {
    const byName: Record<string, StationType> = {
      livestream: StationType.LiveStream,
      flashcards: StationType.Flashcards,
      shortquiz: StationType.ShortQuiz,
      challenge: StationType.Challenge,
      helperresource: StationType.HelperResource,
      recordedlecture: StationType.RecordedLecture,
    };
    const key = row.type.replace(/\s+/g, "").toLowerCase();
    const mapped = byName[key];
    if (mapped != null) return mapped;
  }
  return StationType.RecordedLecture;
}

function mapLearningOutcome(item: unknown): CourseLearningOutcomeDto | null {
  const row = asRecord(item);
  if (!row) return null;
  const id = toOptionalString(row.id);
  if (!id) return null;
  return {
    id,
    title: toOptionalString(row.title),
    description: toOptionalString(row.description),
    iconKey: toOptionalString(row.iconKey),
    order: toNumber(row.order),
  };
}

function mapFaqItem(item: unknown): CourseFaqItemDto | null {
  const row = asRecord(item);
  if (!row) return null;
  const id = toOptionalString(row.id);
  if (!id) return null;
  return {
    id,
    question: toOptionalString(row.question),
    answer: toOptionalString(row.answer),
    order: toNumber(row.order),
  };
}

function mapStation(item: unknown): CourseDetailsStationDto | null {
  const row = asRecord(item);
  if (!row) return null;
  const id = toOptionalString(row.id);
  if (!id) return null;
  return {
    id,
    name: toOptionalString(row.name),
    stationType: mapStationType(row),
    progressStatus: toNumber(
      row.progressStatus,
      StationProgressStatus.NotStarted,
    ) as StationProgressStatus,
    isLocked: Boolean(row.isLocked),
    accessPolicy: mapStationAccessPolicy(row.accessPolicy),
  };
}

function mapLearningPath(item: unknown): CourseDetailsLearningPathDto | null {
  const row = asRecord(item);
  if (!row) return null;
  const id = toOptionalString(row.id);
  if (!id) return null;

  const stations = Array.isArray(row.stations)
    ? row.stations
        .map((station, index) => ({
          order: toNumber(asRecord(station)?.order, index),
          station,
        }))
        .sort((a, b) => a.order - b.order)
        .map(({ station }) => mapStation(station))
        .filter((s): s is CourseDetailsStationDto => s != null)
    : [];

  return {
    id,
    title: toOptionalString(row.title),
    stationsCount: toNumber(row.stationsCount, stations.length),
    completedStations: toNumber(row.completedStations),
    progressPercent: toNumber(row.progressPercent),
    status: mapLearningPathStatus(row.status),
    isLocked: Boolean(row.isLocked),
    stations,
  };
}

function mapTeacher(teacher: unknown): CourseDetailsTeacherDto | null {
  const row = asRecord(teacher);
  if (!row) return null;

  const id = toOptionalString(row.id) || toOptionalString(row.teacherId);
  if (!id) return null;

  return {
    id,
    fullName: toOptionalString(row.fullName),
    avatarUrl: toOptionalString(row.avatarUrl),
    jobTitle: toOptionalString(row.jobTitle),
    about: toOptionalString(row.about),
    rating: toNumber(row.rating),
    yearsOfExperience: toNumber(row.yearsOfExperience),
    studentCount: toNumber(row.studentCount),
    publishedCoursesCount: toNumber(row.publishedCoursesCount),
    isExpert: Boolean(row.isExpert),
    expertBadgeLabel: toOptionalString(row.expertBadgeLabel),
  };
}

function mapDetailsChat(chat: unknown): CourseDetailsChatDto {
  const row = asRecord(chat);
  if (!row) return EMPTY_COURSE_DETAILS_CHAT;

  const avatarUrls = (
    Array.isArray(row.previewParticipantAvatarUrls)
      ? (row.previewParticipantAvatarUrls as unknown[])
      : []
  )
    .map((url) => (typeof url === "string" ? url.trim() : ""))
    .filter(Boolean);

  return {
    id: toOptionalString(row.chatGroupId) || toOptionalString(row.id),
    name: toOptionalString(row.groupName) || toOptionalString(row.name),
    participantsCount: toNumber(row.participantsCount),
    previewParticipantAvatarUrls: avatarUrls,
    additionalParticipantsCount: toNumber(row.additionalParticipantsCount),
    canEnterChat: Boolean(row.canEnterChat),
  };
}

function mapNextLearningPath(value: unknown): CourseDetailsNextLearningPathDto | null {
  const row = asRecord(value);
  if (!row) return null;
  const id = toOptionalString(row.id);
  if (!id) return null;
  return {
    id,
    title: toOptionalString(row.title),
    progressPercent: toNumber(row.progressPercent),
    stationsCount: toNumber(row.stationsCount),
    completedStations: toNumber(row.completedStations),
    isLocked: Boolean(row.isLocked),
  };
}

function mapNextStation(value: unknown): CourseDetailsNextStationDto | null {
  const row = asRecord(value);
  if (!row) return null;
  const id = toOptionalString(row.id);
  if (!id) return null;
  return {
    id,
    name: toOptionalString(row.name),
    stationType: mapStationType(row),
    progressStatus: toNumber(
      row.progressStatus,
      StationProgressStatus.NotStarted,
    ) as StationProgressStatus,
    isLocked: Boolean(row.isLocked),
    accessPolicy: mapStationAccessPolicy(row.accessPolicy),
  };
}

export function mapCourseDetailsDto(item: unknown): CourseDetailsDto | null {
  const row = asRecord(item);
  if (!row) return null;

  const id = toOptionalString(row.id);
  if (!id) return null;

  const learningOutcomes = Array.isArray(row.learningOutcomes)
    ? row.learningOutcomes
        .map(mapLearningOutcome)
        .filter((o): o is CourseLearningOutcomeDto => o != null)
        .sort((a, b) => a.order - b.order)
    : [];

  const faqItems = Array.isArray(row.faqItems)
    ? row.faqItems
        .map(mapFaqItem)
        .filter((f): f is CourseFaqItemDto => f != null)
        .sort((a, b) => a.order - b.order)
    : [];

  const learningPaths = Array.isArray(row.learningPaths)
    ? row.learningPaths
        .map((path, index) => ({
          order: toNumber(asRecord(path)?.order, index),
          path,
        }))
        .sort((a, b) => a.order - b.order)
        .map(({ path }) => mapLearningPath(path))
        .filter((p): p is CourseDetailsLearningPathDto => p != null)
    : [];

  return {
    id,
    title: toOptionalString(row.title),
    description: toOptionalString(row.description),
    subjectId: toNumber(row.subjectId),
    subjectNameAr: toOptionalString(row.subjectNameAr),
    subjectNameEn: toOptionalString(row.subjectNameEn),
    gradeId: toNumber(row.gradeId),
    gradeNameAr: toOptionalString(row.gradeNameAr),
    term: toNumber(row.term),
    coverImageUrl: toOptionalString(row.coverImageUrl),
    promoVideoUrl: toOptionalString(row.promoVideoUrl),
    prerequisites: toOptionalString(row.prerequisites),
    targetAudience: toOptionalString(row.targetAudience),
    courseLevel: toNumber(row.courseLevel),
    learningOutcomes,
    faqItems,
    accessType: toNumber(row.accessType, CourseAccessType.Free) as CourseAccessType,
    originalPrice: toNumber(row.originalPrice),
    discountedPrice: toNumber(row.discountedPrice),
    discountPercent: toNumber(row.discountPercent),
    currency: toOptionalString(row.currency),
    enrolledStudentsCount: toNumber(row.enrolledStudentsCount),
    isEnrolled: Boolean(row.isEnrolled),
    progressPercentage: toNumber(row.progressPercentage),
    isBestSeller: Boolean(row.isBestSeller),
    actionLabel: toOptionalString(row.actionLabel),
    teacher: mapTeacher(row.teacher),
    learningPaths,
    chat: mapDetailsChat(row.chat),
    nextLearningPath: mapNextLearningPath(row.nextLearningPath),
    nextStation: mapNextStation(row.nextStation),
  };
}

export function mapCourseDetailsToModel(
  dto: CourseDetailsDto,
  locale: string,
): CourseDetailsModel {
  const isArabic = locale.startsWith("ar");

  return {
    id: dto.id,
    title: dto.title,
    description: dto.description,
    subjectName: isArabic ? dto.subjectNameAr : dto.subjectNameEn || dto.subjectNameAr,
    gradeName: dto.gradeNameAr,
    coverImageUrl: dto.coverImageUrl?.trim() || null,
    promoVideoUrl: dto.promoVideoUrl?.trim() || null,
    prerequisites: dto.prerequisites,
    targetAudience: dto.targetAudience,
    accessType: dto.accessType,
    originalPrice: dto.originalPrice,
    discountedPrice: dto.discountedPrice,
    discountPercent: dto.discountPercent,
    currency: dto.currency,
    enrolledStudentsCount: dto.enrolledStudentsCount,
    isEnrolled: dto.isEnrolled,
    progressPercentage: dto.progressPercentage,
    isBestSeller: dto.isBestSeller,
    actionLabel: dto.actionLabel,
    learningOutcomes: dto.learningOutcomes,
    faqItems: dto.faqItems,
    teacher: dto.teacher,
    learningPaths: dto.learningPaths,
    chat: dto.chat,
    nextLearningPath: dto.nextLearningPath,
    nextStation: dto.nextStation,
  };
}
