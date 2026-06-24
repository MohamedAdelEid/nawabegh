import type {
  TeacherCalendarDay,
  TeacherFeaturedSession,
  TeacherScheduleData,
  TeacherScheduleParams,
  TeacherScheduleSessionRow,
  TeacherScheduleTopic,
} from "@/modules/teacher/domain/types/teacher.types";
import { formatNumber } from "@/shared/application/lib/format";
import { httpClient } from "@/shared/infrastructure/http/httpClient";
import { resolveFileUrl } from "@/shared/infrastructure/files/fileUrl";
import { formatDateTime, formatDuration } from "@/modules/teacher/infrastructure/api/teacherLiveSessionsApi";

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord | null {
  return value !== null && typeof value === "object" ? (value as UnknownRecord) : null;
}

function readString(record: UnknownRecord | null, keys: string[], fallback = ""): string {
  if (!record) return fallback;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string") return value;
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
  }
  return fallback;
}

function readNumber(record: UnknownRecord | null, keys: string[], fallback?: number): number | null {
  if (!record) return fallback ?? null;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() !== "" && !Number.isNaN(Number(value))) {
      return Number(value);
    }
  }
  return fallback ?? null;
}

function readBoolean(record: UnknownRecord | null, keys: string[], fallback = false): boolean {
  if (!record) return fallback;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "boolean") return value;
  }
  return fallback;
}

function readArray(record: UnknownRecord | null, keys: string[]): unknown[] {
  if (!record) return [];
  for (const key of keys) {
    const value = record[key];
    if (Array.isArray(value)) return value;
  }
  return [];
}

function extractEnvelopeData(data: unknown): unknown {
  const record = asRecord(data);
  return record?.data ?? data;
}

function formatTimeRange(startUtc: string, endUtc: string, locale: string): string {
  if (!startUtc) return "—";
  try {
    const formatter = new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" });
    const start = formatter.format(new Date(startUtc));
    if (!endUtc) return start;
    return `${start} - ${formatter.format(new Date(endUtc))}`;
  } catch {
    return "—";
  }
}

function formatDateBadge(utc: string, locale: string): string {
  if (!utc) return "—";
  try {
    const date = new Intl.DateTimeFormat(locale, { weekday: "short" }).format(new Date(utc));
    const day = new Intl.DateTimeFormat(locale, { day: "numeric" }).format(new Date(utc));
    return `${date} ${day}`;
  } catch {
    return "—";
  }
}

function mapFeaturedStatus(runtimeMode: string, status: string): TeacherFeaturedSession["status"] {
  const normalized = (runtimeMode || status).toLowerCase();
  if (normalized === "live") return "live";
  if (normalized === "upcoming" || normalized === "scheduled") return "upcoming";
  return "ready";
}

function mapSessionCard(item: unknown): UnknownRecord | null {
  return asRecord(item);
}

function mapFeaturedSession(item: unknown, locale: string): TeacherFeaturedSession | null {
  const row = mapSessionCard(item);
  const id = readString(row, ["liveSessionId", "id"]);
  if (!id) return null;

  const runtimeMode = readString(row, ["runtimeMode"]);
  const status = readString(row, ["status"]);
  const relativeLabel = readString(row, ["relativeLabelAr", "relativeLabel"], "");

  return {
    id,
    stationId: readString(row, ["stationId"], "") || undefined,
    title: readString(row, ["sessionTitle", "title"], "—"),
    level: [readString(row, ["gradeNameAr"], ""), readString(row, ["subjectNameAr"], "")]
      .filter(Boolean)
      .join(" · ") || "—",
    status: mapFeaturedStatus(runtimeMode, status),
    registeredCount: readNumber(row, ["enrolledCount"], 0) ?? 0,
    durationMinutes: readNumber(row, ["durationMinutes"], 0) ?? 0,
    resourceCount: readNumber(row, ["attachmentCount"], 0) ?? 0,
    statusLabel: relativeLabel || readString(row, ["status"], "—"),
    canStartBroadcast: readBoolean(row, ["canStartBroadcast"], false),
    coverImageUrl: resolveFileUrl(readString(row, ["coverImageUrl"], "")) || null,
  };
}

function mapCalendarDay(item: unknown, locale: string): TeacherCalendarDay | null {
  const row = asRecord(item);
  const dateUtc = readString(row, ["dateUtc", "date"]);
  if (!dateUtc) return null;

  const date = new Date(dateUtc);
  const today = new Date();
  const isToday =
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();

  const dayLabel = locale.startsWith("ar")
    ? readString(row, ["dayLabelAr"], "")
    : new Intl.DateTimeFormat(locale, { weekday: "long" }).format(date);

  const sessions = readArray(row, ["sessions"])
    .map((sessionItem) => {
      const session = asRecord(sessionItem);
      const id = readString(session, ["liveSessionId", "id"]);
      if (!id) return null;
      const scheduledAtUtc = readString(session, ["scheduledAtUtc", "scheduledAt"]);
      return {
        id,
        title: readString(session, ["sessionTitle", "title"], "—"),
        timeLabel: scheduledAtUtc
          ? new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" }).format(
              new Date(scheduledAtUtc),
            )
          : "—",
      };
    })
    .filter((session): session is NonNullable<typeof session> => session !== null);

  return {
    dateUtc,
    dayLabel: dayLabel || new Intl.DateTimeFormat(locale, { weekday: "long" }).format(date),
    dayNumber: date.getDate(),
    isToday,
    sessions,
  };
}

