import type {
  TeacherKpiStat,
  TeacherLiveSessionRow,
  TeacherLiveSessionsData,
  TeacherLiveSessionsListParams,
  TeacherSessionDetails,
  TeacherSessionTask,
} from "@/modules/teacher/domain/types/teacher.types";
import { formatNumber } from "@/shared/application/lib/format";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { httpClient } from "@/shared/infrastructure/http/httpClient";
import { parseXPaginationHeader } from "@/shared/infrastructure/http/xPagination";
import { resolveFileUrl } from "@/shared/infrastructure/files/fileUrl";

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

function formatTrend(changePercent: number | null, locale: string) {
  if (changePercent === null) return {};
  const rounded = Math.round(changePercent * 10) / 10;
  if (rounded === 0) return {};
  const formatted = formatNumber(Math.abs(rounded), locale);
  if (rounded > 0) return { trend: `+${formatted}%`, trendDirection: "up" as const };
  return { trend: `-${formatted}%`, trendDirection: "down" as const };
}

function formatDateTime(utc: string, locale: string): string {
  if (!utc) return "—";
  try {
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(utc));
  } catch {
    return "—";
  }
}

function formatTimeRange(startUtc: string, endUtc: string, locale: string): string {
  if (!startUtc) return "—";
  try {
    const formatter = new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" });
    const start = formatter.format(new Date(startUtc));
    if (!endUtc) return start;
    const end = formatter.format(new Date(endUtc));
    return `${start} - ${end}`;
  } catch {
    return "—";
  }
}

function formatDuration(minutes: number | null, locale: string): string {
  if (minutes === null || minutes <= 0) return "—";
  if (locale.startsWith("ar")) return `${formatNumber(minutes, locale)} دقيقة`;
  return `${formatNumber(minutes, locale)} min`;
}

function mapRuntimeStatus(runtimeMode: string, status: string): TeacherLiveSessionRow["status"] {
  const normalized = (runtimeMode || status).toLowerCase();
  if (normalized === "live") return "live";
  if (normalized === "upcoming" || normalized === "scheduled") return "upcoming";
  if (normalized === "recorded" || normalized === "recordingavailable") return "recorded";
  return "ended";
}

function mapSessionRow(item: unknown, locale: string): TeacherLiveSessionRow | null {
  const row = asRecord(item);
  const id = readString(row, ["liveSessionId", "id"]);
  if (!id) return null;

  const scheduledAtUtc = readString(row, ["scheduledAtUtc", "scheduledAt"]);
  const durationMinutes = readNumber(row, ["durationMinutes"], 0) ?? 0;

  return {
    id,
    stationId: readString(row, ["stationId"], "") || undefined,
    courseId: readString(row, ["courseId"], "") || undefined,
    title: readString(row, ["sessionTitle", "title"], "—"),
    subject: readString(row, ["subjectNameAr", "subjectName"], "—"),
    lecturer: readString(row, ["lecturerName", "responsibleTeacherName"], "—"),
    dateTimeLabel: formatDateTime(scheduledAtUtc, locale),
    durationLabel: formatDuration(durationMinutes, locale),
    status: mapRuntimeStatus(readString(row, ["runtimeMode"]), readString(row, ["status"])),
    attendanceCount: readNumber(row, ["attendanceCount"], 0) ?? 0,
  };
}

function buildStats(data: unknown, locale: string): TeacherKpiStat[] {
  const record = asRecord(extractEnvelopeData(data));
  const totalLiveHours = readNumber(record, ["totalLiveHours"], 0) ?? 0;
  const totalAttendanceCount = readNumber(record, ["totalAttendanceCount"], 0) ?? 0;
  const averageRating = readNumber(record, ["averageRating"], 0) ?? 0;

  return [
    {
      id: "totalStreaming",
      labelKey: "liveSessions.stats.totalStreaming",
      value: formatNumber(Math.round(totalLiveHours * 10) / 10, locale),
    },
    {
      id: "liveAttendance",
      labelKey: "liveSessions.stats.liveAttendance",
      value: formatNumber(totalAttendanceCount, locale),
    },
    {
      id: "sessionsRating",
      labelKey: "liveSessions.stats.sessionsRating",
      value: `${formatNumber(Math.round(averageRating * 10) / 10, locale)}/5`,
    },
  ];
}

function statusToApiParam(status: TeacherLiveSessionsListParams["status"]): string | undefined {
  if (!status || status === "all") return undefined;
  if (status === "live") return "Live";
  if (status === "upcoming") return "Upcoming";
  if (status === "ended") return "Ended";
  if (status === "recorded") return "RecordingAvailable";
  return undefined;
}

function mapWorkspaceStatus(runtimeMode: string, status: string): TeacherSessionDetails["status"] {
  const mapped = mapRuntimeStatus(runtimeMode, status);
  if (mapped === "recorded") return "ended";
  return mapped;
}

