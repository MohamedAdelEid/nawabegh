import type {
  AdminHomeActivityMetrics,
  AdminHomeDashboard,
  AdminHomeDashboardParams,
  AdminHomeNewUsersPoint,
  AdminHomeRecentActivity,
  AdminHomeReviewTask,
  AdminHomeReviewTasks,
  AdminHomeRevenue,
  AdminHomeSchoolRanking,
  AdminHomeSummaryCard,
  AdminHomeTopStudent,
} from "@/modules/admin/domain/types/adminHomeDashboard.types";
import { httpClient } from "@/shared/infrastructure/http/httpClient";

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord | null {
  return value !== null && typeof value === "object" ? (value as UnknownRecord) : null;
}

function readString(record: UnknownRecord | null, keys: string[], fallback = ""): string {
  if (!record) return fallback;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string") return value;
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

function readNullableString(record: UnknownRecord | null, keys: string[]): string | null {
  if (!record) return null;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string") {
      const trimmed = value.trim();
      return trimmed || null;
    }
    if (value === null) return null;
  }
  return null;
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

function mapSummaryCard(data: unknown): AdminHomeSummaryCard | null {
  const record = asRecord(data);
  const key = readString(record, ["key"], "").trim();
  if (!key) return null;

  return {
    key,
    count: readNumber(record, ["count"]),
    changePercent: readNumber(record, ["changePercent"]),
  };
}

function mapRevenue(data: unknown): AdminHomeRevenue {
  const record = asRecord(data);
  return {
    totalRevenue: readNumber(record, ["totalRevenue"]),
    currency: readString(record, ["currency"], "OMR"),
    activeSubscriptions: readNumber(record, ["activeSubscriptions"]),
    activeSubscriptionsChangePercent: readNumber(record, ["activeSubscriptionsChangePercent"]),
    monthlyGoalPercent: readNumber(record, ["monthlyGoalPercent"]),
  };
}

function mapNewUsersPoint(data: unknown): AdminHomeNewUsersPoint | null {
  const record = asRecord(data);
  if (!record) return null;

  return {
    year: readNumber(record, ["year"]),
    month: readNumber(record, ["month"]),
    monthLabel: readString(record, ["monthLabelAr", "monthLabel", "label"], ""),
    newUsers: readNumber(record, ["newUsers"]),
  };
}

function mapSchoolRanking(data: unknown): AdminHomeSchoolRanking | null {
  const record = asRecord(data);
  const schoolId = readString(record, ["schoolId", "id"], "").trim();
  if (!schoolId) return null;

  return {
    rank: readNumber(record, ["rank"]),
    schoolId,
    name: readString(record, ["name"], ""),
    logoUrl: readNullableString(record, ["logoUrl"]),
    totalPoints: readNumber(record, ["totalPoints"]),
    studentCount: readNumber(record, ["studentCount"]),
  };
}

function mapTopStudent(data: unknown): AdminHomeTopStudent | null {
  const record = asRecord(data);
  const studentUserId = readString(record, ["studentUserId", "userId", "id"], "").trim();
  if (!studentUserId) return null;

  return {
    rank: readNumber(record, ["rank"]),
    studentUserId,
    fullName: readString(record, ["fullName", "name"], ""),
    profileImageUrl: readNullableString(record, ["profileImageUrl", "avatarUrl"]),
    points: readNumber(record, ["points"]),
  };
}

function mapActivityMetrics(data: unknown): AdminHomeActivityMetrics {
  const record = asRecord(data);
  return {
    liveSessionsToday: readNumber(record, ["liveSessionsToday"]),
    completedLessons: readNumber(record, ["completedLessons"]),
    completedExams: readNumber(record, ["completedExams"]),
    issuedCertificates: readNumber(record, ["issuedCertificates"]),
  };
}

function mapReviewTask(data: unknown): AdminHomeReviewTask | null {
  const record = asRecord(data);
  const key = readString(record, ["key"], "").trim();
  if (!key) return null;

  return {
    key,
    label: readString(record, ["labelAr", "label"], ""),
    count: readNumber(record, ["count"]),
  };
}

function mapReviewTasks(data: unknown): AdminHomeReviewTasks {
  const record = asRecord(data);
  const items = readArray(record, ["items"])
    .map(mapReviewTask)
    .filter((item): item is AdminHomeReviewTask => Boolean(item));

  return {
    items,
    totalPending: readNumber(record, ["totalPending"]),
  };
}

function mapRecentActivity(data: unknown): AdminHomeRecentActivity | null {
  const record = asRecord(data);
  if (!record) return null;
  const message = readString(record, ["messageAr", "message"], "").trim();
  if (!message) return null;

  return {
    type: readString(record, ["type"], ""),
    message,
    occurredAt: readString(record, ["occurredAt"], ""),
    entityId: readString(record, ["entityId"], ""),
  };
}

function mapAdminHomeDashboard(data: unknown): AdminHomeDashboard {
  const record = asRecord(extractEnvelopeData(data));

  return {
    summaryCards: readArray(record, ["summaryCards"])
      .map(mapSummaryCard)
      .filter((card): card is AdminHomeSummaryCard => Boolean(card)),
    revenue: mapRevenue(record?.revenue),
    newUsersChart: readArray(record, ["newUsersChart"])
      .map(mapNewUsersPoint)
      .filter((point): point is AdminHomeNewUsersPoint => Boolean(point)),
    schoolRankings: readArray(record, ["schoolRankings"])
      .map(mapSchoolRanking)
      .filter((school): school is AdminHomeSchoolRanking => Boolean(school)),
    topStudents: readArray(record, ["topStudents"])
      .map(mapTopStudent)
      .filter((student): student is AdminHomeTopStudent => Boolean(student)),
    activityMetrics: mapActivityMetrics(record?.activityMetrics),
    reviewTasks: mapReviewTasks(record?.reviewTasks),
    recentActivities: readArray(record, ["recentActivities"])
      .map(mapRecentActivity)
      .filter((activity): activity is AdminHomeRecentActivity => Boolean(activity)),
  };
}

export async function getAdminHomeDashboard(
  params: AdminHomeDashboardParams = {},
): Promise<AdminHomeDashboard> {
  const response = await httpClient.get<unknown>({
    url: "/api/v1/admin/dashboard",
    params: {
      schoolRankingLimit: params.schoolRankingLimit,
      topStudentsLimit: params.topStudentsLimit,
      newUsersChartMonths: params.newUsersChartMonths,
      recentActivityLimit: params.recentActivityLimit,
    },
  });

  return mapAdminHomeDashboard(response.data);
}
