import type {
  TeacherCourseStatisticsData,
  TeacherCoursesStatisticsOverviewData,
  TeacherCourseWeeklyPerformancePoint,
  TeacherCoursesStatisticsAlert,
  TeacherCoursePerformanceCard,
  TeacherCourseWeeklyInteractionPoint,
  TeacherInteractiveStudent,
  TeacherInteractionBoost,
  TeacherKpiStat,
  TeacherStationInsight,
} from "@/modules/teacher/domain/types/teacher.types";
import { formatNumber } from "@/shared/application/lib/format";
import { httpClient } from "@/shared/infrastructure/http/httpClient";
import { resolveFileUrl } from "@/shared/infrastructure/files/fileUrl";

type UnknownRecord = Record<string, unknown>;

export type TeacherCoursesStatisticsOverviewParams = {
  periodDays?: number;
  subjectId?: number;
  gradeId?: number;
  locale?: string;
};

export type TeacherCourseStatisticsParams = {
  periodDays?: number;
  locale?: string;
};

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

function formatTrend(
  delta: number | null,
  locale: string,
): { trend?: string; trendDirection?: "up" | "down" | "neutral" } {
  if (delta === null || delta === undefined) return {};
  if (delta === 0) return { trend: "0%", trendDirection: "neutral" };
  const formatted = formatNumber(Math.abs(delta), locale);
  if (delta > 0) return { trend: `+${formatted}%`, trendDirection: "up" };
  return { trend: `-${formatted}%`, trendDirection: "down" };
}

function mapAlertSeverity(severity: string): TeacherCoursesStatisticsAlert["tone"] {
  const normalized = severity.toLowerCase();
  if (normalized.includes("danger") || normalized.includes("critical")) return "danger";
  if (normalized.includes("warning")) return "warning";
  return "neutral";
}

function mapOverviewKpis(kpis: UnknownRecord | null, locale: string): TeacherKpiStat[] {
  if (!kpis) return [];

  const entries: Array<{ id: string; labelKey: string; valueKey: string; changeKey?: string }> = [
    { id: "totalStudents", labelKey: "coursesStatisticsOverview.stats.totalStudents", valueKey: "totalStudents", changeKey: "totalStudentsChangePercent" },
    { id: "engagementRate", labelKey: "coursesStatisticsOverview.stats.engagementRate", valueKey: "engagementRatePercent", changeKey: "engagementRateChangePercent" },
    { id: "attendanceRate", labelKey: "coursesStatisticsOverview.stats.attendanceRate", valueKey: "attendanceRatePercent", changeKey: "attendanceRateChangePercent" },
    { id: "averageGrade", labelKey: "coursesStatisticsOverview.stats.averageGrade", valueKey: "averageGrade", changeKey: "averageGradeChangePercent" },
    { id: "outstandingStudents", labelKey: "coursesStatisticsOverview.stats.outstandingStudents", valueKey: "outstandingStudentsCount", changeKey: "outstandingStudentsChangePercent" },
    { id: "activeStudents", labelKey: "coursesStatisticsOverview.stats.activeStudents", valueKey: "activeStudentsCount", changeKey: "activeStudentsChangePercent" },
  ];

  return entries.map(({ id, labelKey, valueKey, changeKey }) => {
    const rawValue = readNumber(kpis, [valueKey], 0) ?? 0;
    const isPercent = valueKey.includes("Percent") || valueKey.includes("Rate");
    const value = isPercent ? `${rawValue}%` : valueKey === "averageGrade" ? `${rawValue}/100` : formatNumber(rawValue, locale);
    const change = changeKey ? readNumber(kpis, [changeKey]) : null;
    return {
      id,
      labelKey,
      value,
      ...formatTrend(change, locale),
    };
  });
}

function mapCoursePerformanceCard(item: unknown): TeacherCoursePerformanceCard | null {
  const record = asRecord(item);
  if (!record) return null;
  const id = readString(record, ["courseId", "id"], "").trim();
  if (!id) return null;

  const completionPercent = readNumber(record, ["completionPercent"], 0) ?? 0;
  const achievementTone =
    completionPercent >= 80 ? "success" : completionPercent >= 50 ? "primary" : "warning";

  return {
    id,
    title: readString(record, ["title"], "—"),
    subjectName: readString(record, ["subjectNameAr"], ""),
    gradeName: readString(record, ["gradeNameAr"], ""),
    coverImageUrl: resolveFileUrl(readString(record, ["coverImageUrl"], "") || null),
    studentCount: readNumber(record, ["studentCount"], 0) ?? 0,
    statusLabel: "",
    statusTone: "neutral",
    achievementPercent: completionPercent,
    achievementTone,
    interactionPercent: readNumber(record, ["averageGrade"], 0) ?? 0,
    attendancePercent: readNumber(record, ["attendanceRatePercent"], 0) ?? 0,
    strugglingCount: readNumber(record, ["strugglingStudentCount"], 0) ?? 0,
  };
}

