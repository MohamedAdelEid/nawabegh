import type {
  TeacherInstructorMetric,
  TeacherKpiStat,
  TeacherLiveAnalyticsData,
  TeacherLiveAnalyticsParams,
} from "@/modules/teacher/domain/types/teacher.types";
import { formatNumber } from "@/shared/application/lib/format";
import { httpClient } from "@/shared/infrastructure/http/httpClient";
import { parseXPaginationHeader } from "@/shared/infrastructure/http/xPagination";
import { resolveFileUrl } from "@/shared/infrastructure/files/fileUrl";
import { formatDateTime, formatTrend } from "@/modules/teacher/infrastructure/api/teacherLiveSessionsApi";

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

function extractListRows(data: unknown): unknown[] {
  const unwrapped = extractEnvelopeData(data);
  if (Array.isArray(unwrapped)) return unwrapped;
  const record = asRecord(unwrapped);
  if (!record) return [];
  for (const key of ["items", "results", "records", "list", "rows", "data"]) {
    const value = record[key];
    if (Array.isArray(value)) return value;
  }
  return [];
}

function formatRelativeLastSeen(utc: string | null, locale: string): string {
  if (!utc) {
    return locale.startsWith("ar") ? "لم يحضر من قبل" : "Never attended";
  }

  const date = new Date(utc);
  if (Number.isNaN(date.getTime())) return "—";

  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    return locale.startsWith("ar") ? "آخر ظهور: اليوم" : "Last seen: today";
  }
  if (diffDays === 1) {
    return locale.startsWith("ar") ? "آخر ظهور: أمس" : "Last seen: yesterday";
  }
  if (locale.startsWith("ar")) {
    return `آخر ظهور: منذ ${formatNumber(diffDays, locale)} أيام`;
  }
  return `Last seen: ${diffDays} days ago`;
}

function formatSessionDateLabel(utc: string, locale: string): string {
  if (!utc) return "—";
  try {
    const date = new Date(utc);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    const sameDay = (a: Date, b: Date) =>
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate();

    if (sameDay(date, today)) {
      return locale.startsWith("ar") ? "اليوم" : "Today";
    }
    if (sameDay(date, tomorrow)) {
      return locale.startsWith("ar") ? "غداً" : "Tomorrow";
    }

    return new Intl.DateTimeFormat(locale, {
      weekday: "long",
      month: "short",
      day: "numeric",
    }).format(date);
  } catch {
    return "—";
  }
}

function formatSessionTime(utc: string, locale: string): string {
  if (!utc) return "—";
  try {
    return new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" }).format(
      new Date(utc),
    );
  } catch {
    return "—";
  }
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
}

function mapAnalytics(data: unknown, locale: string): Omit<TeacherLiveAnalyticsData, "absentStudents" | "totalAbsentCount"> {
  const record = asRecord(extractEnvelopeData(data));
  const kpis = asRecord(record?.kpis);
  const lecturerPerformance = asRecord(record?.lecturerPerformance);

  const stats: TeacherKpiStat[] = [
    {
      id: "totalAttendance",
      labelKey: "liveAnalytics.stats.totalAttendance",
      value: formatNumber(readNumber(kpis, ["totalAttendanceCount"], 0) ?? 0, locale),
      ...formatTrend(readNumber(kpis, ["totalAttendanceChangePercent"]), locale),
    },
    {
      id: "avgWatchTime",
      labelKey: "liveAnalytics.stats.avgWatchTime",
      value: formatNumber(Math.round(readNumber(kpis, ["averageWatchMinutes"], 0) ?? 0), locale),
      ...formatTrend(readNumber(kpis, ["averageWatchMinutesChangePercent"]), locale),
    },
    {
      id: "peakViews",
      labelKey: "liveAnalytics.stats.peakViews",
      value: formatNumber(readNumber(kpis, ["highestSessionAttendanceCount"], 0) ?? 0, locale),
      ...formatTrend(readNumber(kpis, ["highestSessionAttendanceChangePercent"]), locale),
    },
    {
      id: "interactionRate",
      labelKey: "liveAnalytics.stats.interactionRate",
      value: `${formatNumber(Math.round(readNumber(kpis, ["interactionRatePercent"], 0) ?? 0), locale)}%`,
      ...formatTrend(readNumber(kpis, ["interactionRateChangePercent"]), locale),
    },
  ];

  const upcomingSessions = readArray(record, ["upcomingSessions"])
    .map((item) => {
      const row = asRecord(item);
      const id = readString(row, ["liveSessionId", "id"]);
      if (!id) return null;
      const scheduledAtUtc = readString(row, ["scheduledAtUtc", "scheduledAt"]);
      return {
        id,
        title: readString(row, ["title", "sessionTitle"], "—"),
        courseTitle: readString(row, ["courseTitle"], "") || undefined,
        dateLabel: formatSessionDateLabel(scheduledAtUtc, locale),
        timeLabel: formatSessionTime(scheduledAtUtc, locale),
        studentCount: readNumber(row, ["studentCount", "enrolledCount"], 0) ?? 0,
      };
    })
    .filter((session): session is NonNullable<typeof session> => session !== null);

  const attendanceRatePercent = readNumber(lecturerPerformance, ["attendanceRatePercent"], 0) ?? 0;
  const sessionsTaughtCount = readNumber(lecturerPerformance, ["sessionsTaughtCount"], 0) ?? 0;
  const totalAttendedStudents = readNumber(lecturerPerformance, ["totalAttendedStudents"], 0) ?? 0;

  const instructorMetrics: TeacherInstructorMetric[] = [
    {
      id: "attendance",
      labelKey: "liveAnalytics.metrics.attendance",
      percent: Math.round(attendanceRatePercent),
      tone: "success",
    },
    {
      id: "sessionsTaught",
      labelKey: "liveAnalytics.metrics.sessionsTaught",
      percent: Math.min(100, sessionsTaughtCount * 5),
      value: formatNumber(sessionsTaughtCount, locale),
      tone: "warning",
    },
    {
      id: "totalAttended",
      labelKey: "liveAnalytics.metrics.totalAttended",
      percent: Math.min(100, Math.round(totalAttendedStudents / 5)),
      value: formatNumber(totalAttendedStudents, locale),
      tone: "primary",
    },
  ];

  const attendanceChart = readArray(record, ["attendanceChart"]).map((item, index, array) => {
    const row = asRecord(item);
    const dayLabelAr = readString(row, ["dayLabelAr"], "");
    const dateUtc = readString(row, ["dateUtc"], "");
    const dayLabel =
      locale.startsWith("ar") && dayLabelAr
        ? dayLabelAr
        : dateUtc
          ? new Intl.DateTimeFormat(locale, { weekday: "short" }).format(new Date(dateUtc))
          : dayLabelAr || "—";

    return {
      dayLabel,
      attendance: readNumber(row, ["attendanceCount"], 0) ?? 0,
      isHighlighted: index === array.length - 1,
    };
  });

  return {
    stats,
    upcomingSessions,
    instructorMetrics,
    tipKey: "liveAnalytics.tip.body",
    attendanceChart,
    absentSessionTitle: "",
    absentSessionTime: "",
  };
}

