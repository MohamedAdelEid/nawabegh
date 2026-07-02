import type {
  TeacherSubscriberListItem,
  TeacherSubscriberProfileData,
  TeacherSubscriberRankingsData,
  TeacherSubscribersListData,
} from "@/modules/teacher/domain/types/teacher.types";
import { httpClient } from "@/shared/infrastructure/http/httpClient";
import { resolveFileUrl } from "@/shared/infrastructure/files/fileUrl";

type UnknownRecord = Record<string, unknown>;

export type TeacherCourseSubscribersListParams = {
  keyword?: string;
  pageNumber?: number;
  pageSize?: number;
};

export type TeacherCourseSubscriberRankingsParams = {
  limit?: number;
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

function readNumber(record: UnknownRecord | null, keys: string[], fallback = 0): number {
  if (!record) return fallback;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() !== "" && !Number.isNaN(Number(value))) {
      return Number(value);
    }
  }
  return fallback;
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

function assertSuccess(response: {
  status?: string;
  isSuccess?: boolean;
  error?: { message?: string } | null;
}) {
  if (response.status !== "Success" && !response.isSuccess) {
    throw new Error(response.error?.message ?? "Request failed");
  }
}

function formatDayLabel(dateUtc: string, locale: string): string {
  const date = new Date(dateUtc);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(locale, { weekday: "short" }).format(date);
}

function mapSubscriberListItem(item: unknown): TeacherSubscriberListItem | null {
  const record = asRecord(item);
  if (!record) return null;
  const studentUserId = readString(record, ["studentUserId", "id"], "").trim();
  if (!studentUserId) return null;

  return {
    studentUserId,
    fullName: readString(record, ["fullName", "name"], "—"),
    profileImageUrl: resolveFileUrl(readString(record, ["profileImageUrl"], "") || null),
    username: readString(record, ["username"], ""),
    gradeName: readString(record, ["gradeName"], ""),
    email: readString(record, ["email"], ""),
    isActive: readBoolean(record, ["isActive"], true),
    statusLabelAr: readString(record, ["statusLabelAr", "statusLabel"], ""),
    enrolledAt: readString(record, ["enrolledAt"], ""),
    progressPercent: readNumber(record, ["progressPercent"], 0),
    averageScorePercent: readNumber(record, ["averageScorePercent"], 0),
    lastActivityAt: readString(record, ["lastActivityAt"], "") || null,
  };
}

function mapSubscriberListItems(rawItems: unknown[]): TeacherSubscriberListItem[] {
  return rawItems
    .map(mapSubscriberListItem)
    .filter((item): item is TeacherSubscriberListItem => item !== null);
}

export async function fetchTeacherCourseSubscriberRankings(
  courseId: string,
  params: TeacherCourseSubscriberRankingsParams = {},
): Promise<TeacherSubscriberRankingsData> {
  const response = await httpClient.get<unknown>({
    url: `/api/v1/Teacher/courses/${encodeURIComponent(courseId)}/subscribers/rankings`,
    params: { limit: params.limit ?? 5 },
  });

  assertSuccess(response);

  const data = asRecord(extractEnvelopeData(response.data));
  const rankings = readArray(data, ["rankings"]).map((item) => {
    const record = asRecord(item);
    return {
      rank: readNumber(record, ["rank"], 0),
      studentUserId: readString(record, ["studentUserId", "id"], ""),
      fullName: readString(record, ["fullName", "name"], "—"),
      profileImageUrl: resolveFileUrl(readString(record, ["profileImageUrl"], "") || null),
      progressPercent: readNumber(record, ["progressPercent"], 0),
      coursePointsEarned: readNumber(record, ["coursePointsEarned"], 0),
    };
  });

  return { rankings };
}

export async function fetchTeacherCourseSubscribersList(
  courseId: string,
  params: TeacherCourseSubscribersListParams = {},
): Promise<TeacherSubscribersListData> {
  const pageNumber = params.pageNumber ?? 1;
  const pageSize = params.pageSize ?? 20;

  const response = await httpClient.get<unknown>({
    url: `/api/v1/Teacher/courses/${encodeURIComponent(courseId)}/subscribers`,
    params: {
      keyword: params.keyword ?? "",
      pageNumber,
      pageSize,
    },
  });

  assertSuccess(response);

  const data = asRecord(extractEnvelopeData(response.data));
  const summaryRecord = asRecord(data?.summary);
  const summaryTotalStudents = readNumber(summaryRecord, ["totalStudents"], 0);

  const studentsRaw = data?.students;
  let items: TeacherSubscriberListItem[] = [];
  let totalCount = summaryTotalStudents;
  let currentPage = pageNumber;
  let resolvedPageSize = pageSize;

  if (Array.isArray(studentsRaw)) {
    items = mapSubscriberListItems(studentsRaw);
    totalCount = summaryTotalStudents || items.length;
  } else {
    const studentsRecord = asRecord(studentsRaw);
    const metaRecord = asRecord(studentsRecord?.metaData);

    totalCount = readNumber(metaRecord, ["totalCount"], summaryTotalStudents);
    currentPage = readNumber(metaRecord, ["currentPage"], pageNumber);
    resolvedPageSize = readNumber(metaRecord, ["pageSize"], pageSize);
    items = mapSubscriberListItems(readArray(studentsRecord, ["items"]));
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / Math.max(resolvedPageSize, 1)));

  return {
    summary: {
      totalStudents: summaryTotalStudents,
      activeStudents: readNumber(summaryRecord, ["activeStudents"], 0),
      newStudentsLast30Days: readNumber(summaryRecord, ["newStudentsLast30Days"], 0),
      completionPercent: readNumber(summaryRecord, ["completionPercent"], 0),
      averageScorePercent: readNumber(summaryRecord, ["averageScorePercent"], 0),
    },
    students: {
      items,
      totalCount,
      currentPage,
      pageSize: resolvedPageSize,
      totalPages,
    },
  };
}