export async function fetchTeacherCoursesStatisticsOverview(
  params: TeacherCoursesStatisticsOverviewParams = {},
): Promise<TeacherCoursesStatisticsOverviewData> {
  const locale = params.locale ?? "ar";
  const response = await httpClient.get<unknown>({
    url: "/api/v1/Teacher/courses-statistics",
    params: {
      periodDays: params.periodDays ?? 30,
      ...(params.subjectId != null ? { subjectId: params.subjectId } : {}),
      ...(params.gradeId != null ? { gradeId: params.gradeId } : {}),
    },
  });

  if (response.status !== "Success" && !response.isSuccess) {
    throw new Error(response.error?.message ?? "Failed to load courses statistics");
  }

  const data = asRecord(extractEnvelopeData(response.data));
  if (!data) throw new Error("Invalid statistics response");

  const kpis = asRecord(data.kpis);
  const alerts = readArray(data, ["criticalAlerts"]).map((item, index) => {
    const record = asRecord(item);
    return {
      id: readString(record, ["alertType"], `alert-${index}`),
      tone: mapAlertSeverity(readString(record, ["severity"], "warning")),
      title: readString(record, ["titleAr", "title"], ""),
      description: readString(record, ["messageAr", "message"], ""),
      count: readNumber(record, ["count"]),
    } satisfies TeacherCoursesStatisticsAlert;
  });

  const weeklyActivity: TeacherCourseWeeklyInteractionPoint[] = readArray(data, ["studentActivityChart"]).map(
    (item) => {
      const record = asRecord(item);
      return {
        dayLabel: readString(record, ["dayLabelAr", "dayLabel"], "—"),
        interaction: readNumber(record, ["currentWeekValue"], 0) ?? 0,
        reference: readNumber(record, ["previousWeekValue"], 0) ?? 0,
      };
    },
  );

  const coursePerformance = readArray(data, ["coursePerformance"])
    .map(mapCoursePerformanceCard)
    .filter((card): card is TeacherCoursePerformanceCard => card !== null);

  return {
    stats: mapOverviewKpis(kpis, locale),
    alerts,
    weeklyActivity,
    coursePerformance,
    filters: {
      periodDays: readNumber(asRecord(data.filters), ["periodDays"], 30) ?? 30,
      subjectId: readNumber(asRecord(data.filters), ["subjectId"]),
      gradeId: readNumber(asRecord(data.filters), ["gradeId"]),
    },
  };
}

function mapStationInsight(record: UnknownRecord | null): TeacherStationInsight | null {
  if (!record) return null;
  const stationId = readString(record, ["stationId", "id"], "").trim();
  if (!stationId) return null;

  return {
    stationId,
    learningPathTitle: readString(record, ["learningPathTitle"], "—"),
    stationName: readString(record, ["stationName"], "—"),
    metricPercent: readNumber(record, ["metricPercent"], 0) ?? 0,
    metricType: readString(record, ["metricType"], ""),
    descriptionAr: readString(record, ["descriptionAr", "description"], ""),
  };
}

function mapInteractionBoost(record: UnknownRecord | null): TeacherInteractionBoost | null {
  if (!record) return null;
  const titleAr = readString(record, ["titleAr", "title"], "").trim();
  const descriptionAr = readString(record, ["descriptionAr", "description"], "").trim();
  if (!titleAr && !descriptionAr) return null;

  return {
    titleAr,
    descriptionAr,
    actionLabelAr: readString(record, ["actionLabelAr", "actionLabel"], ""),
    suggestionType: readString(record, ["suggestionType"], ""),
  };
}

