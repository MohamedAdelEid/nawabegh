import { uploadAdminFile } from "@/modules/admin/infrastructure/api/fileUploadApi";
import { httpClient } from "@/shared/infrastructure/http/httpClient";
import { parseXPaginationHeader } from "@/shared/infrastructure/http/xPagination";
import type {
  SchoolHonoredStudent,
  SchoolHonoredStudentKpis,
  SchoolHonoredStudentsPage,
  SchoolHonoredStudentsParams,
  SchoolHonorStatus,
  SchoolLeaderboardDashboard,
  SchoolLeaderboardEntry,
  SchoolLeaderboardKpis,
  SchoolLeaderboardMeta,
  SchoolLeaderboardMetric,
  SchoolLeaderboardParams,
  SchoolLeaderboardPeriod,
  SchoolStudentSearchResult,
  UpsertSchoolHonoredStudentPayload,
} from "@/modules/school/domain/types/schoolHonorBoard.types";

const LEADERBOARD_BASE = "/api/v1/school/leaderboard";
const HONORS_BASE = "/api/v1/school/honored-students";
type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as UnknownRecord)
    : null;
}

function unwrap(value: unknown): unknown {
  const record = asRecord(value);
  return record && "data" in record ? record.data : value;
}

function readString(record: UnknownRecord | null, keys: string[], fallback = ""): string {
  if (!record) return fallback;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value;
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
  }
  return fallback;
}

function readNumber(record: UnknownRecord | null, keys: string[], fallback = 0): number {
  if (!record) return fallback;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) {
      return Number(value);
    }
  }
  return fallback;
}

function readNullableNumber(record: UnknownRecord | null, keys: string[]): number | null {
  if (!record) return null;
  for (const key of keys) {
    const value = record[key];
    if (value === null) return null;
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) {
      return Number(value);
    }
  }
  return null;
}

function readBoolean(record: UnknownRecord | null, keys: string[], fallback = false): boolean {
  if (!record) return fallback;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "boolean") return value;
    if (value === "true") return true;
    if (value === "false") return false;
  }
  return fallback;
}

function readArray(record: UnknownRecord | null, keys: string[]): unknown[] {
  if (!record) return [];
  for (const key of keys) {
    if (Array.isArray(record[key])) return record[key] as unknown[];
  }
  return [];
}

function assertSuccess(response: {
  status?: string | number;
  isSuccess?: boolean;
  error?: { message?: string } | null;
  message?: string;
}, fallback: string) {
  if (response.isSuccess === true || response.status === "Success") return;
  throw new Error(response.error?.message ?? response.message ?? fallback);
}

function mapLeaderboardKpis(value: unknown): SchoolLeaderboardKpis {
  const record = asRecord(value);
  return {
    totalParticipants: readNumber(record, ["totalParticipants"]),
    totalPoints: readNumber(record, ["totalPoints"]),
    totalPointsLabel: readString(record, ["totalPointsLabel"]),
    participationRate: readNumber(record, ["participationRate"]),
    participationRateLabel: readString(record, ["participationRateLabel"]),
    topSchoolName: readString(record, ["topSchoolName"]) || null,
    topSchoolRank: readNullableNumber(record, ["topSchoolRank"]),
  };
}

function mapLeaderboardEntry(value: unknown): SchoolLeaderboardEntry | null {
  const record = asRecord(value);
  if (!record) return null;
  const rank = readNumber(record, ["rank"]);
  const fullName = readString(record, ["fullName"]);
  if (!rank || !fullName) return null;
  return {
    rank,
    studentProfileId: readString(record, ["studentProfileId"]),
    userId: readString(record, ["userId"]),
    fullName,
    profileImageUrl: readString(record, ["profileImageUrl"]) || null,
    gradeLabel: readString(record, ["gradeLabel"]),
    score: readNumber(record, ["score"]),
    scoreLabel: readString(record, ["scoreLabel"]),
    rankChange: readNullableNumber(record, ["rankChange"]),
  };
}

const PERIODS: SchoolLeaderboardPeriod[] = ["weekly", "monthly", "term", "all"];
const METRICS: SchoolLeaderboardMetric[] = ["points", "achievements", "grades"];