export async function fetchTeacherLiveAnalytics(
  params: TeacherLiveAnalyticsParams = {},
  locale = "ar",
): Promise<TeacherLiveAnalyticsData> {
  const chartPeriod = params.chartPeriod ?? "weekly";
  const absentPage = params.absentPage ?? 1;
  const absentPageSize = params.absentPageSize ?? 5;

  const [analyticsResponse, absentResponse] = await Promise.all([
    httpClient.get<unknown>({
      url: "/api/v1/Teacher/live-sessions/analytics",
      params: { chartPeriod },
    }),
    httpClient.get<unknown>({
      url: "/api/v1/Teacher/live-sessions/analytics/absent-students",
      params: {
        pageNumber: absentPage,
        pageSize: absentPageSize,
        ...(params.absentKeyword?.trim() ? { keyword: params.absentKeyword.trim() } : {}),
        ...(params.absentLiveSessionId ? { liveSessionId: params.absentLiveSessionId } : {}),
      },
    }),
  ]);

  if (analyticsResponse.status !== "Success" && !analyticsResponse.isSuccess) {
    throw new Error(analyticsResponse.error?.message ?? "Failed to load live analytics");
  }

  if (absentResponse.status !== "Success" && !absentResponse.isSuccess) {
    throw new Error(absentResponse.error?.message ?? "Failed to load absent students");
  }

  const analytics = mapAnalytics(analyticsResponse.data, locale);
  const absentHeaderMeta = parseXPaginationHeader(absentResponse.headers ?? {});
  const absentRows = extractListRows(absentResponse.data);

  const absentStudents = absentRows
    .map((item) => {
      const row = asRecord(item);
      const studentId = readString(row, ["studentId", "id"]);
      if (!studentId) return null;
      const fullName = readString(row, ["fullName", "name"], "—");
      const profileImageUrl = resolveFileUrl(readString(row, ["profileImageUrl"], "")) || null;
      return {
        id: `${studentId}-${readString(row, ["liveSessionId"], "")}`,
        studentId,
        liveSessionId: readString(row, ["liveSessionId"], "") || undefined,
        fullName,
        lastSeenLabel: formatRelativeLastSeen(
          readString(row, ["lastSeenAtUtc"], "") || null,
          locale,
        ),
        avatarInitials: getInitials(fullName),
        profileImageUrl,
        sessionTitle: readString(row, ["sessionTitle"], "") || undefined,
        courseTitle: readString(row, ["courseTitle"], "") || undefined,
      };
    })
    .filter((student): student is NonNullable<typeof student> => student !== null);

  const firstAbsent = asRecord(absentRows[0]);
  const absentSessionTitle =
    readString(firstAbsent, ["sessionTitle"], "") ||
    analytics.upcomingSessions[0]?.title ||
    "";
  const absentSessionScheduledAt = readString(firstAbsent, ["sessionScheduledAtUtc"], "");
  const absentSessionTime = absentSessionScheduledAt
    ? `${formatSessionDateLabel(absentSessionScheduledAt, locale)}, ${formatSessionTime(absentSessionScheduledAt, locale)}`
    : "";

  return {
    ...analytics,
    absentSessionTitle,
    absentSessionTime,
    totalAbsentCount: absentHeaderMeta?.totalCount ?? absentStudents.length,
    absentStudents,
  };
}