function mapDetailKpis(kpis: UnknownRecord | null, locale: string): TeacherKpiStat[] {
  if (!kpis) return [];

  const entries: Array<{ id: string; labelKey: string; valueKey: string; changeKey?: string; suffix?: string }> = [
    {
      id: "enrolledStudents",
      labelKey: "courses.statistics.stats.enrolledStudents",
      valueKey: "enrolledStudentCount",
      changeKey: "enrolledStudentsChangePercent",
    },
    { id: "activeStudents", labelKey: "courses.statistics.stats.activeStudents", valueKey: "activeStudentCount" },
    {
      id: "sessionAttendance",
      labelKey: "courses.statistics.stats.sessionAttendance",
      valueKey: "sessionAttendanceRatePercent",
      changeKey: "sessionAttendanceChangePercent",
      suffix: "%",
    },
    {
      id: "avgGrades",
      labelKey: "courses.statistics.stats.avgGrades",
      valueKey: "averageGrade",
      changeKey: "averageGradeChangePercent",
      suffix: "/100",
    },
    {
      id: "completionRate",
      labelKey: "courses.statistics.stats.completionRate",
      valueKey: "completionRatePercent",
      changeKey: "completionRateChangePercent",
      suffix: "%",
    },
  ];

  return entries.map(({ id, labelKey, valueKey, changeKey, suffix }) => {
    const rawValue = readNumber(kpis, [valueKey], 0) ?? 0;
    const value = suffix === "/100" ? `${rawValue}/100` : suffix ? `${rawValue}${suffix}` : formatNumber(rawValue, locale);
    const change = changeKey ? readNumber(kpis, [changeKey]) : null;
    return { id, labelKey, value, ...formatTrend(change, locale) };
  });
}

export async function fetchTeacherCourseStatisticsDetail(
  courseId: string,
  params: TeacherCourseStatisticsParams = {},
): Promise<TeacherCourseStatisticsData> {
  const locale = params.locale ?? "ar";
  const response = await httpClient.get<unknown>({
    url: `/api/v1/Teacher/courses-statistics/${encodeURIComponent(courseId)}`,
    params: { periodDays: params.periodDays ?? 30 },
  });

  if (response.status !== "Success" && !response.isSuccess) {
    throw new Error(response.error?.message ?? "Failed to load course statistics");
  }

  const data = asRecord(extractEnvelopeData(response.data));
  if (!data) throw new Error("Invalid course statistics response");

  const header = asRecord(data.header);
  const kpis = asRecord(data.kpis);

  const performanceChart: TeacherCourseWeeklyPerformancePoint[] = readArray(data, ["performanceChart"]).map(
    (item, index) => {
      const record = asRecord(item);
      const weekLabel = readString(record, ["weekLabelAr", "weekLabel", "label"], "");
      return {
        weekLabel: weekLabel || (locale.startsWith("ar") ? `الأسبوع ${index + 1}` : `Week ${index + 1}`),
        weekStart: readString(record, ["weekStart"], "") || undefined,
        currentValue: readNumber(record, ["currentValue"], 0) ?? 0,
        previousValue: readNumber(record, ["previousValue"], 0) ?? 0,
      };
    },
  );

  const topInteractingStudents: TeacherInteractiveStudent[] = readArray(data, ["topInteractingStudents"]).map(
    (item) => {
      const record = asRecord(item);
      return {
        id: readString(record, ["studentId", "id"], ""),
        name: readString(record, ["fullName", "name"], "—"),
        profileImageUrl: resolveFileUrl(readString(record, ["profileImageUrl"], "") || null),
        interactionPoints: readNumber(record, ["interactionPoints"], 0) ?? 0,
      };
    },
  );

  const upcomingLiveSessions = readArray(data, ["upcomingLiveSessions"]).map((item) => {
    const record = asRecord(item);
    return {
      id: readString(record, ["liveSessionId", "id"], ""),
      title: readString(record, ["sessionTitle", "title"], "—"),
      scheduledAtUtc: readString(record, ["scheduledAtUtc"], ""),
      relativeLabelAr: readString(record, ["relativeLabelAr", "dateLabel"], ""),
    };
  });

  return {
    courseId: readString(header, ["courseId"], courseId),
    header: {
      courseId: readString(header, ["courseId"], courseId),
      title: readString(header, ["title"], "—"),
      subjectNameAr: readString(header, ["subjectNameAr", "subjectName"], ""),
      gradeNameAr: readString(header, ["gradeNameAr", "gradeName"], ""),
      coverImageUrl: resolveFileUrl(readString(header, ["coverImageUrl"], "") || null),
      enrolledStudentCount: readNumber(header, ["enrolledStudentCount", "studentCount"], 0) ?? 0,
      learningPathCount: readNumber(header, ["learningPathCount"], 0) ?? 0,
      averageCompletionPercent: readNumber(header, ["averageCompletionPercent"], 0) ?? 0,
    },
    stats: mapDetailKpis(kpis, locale),
    performanceChart,
    topInteractingStudents,
    upcomingLiveSessions,
    highestAchievement: mapStationInsight(asRecord(data.highestAchievement)),
    hardestLesson: mapStationInsight(asRecord(data.hardestLesson)),
    interactionBoost: mapInteractionBoost(asRecord(data.interactionBoost)),
  };
}