function mapLeaderboardMeta(value: unknown): SchoolLeaderboardMeta {
  const record = asRecord(value);
  const periods = readArray(record, ["availablePeriods"]).filter(
    (item): item is SchoolLeaderboardPeriod =>
      typeof item === "string" && PERIODS.includes(item as SchoolLeaderboardPeriod),
  );
  const metrics = readArray(record, ["availableMetrics"]).filter(
    (item): item is SchoolLeaderboardMetric =>
      typeof item === "string" && METRICS.includes(item as SchoolLeaderboardMetric),
  );
  return {
    totalCompetitors: readNumber(record, ["totalCompetitors"]),
    nextUpdateAt: readString(record, ["nextUpdateAt"]) || null,
    nextUpdateCountdown: readString(record, ["nextUpdateCountdown"]),
    availablePeriods: periods.length ? periods : PERIODS,
    availableMetrics: metrics.length ? metrics : METRICS,
  };
}

export async function getSchoolLeaderboardDashboard(
  params: SchoolLeaderboardParams,
): Promise<SchoolLeaderboardDashboard> {
  const response = await httpClient.get<unknown>({
    url: `${LEADERBOARD_BASE}/dashboard`,
    params: {
      period: params.period,
      metric: params.metric,
      pageNumber: params.pageNumber,
      pageSize: params.pageSize,
    },
  });
  assertSuccess(response, "Failed to load school leaderboard");

  const root = asRecord(unwrap(response.data));
  const list = asRecord(root?.leaderboard) ?? asRecord(root?.list) ?? root;
  const topThree = readArray(list, ["topThree"])
    .map(mapLeaderboardEntry)
    .filter((item): item is SchoolLeaderboardEntry => item !== null);
  const others = readArray(list, ["others", "items"])
    .map(mapLeaderboardEntry)
    .filter((item): item is SchoolLeaderboardEntry => item !== null);
  const pagination = parseXPaginationHeader(response.headers);
  const othersTotal = readNumber(list, ["othersTotal", "totalCount"], pagination?.totalCount ?? others.length);

  return {
    kpis: mapLeaderboardKpis(root?.kpis),
    topThree,
    others,
    othersTotal,
    currentPage: pagination?.currentPage ?? params.pageNumber,
    pageSize: pagination?.pageSize ?? params.pageSize,
    totalPages: pagination?.totalPages ?? Math.max(1, Math.ceil(othersTotal / params.pageSize)),
    meta: mapLeaderboardMeta(root?.meta),
  };
}

function normalizeHonorStatus(value: string): SchoolHonorStatus {
  const status = value.toLowerCase();
  if (status === "hidden") return "Hidden";
  if (status === "expired") return "Expired";
  return "Active";
}

function mapHonoredStudent(value: unknown): SchoolHonoredStudent | null {
  const record = asRecord(value);
  if (!record) return null;
  const id = readString(record, ["id", "honoredStudentId"]);
  if (!id) return null;
  return {
    id,
    studentUserId: readString(record, ["studentUserId", "userId"]),
    fullName: readString(record, ["fullName"], "—"),
    profileImageUrl: readString(record, ["profileImageUrl"]) || null,
    gradeLabel: readString(record, ["gradeLabel"]),
    reason: readString(record, ["reason"]),
    reasonDetails: readString(record, ["reasonDetails"]) || null,
    referenceCode: readString(record, ["referenceCode"]),
    honoredAt: readString(record, ["honoredAt"]) || null,
    durationDays: readNumber(record, ["durationDays"]),
    durationLabel: readString(record, ["durationLabel"]),
    expiresAt: readString(record, ["expiresAt"]) || null,
    status: normalizeHonorStatus(readString(record, ["status"], "Active")),
    statusLabel: readString(record, ["statusLabel"]),
    isVisible: readBoolean(record, ["isVisible"], true),
    displayOrder: readNumber(record, ["displayOrder"], 1),
    achievementImageUrl: readString(record, ["achievementImageUrl"]) || null,
    canEdit: readBoolean(record, ["canEdit"], true),
    canDelete: readBoolean(record, ["canDelete"], true),
    canToggleVisibility: readBoolean(record, ["canToggleVisibility"], true),
  };
}

function mapHonorKpis(value: unknown): SchoolHonoredStudentKpis {
  const record = asRecord(value);
  return {
    totalHonored: readNumber(record, ["totalHonored"]),
    activeHonors: readNumber(record, ["activeHonors"]),
    honoredThisMonth: readNumber(record, ["honoredThisMonth"]),
    averageRating: readNumber(record, ["averageRating"]),
  };
}

