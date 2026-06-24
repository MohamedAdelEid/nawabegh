import type { TeacherDashboardData } from "@/modules/teacher/domain/types/teacher.types";
import { formatNumber } from "@/shared/application/lib/format";
import { httpClient } from "@/shared/infrastructure/http/httpClient";
import { resolveFileUrl } from "@/shared/infrastructure/files/fileUrl";

const DASHBOARD_URL = "/api/v1/Teacher/dashboard";

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

function toPercent(value: number | null): number {
  if (value === null) return 0;
  return value <= 1 ? Math.round(value * 100) : Math.round(value);
}

function formatTrend(delta: number | null, locale: string): { trend?: string; trendDirection?: "up" | "down" | "neutral" } {
  if (delta === null || delta === 0) return {};
  const formatted = formatNumber(Math.abs(delta), locale);
  if (delta > 0) return { trend: `+${formatted}`, trendDirection: "up" };
  return { trend: `-${formatted}`, trendDirection: "down" };
}

function formatSessionTime(utc: string, locale: string): string {
  if (!utc) return "—";
  try {
    return new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" }).format(new Date(utc));
  } catch {
    return "—";
  }
}

function formatDayLabel(dateUtc: string, locale: string, dayNameAr?: string): string {
  if (locale.startsWith("ar") && dayNameAr) return dayNameAr;
  if (!dateUtc) return dayNameAr ?? "—";
  try {
    return new Intl.DateTimeFormat(locale, { weekday: "long" }).format(new Date(dateUtc));
  } catch {
    return dayNameAr ?? "—";
  }
}

function mapAlertTone(severity: string): "danger" | "warning" {
  const normalized = severity.toLowerCase();
  if (normalized.includes("danger") || normalized.includes("critical") || normalized.includes("error")) {
    return "danger";
  }
  return "warning";
}

function mapDashboardData(data: unknown, locale: string): TeacherDashboardData | null {
  const record = asRecord(data);
  if (!record) return null;

  const summary = asRecord(record.summary);
  const performanceAnalysis = asRecord(record.performanceAnalysis);
  const previousWeekAverageRate = toPercent(
    readNumber(performanceAnalysis, ["previousWeekAverageRate"], 0),
  );

  const currentWeek = readArray(performanceAnalysis, ["currentWeek"]);
  const currentWeekChart = currentWeek.map((item) => {
    const row = asRecord(item);
    const dateUtc = readString(row, ["dateUtc"]);
    return {
      dayLabel: formatDayLabel(dateUtc, locale, readString(row, ["dayNameAr"])),
      interactionRate: toPercent(readNumber(row, ["interactionRate"], 0)),
      referenceAverage: previousWeekAverageRate,
    };
  });

  const previousWeek = readArray(performanceAnalysis, ["previousWeek"]);
  const previousWeekChart =
    previousWeek.length > 0
      ? previousWeek.map((item) => {
          const row = asRecord(item);
          const dateUtc = readString(row, ["dateUtc"]);
          return {
            dayLabel: formatDayLabel(dateUtc, locale, readString(row, ["dayNameAr"])),
            interactionRate: toPercent(readNumber(row, ["interactionRate"], 0)),
          };
        })
      : currentWeekChart.map((point) => ({
          dayLabel: point.dayLabel,
          interactionRate: previousWeekAverageRate,
        }));

  const managedCourses = readArray(record, ["managedCourses"]);
  const courses = managedCourses
    .map((item) => {
      const row = asRecord(item);
      const id = readString(row, ["courseId", "id"]);
      if (!id) return null;
      const coverImageUrl = readString(row, ["coverImageUrl"], "") || null;
      return {
        id,
        title: readString(row, ["title"], "—"),
        durationWeeks: readNumber(row, ["weekCount"], 0) ?? 0,
        studentCount: readNumber(row, ["studentCount"], 0) ?? 0,
        progressPercent: readNumber(row, ["completionPercent"], 0) ?? 0,
        imageUrl: resolveFileUrl(coverImageUrl),
      };
    })
    .filter((course): course is NonNullable<typeof course> => course !== null);

  const todayLiveSessions = readArray(record, ["todayLiveSessions"]);
  const liveClasses = todayLiveSessions
    .map((item) => {
      const row = asRecord(item);
      const id = readString(row, ["liveSessionId", "id"]);
      if (!id) return null;
      const scheduledAtUtc = readString(row, ["scheduledAtUtc"]);
      const isLive = readBoolean(row, ["isLive"]);
      return {
        id,
        title: readString(row, ["title"], "—"),
        courseTitle: readString(row, ["courseTitle"], "") || undefined,
        timeLabel: formatSessionTime(scheduledAtUtc, locale),
        status: isLive ? ("active" as const) : ("upcoming" as const),
      };
    })
    .filter((session): session is NonNullable<typeof session> => session !== null);

  const performanceAlerts = readArray(record, ["performanceAlerts"]);
  const alerts = performanceAlerts
    .map((item, index) => {
      const row = asRecord(item);
      const title = readString(row, ["titleAr", "title"], "");
      if (!title) return null;
      return {
        id: `${readString(row, ["type"], "alert")}-${index}`,
        tone: mapAlertTone(readString(row, ["severity"], "Warning")),
        title,
        description: readString(row, ["bodyAr", "body"], ""),
      };
    })
    .filter((alert): alert is NonNullable<typeof alert> => alert !== null);

  const activeCoursesDelta = readNumber(summary, ["activeCoursesDelta"]);
  const totalStudentsDelta = readNumber(summary, ["totalStudentsDelta"]);
  const activeCoursesTrend = formatTrend(activeCoursesDelta, locale);
  const totalStudentsTrend = formatTrend(totalStudentsDelta, locale);

  const todayLiveSessionsCount = readNumber(summary, ["todayLiveSessions"], 0) ?? 0;
  const totalStudents =
    readNumber(summary, ["totalStudents"]) ?? readNumber(record, ["totalStudents"], 0) ?? 0;
  const activeCourses = readNumber(summary, ["activeCourses"], 0) ?? 0;

  return {
    level: {
      level: readNumber(summary, ["performanceLevel"], 1) ?? 1,
      qualityLabelKey: "home.level.quality",
      currentXp: readNumber(summary, ["performanceQualityIndex"], 0) ?? 0,
      maxXp: readNumber(summary, ["performanceQualityMax"], 100) ?? 100,
    },
    stats: [
      {
        id: "todaySessions",
        labelKey: "home.stats.todaySessions",
        value: formatNumber(todayLiveSessionsCount, locale),
      },
      {
        id: "totalStudents",
        labelKey: "home.stats.totalStudents",
        value: formatNumber(totalStudents, locale),
        ...totalStudentsTrend,
      },
      {
        id: "activeCourses",
        labelKey: "home.stats.activeCourses",
        value: formatNumber(activeCourses, locale),
        ...activeCoursesTrend,
      },
    ],
    performanceChart: {
      currentWeek: currentWeekChart,
      previousWeek: previousWeekChart,
    },
    courses,
    liveClasses,
    alerts,
  };
}

export async function fetchTeacherDashboard(locale: string): Promise<TeacherDashboardData> {
  const response = await httpClient.get<unknown>({ url: DASHBOARD_URL });

  if (response.status !== "Success" && !response.isSuccess) {
    throw new Error(response.error?.message ?? "Failed to load teacher dashboard");
  }

  const mapped = mapDashboardData(response.data, locale);
  if (!mapped) {
    throw new Error("Invalid teacher dashboard response");
  }

  return mapped;
}