export async function fetchTeacherCourseSubscriberProfile(
  courseId: string,
  studentUserId: string,
  locale = "ar",
): Promise<TeacherSubscriberProfileData> {
  const response = await httpClient.get<unknown>({
    url: `/api/v1/Teacher/courses/${encodeURIComponent(courseId)}/subscribers/${encodeURIComponent(studentUserId)}`,
  });

  assertSuccess(response);

  const data = asRecord(extractEnvelopeData(response.data));
  if (!data) throw new Error("Invalid subscriber profile response");

  const identity = asRecord(data.identity);
  const courseKpis = asRecord(data.courseKpis);
  const interaction = asRecord(data.interaction);

  return {
    courseId: readString(data, ["courseId"], courseId),
    courseTitle: readString(data, ["courseTitle"], "—"),
    identity: {
      userId: readString(identity, ["userId", "id"], studentUserId),
      fullName: readString(identity, ["fullName", "name"], "—"),
      profileImageUrl: resolveFileUrl(readString(identity, ["profileImageUrl"], "") || null),
      gradeName: readString(identity, ["gradeName"], ""),
      schoolName: readString(identity, ["schoolName"], ""),
      countryName: readString(identity, ["countryName"], ""),
      isActive: readBoolean(identity, ["isActive"], true),
      enrolledAt: readString(identity, ["enrolledAt"], ""),
    },
    courseKpis: {
      progressPercent: readNumber(courseKpis, ["progressPercent"], 0),
      averageScorePercent: readNumber(courseKpis, ["averageScorePercent"], 0),
      attendancePercent: readNumber(courseKpis, ["attendancePercent"], 0),
      lastActivityAt: readString(courseKpis, ["lastActivityAt"], "") || null,
      certificateEarned: readBoolean(courseKpis, ["certificateEarned"], false),
      courseRank: readNumber(courseKpis, ["courseRank"], 0),
      coursePointsEarned: readNumber(courseKpis, ["coursePointsEarned"], 0),
      completedStationsCount: readNumber(courseKpis, ["completedStationsCount"], 0),
      totalStationsCount: readNumber(courseKpis, ["totalStationsCount"], 0),
      quizAttemptsCount: readNumber(courseKpis, ["quizAttemptsCount"], 0),
    },
    interaction: {
      chatMessagesSent: readNumber(interaction, ["chatMessagesSent"], 0),
      stationsCompleted: readNumber(interaction, ["stationsCompleted"], 0),
      quizzesSubmitted: readNumber(interaction, ["quizzesSubmitted"], 0),
      liveSessionsAttended: readNumber(interaction, ["liveSessionsAttended"], 0),
    },
    learningPaths: readArray(data, ["learningPaths"]).map((item) => {
      const record = asRecord(item);
      return {
        learningPathId: readString(record, ["learningPathId", "id"], ""),
        title: readString(record, ["title"], "—"),
        order: readNumber(record, ["order"], 0),
        totalStations: readNumber(record, ["totalStations"], 0),
        completedStations: readNumber(record, ["completedStations"], 0),
        progressPercent: readNumber(record, ["progressPercent"], 0),
      };
    }),
    quizResults: readArray(data, ["quizResults"]).map((item) => {
      const record = asRecord(item);
      return {
        quizId: readString(record, ["quizId", "id"], ""),
        title: readString(record, ["title"], "—"),
        scorePercent: readNumber(record, ["scorePercent"], 0),
        passed: readBoolean(record, ["passed"], false),
        submittedAt: readString(record, ["submittedAt"], ""),
      };
    }),
    recentActivity: readArray(data, ["recentActivity"]).map((item) => {
      const record = asRecord(item);
      return {
        activityType: readString(record, ["activityType"], ""),
        activityTypeLabelAr: readString(record, ["activityTypeLabelAr", "activityTypeLabel"], ""),
        title: readString(record, ["title"], "—"),
        occurredAtUtc: readString(record, ["occurredAtUtc", "occurredAt"], ""),
      };
    }),
    weeklyActivity: readArray(data, ["weeklyActivity"]).map((item) => {
      const record = asRecord(item);
      const dateUtc = readString(record, ["dateUtc", "date"], "");
      return {
        dateUtc,
        activityCount: readNumber(record, ["activityCount"], 0),
        dayLabel: formatDayLabel(dateUtc, locale),
      };
    }),
  };
}