export async function getSchoolHonoredStudentsDashboard(
  params: SchoolHonoredStudentsParams,
): Promise<SchoolHonoredStudentsPage> {
  const response = await httpClient.get<unknown>({
    url: `${HONORS_BASE}/dashboard`,
    params: {
      status: params.status,
      search: params.search?.trim() || undefined,
      pageNumber: params.pageNumber,
      pageSize: params.pageSize,
    },
  });
  assertSuccess(response, "Failed to load honored students");
  const root = asRecord(unwrap(response.data));
  const list = asRecord(root?.list) ?? asRecord(root?.honoredStudents) ?? root;
  const items = readArray(list, ["items", "data", "honoredStudents"])
    .map(mapHonoredStudent)
    .filter((item): item is SchoolHonoredStudent => item !== null);
  const pagination = parseXPaginationHeader(response.headers);
  const totalCount = readNumber(list, ["totalCount"], pagination?.totalCount ?? items.length);
  return {
    kpis: mapHonorKpis(root?.kpis),
    items,
    currentPage: pagination?.currentPage ?? params.pageNumber,
    pageSize: pagination?.pageSize ?? params.pageSize,
    totalCount,
    totalPages: pagination?.totalPages ?? Math.max(1, Math.ceil(totalCount / params.pageSize)),
  };
}

export async function getSchoolHonoredStudent(id: string): Promise<SchoolHonoredStudent> {
  const response = await httpClient.get<unknown>({
    url: `${HONORS_BASE}/${encodeURIComponent(id)}`,
  });
  assertSuccess(response, "Failed to load honored student");
  const item = mapHonoredStudent(unwrap(response.data));
  if (!item) throw new Error("Invalid honored student response");
  return item;
}

export async function searchSchoolStudents(keyword: string): Promise<SchoolStudentSearchResult[]> {
  const response = await httpClient.get<unknown>({
    url: `${HONORS_BASE}/students/search`,
    params: { keyword: keyword.trim(), take: 20 },
  });
  assertSuccess(response, "Failed to search students");
  const data = unwrap(response.data);
  const items = Array.isArray(data) ? data : readArray(asRecord(data), ["items", "students"]);
  return items.flatMap((value) => {
    const record = asRecord(value);
    if (!record) return [];
    const userId = readString(record, ["userId", "studentUserId"]);
    if (!userId) return [];
    return [{
      userId,
      studentProfileId: readString(record, ["studentProfileId"]),
      fullName: readString(record, ["fullName"], "—"),
      profileImageUrl: readString(record, ["profileImageUrl"]) || null,
      gradeLabel: readString(record, ["gradeLabel"]),
      referenceCode: readString(record, ["referenceCode"]),
    }];
  });
}

export async function createSchoolHonoredStudent(
  payload: UpsertSchoolHonoredStudentPayload,
): Promise<void> {
  const response = await httpClient.post<unknown>({ url: HONORS_BASE, data: payload });
  assertSuccess(response, "Failed to create honor");
}

export async function updateSchoolHonoredStudent(
  id: string,
  payload: UpsertSchoolHonoredStudentPayload,
): Promise<void> {
  const response = await httpClient.put<unknown>({
    url: `${HONORS_BASE}/${encodeURIComponent(id)}`,
    data: payload,
  });
  assertSuccess(response, "Failed to update honor");
}

export async function toggleSchoolHonoredStudentVisibility(
  id: string,
  isVisible: boolean,
): Promise<void> {
  const response = await httpClient.patch<unknown>({
    url: `${HONORS_BASE}/${encodeURIComponent(id)}/visibility`,
    data: { isVisible },
  });
  assertSuccess(response, "Failed to update honor visibility");
}

export async function deleteSchoolHonoredStudent(id: string): Promise<void> {
  const response = await httpClient.delete<unknown>({
    url: `${HONORS_BASE}/${encodeURIComponent(id)}`,
  });
  assertSuccess(response, "Failed to delete honor");
}

export async function uploadSchoolHonorImage(file: File): Promise<string> {
  const result = await uploadAdminFile(file, "school-honors");
  if (!result.ok) {
    throw new Error(result.errorMessage || "Failed to upload achievement image");
  }
  return result.filePath;
}