function mapRelatedLessonStatus(runtimeMode: string, status: string): "watched" | "comingSoon" {
  const normalized = (runtimeMode || status).toLowerCase();
  if (normalized === "recorded" || normalized === "ended" || normalized === "recordingavailable") {
    return "watched";
  }
  return "comingSoon";
}

function formatFileSize(bytes: number | null, locale: string): string {
  if (!bytes || bytes <= 0) return "—";
  const units = locale.startsWith("ar")
    ? (["بايت", "ك.ب", "م.ب", "ج.ب"] as const)
    : (["B", "KB", "MB", "GB"] as const);
  let size = bytes;
  let unit = 0;
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit += 1;
  }
  const formatted = size >= 10 || unit === 0 ? Math.round(size) : Math.round(size * 10) / 10;
  return `${formatted} ${units[unit]}`;
}

function mapFileType(fileType: string): string {
  return fileType.trim() || "application/pdf";
}

function mapWorkspace(data: unknown, locale: string): TeacherSessionDetails | null {
  const record = asRecord(extractEnvelopeData(data));
  if (!record) return null;

  const id = readString(record, ["liveSessionId", "id"]);
  if (!id) return null;

  const scheduledAtUtc = readString(record, ["scheduledAtUtc", "scheduledAt"]);
  const scheduledEndUtc = readString(record, ["scheduledEndUtc"]);
  const durationMinutes = readNumber(record, ["durationMinutes"], 0) ?? 0;
  const enrolledCount = readNumber(record, ["enrolledCount"], 0) ?? 0;
  const attendanceCount = readNumber(record, ["attendanceCount"], 0) ?? 0;
  const attendancePercent =
    enrolledCount > 0 ? Math.round((attendanceCount / enrolledCount) * 100) : 0;

  const responsibleTeacher = asRecord(record.responsibleTeacher);
  const instructor =
    readString(record, ["responsibleTeacherName"], "") ||
    readString(responsibleTeacher, ["fullName", "name"], "—");

  const goals = readArray(record, ["goals"])
    .map((item) => readString(asRecord(item), ["text", "title"], ""))
    .filter(Boolean);

  const tasks = readArray(record, ["tasks"])
    .map((item): TeacherSessionTask | null => {
      const row = asRecord(item);
      const taskId = readString(row, ["id"], "");
      const title = readString(row, ["title", "text"], "");
      if (!taskId && !title) return null;
      return {
        id: taskId || title,
        label: title,
        completed: readBoolean(row, ["isCompleted", "completed"], false),
      };
    })
    .filter((task): task is TeacherSessionTask => task !== null);

  const resources = readArray(record, ["learningResources"])
    .map((item) => {
      const row = asRecord(item);
      const resourceId = readString(row, ["id", "fileId"], "");
      const title = readString(row, ["fileName", "title", "name"], "");
      if (!resourceId && !title) return null;
      const fileUrl = resolveFileUrl(readString(row, ["fileUrl", "url"], ""));
      const fileTypeRaw = readString(row, ["fileType", "type"], "");
      const fileSizeBytes = readNumber(row, ["fileSizeBytes", "fileSize"]);
      const sizeLabel =
        readString(row, ["sizeLabel", "fileSizeLabel"], "") ||
        formatFileSize(fileSizeBytes, locale);
      return {
        id: resourceId || title,
        title: title || "—",
        fileType: mapFileType(fileTypeRaw),
        mediaKind: readString(row, ["mediaKind"], "") || null,
        sizeLabel,
        fileUrl: fileUrl || undefined,
      };
    })
    .filter((resource): resource is NonNullable<typeof resource> => resource !== null);

  const relatedLessons = readArray(record, ["relatedSessions"])
    .map((item) => {
      const row = asRecord(item);
      const lessonId = readString(row, ["liveSessionId", "id"], "");
      if (!lessonId) return null;
      const coverImageUrl = resolveFileUrl(readString(row, ["coverImageUrl"], ""));
      return {
        id: lessonId,
        title: readString(row, ["sessionTitle", "title"], "—"),
        status: mapRelatedLessonStatus(
          readString(row, ["runtimeMode"]),
          readString(row, ["status"]),
        ),
        imageUrl: coverImageUrl || "",
      };
    })
    .filter((lesson): lesson is NonNullable<typeof lesson> => lesson !== null);

  let dateLabel = readString(record, ["scheduledDate"], "");
  if (!dateLabel && scheduledAtUtc) {
    try {
      dateLabel = new Intl.DateTimeFormat(locale, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(new Date(scheduledAtUtc));
    } catch {
      dateLabel = "—";
    }
  }

  const timeRangeLabel =
    scheduledAtUtc || scheduledEndUtc
      ? formatTimeRange(scheduledAtUtc, scheduledEndUtc, locale)
      : readString(record, ["scheduledTime"], "—");

  return {
    id,
    stationId: readString(record, ["stationId"], "") || undefined,
    courseId: readString(record, ["courseId"], "") || undefined,
    title: readString(record, ["sessionTitle", "title"], "—"),
    courseTitle: readString(record, ["courseTitle"], "") || undefined,
    subjectName: readString(record, ["subjectNameAr", "subjectName"], "") || undefined,
    gradeName: readString(record, ["gradeNameAr", "gradeName"], "") || undefined,
    status: mapWorkspaceStatus(readString(record, ["runtimeMode"]), readString(record, ["status"])),
    instructor,
    dateLabel: dateLabel || "—",
    timeRangeLabel,
    durationLabel: formatDuration(durationMinutes, locale),
    attendancePercent,
    enrolledCount,
    attendanceCount,
    overview: readString(record, ["description"], "—"),
    goals,
    tasks,
    resources,
    relatedLessons,
    canStartBroadcast: readBoolean(record, ["canStartBroadcast"], false),
    hostTokenPath: readString(record, ["hostTokenPath"], "") || undefined,
    relativeLabel: readString(record, ["relativeLabelAr", "relativeLabel"], "") || undefined,
    coverImageUrl: resolveFileUrl(readString(record, ["coverImageUrl", "courseCoverImageUrl"], "")) || null,
  };
}

export async function fetchTeacherLiveSessionsPage(
  params: TeacherLiveSessionsListParams = {},
  locale = "ar",
): Promise<TeacherLiveSessionsData> {
  const pageNumber = params.page ?? 1;
  const pageSize = params.pageSize ?? 10;

  const [statsResponse, listResponse] = await Promise.all([
    httpClient.get<unknown>({ url: "/api/v1/Teacher/live-sessions/stats" }),
    httpClient.get<unknown>({
      url: "/api/v1/Teacher/live-sessions",
      params: {
        pageNumber,
        pageSize,
        ...(params.keyword?.trim() ? { keyword: params.keyword.trim() } : {}),
        ...(params.subject?.trim() && params.subject !== "all"
          ? { subject: params.subject.trim() }
          : {}),
        ...(statusToApiParam(params.status) ? { status: statusToApiParam(params.status) } : {}),
      },
    }),
  ]);

  if (statsResponse.status !== "Success" && !statsResponse.isSuccess) {
    throw new Error(statsResponse.error?.message ?? "Failed to load live session stats");
  }

  if (listResponse.status !== "Success" && !listResponse.isSuccess) {
    throw new Error(listResponse.error?.message ?? "Failed to load live sessions");
  }

  const headerMeta = parseXPaginationHeader(listResponse.headers ?? {});
  const sessions = extractListRows(listResponse.data)
    .map((item) => mapSessionRow(item, locale))
    .filter((row): row is TeacherLiveSessionRow => row !== null);

  const totalItems = headerMeta?.totalCount ?? sessions.length;

  return {
    stats: buildStats(statsResponse.data, locale),
    sessions,
    pagination: {
      currentPage: headerMeta?.currentPage ?? pageNumber,
      totalPages: headerMeta?.totalPages ?? 1,
      totalItems,
      pageSize: headerMeta?.pageSize ?? pageSize,
    },
  };
}

export async function fetchTeacherLiveSessionWorkspace(
  sessionId: string,
  locale = "ar",
): Promise<TeacherSessionDetails | null> {
  const response = await httpClient.get<unknown>({
    url: `/api/v1/Teacher/live-sessions/${encodeURIComponent(sessionId)}/workspace`,
  });

  if (response.status === "NotFound" || response.statusCode === 404) {
    return null;
  }

  if (response.status !== "Success" && !response.isSuccess) {
    throw new Error(response.error?.message ?? "Failed to load live session workspace");
  }

  return mapWorkspace(response.data, locale);
}

export async function endTeacherLiveSession(sessionId: string): Promise<void> {
  const response = await httpClient.post<unknown>({
    url: `/api/v1/live-sessions/${encodeURIComponent(sessionId)}/end`,
  });

  if (response.status !== "Success" && !response.isSuccess) {
    throw new Error(response.error?.message ?? "Failed to end live session");
  }
}

export function getTeacherLiveSessionEditHref(
  row: Pick<TeacherLiveSessionRow, "courseId" | "stationId">,
): string | null {
  if (!row.courseId) return null;
  if (row.stationId) {
    return ROUTES.USER.TEACHER.JOURNEY_EDITOR.LIVE_BROADCAST_VIEW(row.courseId, row.stationId);
  }
  return ROUTES.USER.TEACHER.JOURNEY_EDITOR.EDITOR(row.courseId);
}

export { formatTrend, formatDateTime, formatDuration, mapRuntimeStatus };