function mapScheduleSessionRow(item: unknown, locale: string): TeacherScheduleSessionRow | null {
  const row = mapSessionCard(item);
  const id = readString(row, ["liveSessionId", "id"]);
  if (!id) return null;

  const scheduledAtUtc = readString(row, ["scheduledAtUtc", "scheduledAt"]);
  const scheduledEndUtc = readString(row, ["scheduledEndUtc"]);
  const previews = readArray(row, ["enrolledStudentPreviews"]);

  return {
    id,
    stationId: readString(row, ["stationId"], "") || undefined,
    dateBadge: formatDateBadge(scheduledAtUtc, locale),
    title: readString(row, ["sessionTitle", "title"], "—"),
    level: [readString(row, ["gradeNameAr"], ""), readString(row, ["subjectNameAr"], "")]
      .filter(Boolean)
      .join(" · ") || "—",
    instructor: readString(row, ["lecturerName", "responsibleTeacherName"], "—"),
    timeRangeLabel: formatTimeRange(scheduledAtUtc, scheduledEndUtc, locale),
    studentCount: readNumber(row, ["enrolledCount"], 0) ?? 0,
    avatarCount: Math.min(previews.length, 4),
    canStartBroadcast: readBoolean(row, ["canStartBroadcast"], false),
  };
}

function mapUpcomingTopic(item: unknown, locale: string): TeacherScheduleTopic | null {
  const row = mapSessionCard(item);
  const id = readString(row, ["liveSessionId", "id"]);
  if (!id) return null;

  const scheduledAtUtc = readString(row, ["scheduledAtUtc", "scheduledAt"]);
  const badge =
    readString(row, ["relativeLabelAr", "relativeLabel"], "") ||
    (scheduledAtUtc ? formatDateTime(scheduledAtUtc, locale) : "—");

  return {
    id,
    title: readString(row, ["sessionTitle", "title"], "—"),
    badge,
    liveSessionId: id,
  };
}

function mapSchedule(
  scheduleData: unknown,
  upcomingData: unknown,
  locale: string,
): TeacherScheduleData {
  const record = asRecord(extractEnvelopeData(scheduleData));
  const performance = asRecord(record?.performance);
  const completedSessions = readNumber(performance, ["completedSessionsCount"], 0) ?? 0;
  const plannedSessions = readNumber(performance, ["totalSessionsCount"], 0) ?? 0;
  const completionPercent = readNumber(performance, ["completionPercent"], 0) ?? 0;

  const featuredRaw = record?.featuredSession;
  const featuredSession =
    mapFeaturedSession(featuredRaw, locale) ??
    ({
      id: "",
      title: "—",
      level: "—",
      status: "ready",
      registeredCount: 0,
      durationMinutes: 0,
      resourceCount: 0,
      statusLabel: "—",
      canStartBroadcast: false,
      coverImageUrl: null,
    } satisfies TeacherFeaturedSession);

  const calendarDays = readArray(record, ["calendar"])
    .map((day) => mapCalendarDay(day, locale))
    .filter((day): day is TeacherCalendarDay => day !== null);

  const sessions = readArray(record, ["sessionsList"])
    .map((item) => mapScheduleSessionRow(item, locale))
    .filter((row): row is TeacherScheduleSessionRow => row !== null);

  const upcomingRecord = asRecord(extractEnvelopeData(upcomingData));
  const topics = readArray(upcomingRecord, ["upcomingSessions"])
    .map((item) => mapUpcomingTopic(item, locale))
    .filter((topic): topic is TeacherScheduleTopic => topic !== null);

  const performanceMessage =
    locale.startsWith("ar")
      ? completionPercent >= 80
        ? `أداء ممتاز! أكملت ${formatNumber(Math.round(completionPercent), locale)}% من مهامك المخططة هذا الأسبوع.`
        : `أكملت ${formatNumber(completedSessions, locale)} من ${formatNumber(plannedSessions, locale)} جلسة هذا الأسبوع.`
      : completionPercent >= 80
        ? `Excellent performance! You completed ${formatNumber(Math.round(completionPercent), locale)}% of your planned weekly tasks.`
        : `You completed ${formatNumber(completedSessions, locale)} of ${formatNumber(plannedSessions, locale)} sessions this week.`;

  return {
    completedSessions,
    plannedSessions,
    completionPercent,
    performanceMessage,
    topics,
    featuredSession,
    calendarDays,
    sessions,
    rangeStart: readString(record, ["rangeStart"], "") || undefined,
    rangeEnd: readString(record, ["rangeEnd"], "") || undefined,
  };
}

export async function fetchTeacherSchedule(
  params: TeacherScheduleParams = {},
  locale = "ar",
): Promise<TeacherScheduleData> {
  const view = params.view ?? "weekly";
  const upcomingLimit = params.upcomingLimit ?? 5;

  const [scheduleResponse, upcomingResponse] = await Promise.all([
    httpClient.get<unknown>({
      url: "/api/v1/Teacher/schedule",
      params: {
        view,
        ...(params.anchorDate ? { anchorDate: params.anchorDate } : {}),
      },
    }),
    httpClient.get<unknown>({
      url: "/api/v1/Teacher/schedule/upcoming",
      params: { limit: upcomingLimit },
    }),
  ]);

  if (scheduleResponse.status !== "Success" && !scheduleResponse.isSuccess) {
    throw new Error(scheduleResponse.error?.message ?? "Failed to load schedule");
  }

  if (upcomingResponse.status !== "Success" && !upcomingResponse.isSuccess) {
    throw new Error(upcomingResponse.error?.message ?? "Failed to load upcoming sessions");
  }

  return mapSchedule(scheduleResponse.data, upcomingResponse.data, locale);
}
