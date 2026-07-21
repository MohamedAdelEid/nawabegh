import { uploadAdminFile } from "@/modules/admin/infrastructure/api/fileUploadApi";
import type {
  SchoolTeamDetail,
  SchoolTeamMeta,
  SchoolTeamPrivacy,
  SchoolTeamPrivacyOption,
  SchoolTeamRankingEntry,
  SchoolTeamRankingKpis,
  SchoolTeamRankingMemberPreview,
  SchoolTeamRankingsPage,
  SchoolTeamRankingsParams,
  SchoolTeamStudentSearchResult,
  UpsertSchoolTeamPayload,
} from "@/modules/school/domain/types/schoolEvents.types";
import { httpClient } from "@/shared/infrastructure/http/httpClient";
import { parseXPaginationHeader } from "@/shared/infrastructure/http/xPagination";

const TEAMS_BASE = "/api/v1/school/teams";
const RANKINGS_BASE = "/api/v1/school/team-rankings";
export const SCHOOL_TEAM_UPLOAD_FOLDER = "teams";

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

function readNullableString(record: UnknownRecord | null, keys: string[]): string | null {
  const value = readString(record, keys, "");
  return value || null;
}

function readArray(record: UnknownRecord | null, keys: string[]): unknown[] {
  if (!record) return [];
  for (const key of keys) {
    if (Array.isArray(record[key])) return record[key] as unknown[];
  }
  return [];
}

function assertSuccess(
  response: {
    status?: string | number;
    isSuccess?: boolean;
    error?: { message?: string } | null;
    message?: string;
  },
  fallback: string,
) {
  if (response.isSuccess === true || response.status === "Success") return;
  throw new Error(response.error?.message ?? response.message ?? fallback);
}

function normalizePrivacy(value: string): SchoolTeamPrivacy {
  const normalized = value.trim().toLowerCase();
  if (normalized === "private") return "private";
  if (normalized === "school") return "school";
  return "public";
}

function mapPrivacyOption(value: unknown): SchoolTeamPrivacyOption | null {
  const record = asRecord(value);
  if (!record) {
    if (typeof value === "string") {
      const privacy = normalizePrivacy(value);
      return { value: privacy, label: privacy, description: "" };
    }
    return null;
  }
  const raw = readString(record, ["value", "id", "key", "code", "privacy"]);
  if (!raw) return null;
  return {
    value: normalizePrivacy(raw),
    label: readString(record, ["label", "name", "title"], raw),
    description: readString(record, ["description", "hint"]),
  };
}

function mapStudent(value: unknown): SchoolTeamStudentSearchResult | null {
  const record = asRecord(value);
  if (!record) return null;
  const userId = readString(record, ["userId", "id", "studentUserId"]);
  const fullName = readString(record, ["fullName", "name", "displayName"]);
  if (!userId || !fullName) return null;
  return {
    userId,
    fullName,
    email: readString(record, ["email", "emailAddress"]),
    avatarUrl: readNullableString(record, ["avatarUrl", "profileImageUrl", "imageUrl"]),
    gradeLabel: readString(record, ["gradeLabel", "grade", "className"]),
  };
}

function mapMemberPreview(value: unknown): SchoolTeamRankingMemberPreview | null {
  if (typeof value === "string" && value.trim()) {
    return { userId: value.trim(), fullName: "", avatarUrl: null };
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return { userId: String(value), fullName: "", avatarUrl: null };
  }
  const record = asRecord(value);
  if (!record) return null;
  const userId = readString(record, ["userId", "id", "studentUserId", "memberUserId"]);
  if (!userId) return null;
  return {
    userId,
    fullName: readString(record, ["fullName", "name", "displayName"]),
    avatarUrl: readNullableString(record, [
      "avatarUrl",
      "profileImageUrl",
      "imageUrl",
      "photoUrl",
    ]),
  };
}

function memberNeedsProfile(member: SchoolTeamRankingMemberPreview) {
  return !member.fullName.trim() || member.fullName === member.userId;
}

function mapTeamDetail(value: unknown): SchoolTeamDetail {
  const record = asRecord(value);
  const members = readArray(record, ["memberUserIds", "members", "memberIds"])
    .map((item) => {
      if (typeof item === "string") return item;
      if (typeof item === "number") return String(item);
      const nested = asRecord(item);
      return nested ? readString(nested, ["userId", "id", "studentUserId"]) : "";
    })
    .filter(Boolean);

  return {
    id: readNumber(record, ["id", "teamId"]),
    name: readString(record, ["name", "teamName"]),
    description: readString(record, ["description"]),
    logoUrl: readNullableString(record, ["logoUrl", "imageUrl"]),
    privacy: normalizePrivacy(readString(record, ["privacy"], "public")),
    minLevel: readNullableNumber(record, ["minLevel"]),
    minChallengesCompleted: readNullableNumber(record, ["minChallengesCompleted"]),
    schoolEventId: readNullableNumber(record, ["schoolEventId", "eventId"]),
    memberUserIds: members,
  };
}

function mapTeamMemberPreviews(value: unknown): SchoolTeamRankingMemberPreview[] {
  const record = asRecord(value);
  return readArray(record, ["members", "memberPreview", "memberUserIds", "memberIds"])
    .map(mapMemberPreview)
    .filter((item): item is SchoolTeamRankingMemberPreview => item !== null);
}

function mapRankingKpis(value: unknown): SchoolTeamRankingKpis {
  const record = asRecord(value);
  const globalRank = readNullableNumber(record, ["globalRank", "rank"]);
  return {
    totalTeams: readNumber(record, ["totalTeams", "teamsCount"]),
    activeChallenges: readNumber(record, ["activeChallenges", "challengesCount"]),
    seasonPoints: readNumber(record, ["seasonPoints", "totalPoints", "points"]),
    seasonPointsLabel: readString(record, ["seasonPointsLabel", "pointsLabel"]),
    globalRank,
    globalRankLabel:
      readString(record, ["globalRankLabel"]) ||
      (globalRank != null ? `#${globalRank}` : "—"),
  };
}

function mapRankingEntry(value: unknown): SchoolTeamRankingEntry | null {
  const record = asRecord(value);
  if (!record) return null;
  const nestedTeam = asRecord(record.team);
  const rank = readNumber(record, ["rank", "position"]);
  const teamName =
    readString(record, ["teamName", "name"]) ||
    readString(nestedTeam, ["name", "teamName"]);
  if (!rank || !teamName) return null;

  const memberPreview = [
    ...readArray(record, ["memberPreview", "members", "avatars", "memberUserIds", "memberIds"]),
    ...readArray(nestedTeam, ["memberPreview", "members", "memberUserIds", "memberIds"]),
  ]
    .map(mapMemberPreview)
    .filter((item): item is SchoolTeamRankingMemberPreview => item !== null);

  const uniqueMembers = Array.from(
    new Map(memberPreview.map((item) => [item.userId, item])).values(),
  ).slice(0, 5);

  return {
    rank,
    teamId:
      readNumber(record, ["teamId", "id"]) ||
      readNumber(nestedTeam, ["id", "teamId"]),
    teamName,
    logoUrl:
      readNullableString(record, ["logoUrl", "imageUrl"]) ||
      readNullableString(nestedTeam, ["logoUrl", "imageUrl"]),
    schoolName:
      readString(record, ["schoolName"]) ||
      readString(nestedTeam, ["schoolName"]),
    points: readNumber(record, ["points", "score"]),
    winsCount: readNumber(record, ["winsCount", "winningChallenges", "wins"]),
    memberCount: readNumber(record, [
      "memberCount",
      "membersCount",
      "totalMembers",
    ]),
    rankChange: readNullableNumber(record, ["rankChange", "change"]),
    rankChangeLabel: readString(record, ["rankChangeLabel"]),
    memberPreview: uniqueMembers,
  };
}

const memberProfileCache = new Map<string, SchoolTeamRankingMemberPreview>();

async function fetchSchoolMemberProfile(
  userId: string,
): Promise<SchoolTeamRankingMemberPreview> {
  const cached = memberProfileCache.get(userId);
  if (cached && !memberNeedsProfile(cached)) return cached;

  try {
    const searched = await searchSchoolTeamStudents(userId);
    const match =
      searched.find((item) => item.userId === userId) ??
      searched.find((item) =>
        item.fullName.toLowerCase().includes(userId.toLowerCase()),
      );
    if (match) {
      const profile = {
        userId: match.userId,
        fullName: match.fullName,
        avatarUrl: match.avatarUrl,
      };
      memberProfileCache.set(profile.userId, profile);
      return profile;
    }
  } catch {
    // continue to fallback
  }

  try {
    const response = await httpClient.get<unknown>({
      url: `/api/v1/UserManagement/student/${encodeURIComponent(userId)}`,
    });
    if (response.isSuccess === true || response.status === "Success") {
      const record = asRecord(unwrap(response.data));
      const fullName = readString(record, ["fullName", "name", "displayName"]);
      if (fullName) {
        const profile = {
          userId,
          fullName,
          avatarUrl: readNullableString(record, [
            "profileImageUrl",
            "avatarUrl",
            "imageUrl",
          ]),
        };
        memberProfileCache.set(userId, profile);
        return profile;
      }
    }
  } catch {
    // keep fallback
  }

  const fallback = { userId, fullName: userId, avatarUrl: null };
  memberProfileCache.set(userId, fallback);
  return fallback;
}

async function resolveMemberProfiles(
  members: SchoolTeamRankingMemberPreview[],
): Promise<SchoolTeamRankingMemberPreview[]> {
  const uniqueIds = Array.from(
    new Set(members.map((item) => item.userId).filter(Boolean)),
  ).slice(0, 5);

  const resolved = await Promise.all(
    uniqueIds.map(async (userId) => {
      const existing = members.find((item) => item.userId === userId);
      if (existing && !memberNeedsProfile(existing) && existing.avatarUrl) {
        return existing;
      }
      if (existing && !memberNeedsProfile(existing)) {
        // has name but maybe missing image — still try fetch for image
        const profile = await fetchSchoolMemberProfile(userId);
        return {
          userId,
          fullName: existing.fullName || profile.fullName,
          avatarUrl: existing.avatarUrl || profile.avatarUrl,
        };
      }
      return fetchSchoolMemberProfile(userId);
    }),
  );

  return resolved;
}

async function enrichRankingMembers(
  item: SchoolTeamRankingEntry,
): Promise<SchoolTeamRankingEntry> {
  const preview = item.memberPreview;
  const needsFetch =
    preview.length === 0
      ? item.memberCount > 0 && item.teamId > 0
      : preview.some(memberNeedsProfile);

  if (!needsFetch && preview.every((member) => member.fullName.trim())) {
    return item;
  }

  if (item.teamId > 0) {
    try {
      const response = await httpClient.get<unknown>({
        url: `${TEAMS_BASE}/${item.teamId}`,
      });
      if (response.isSuccess === true || response.status === "Success") {
        const fromTeam = mapTeamMemberPreviews(unwrap(response.data));
        if (fromTeam.length > 0) {
          const resolved = await resolveMemberProfiles(fromTeam);
          return {
            ...item,
            memberPreview: resolved.slice(0, 5),
            memberCount: item.memberCount || resolved.length,
          };
        }
      }
    } catch {
      // fall through to id-based resolve
    }
  }

  if (preview.length === 0) return item;
  const resolved = await resolveMemberProfiles(preview);
  return { ...item, memberPreview: resolved };
}

export async function getSchoolTeamMeta(): Promise<SchoolTeamMeta> {
  const response = await httpClient.get<unknown>({ url: `${TEAMS_BASE}/meta` });
  assertSuccess(response, "Failed to load team meta");
  const payload = unwrap(response.data);
  const record = asRecord(payload);
  const options = readArray(record, ["privacyOptions", "privacy", "options"])
    .map(mapPrivacyOption)
    .filter((item): item is SchoolTeamPrivacyOption => item !== null);

  return {
    privacyOptions:
      options.length > 0
        ? options
        : [
            { value: "public", label: "Public", description: "" },
            { value: "school", label: "School", description: "" },
            { value: "private", label: "Private", description: "" },
          ],
  };
}

export async function searchSchoolTeamStudents(
  keyword: string,
): Promise<SchoolTeamStudentSearchResult[]> {
  const response = await httpClient.get<unknown>({
    url: `${TEAMS_BASE}/students/search`,
    params: { keyword },
  });
  assertSuccess(response, "Failed to search students");
  const payload = unwrap(response.data);
  const record = asRecord(payload);
  const rows = Array.isArray(payload)
    ? payload
    : readArray(record, ["items", "students", "results"]);
  return rows
    .map(mapStudent)
    .filter((item): item is SchoolTeamStudentSearchResult => item !== null);
}

export async function getSchoolTeamDetail(id: number | string): Promise<SchoolTeamDetail> {
  const response = await httpClient.get<unknown>({ url: `${TEAMS_BASE}/${id}` });
  assertSuccess(response, "Failed to load team");
  return mapTeamDetail(unwrap(response.data));
}

export async function createSchoolTeam(
  payload: UpsertSchoolTeamPayload,
): Promise<SchoolTeamDetail> {
  const response = await httpClient.post<unknown>({ url: `${TEAMS_BASE}/`, data: payload });
  assertSuccess(response, "Failed to create team");
  return mapTeamDetail(unwrap(response.data));
}

export async function updateSchoolTeam(
  id: number | string,
  payload: UpsertSchoolTeamPayload,
): Promise<SchoolTeamDetail> {
  const response = await httpClient.put<unknown>({ url: `${TEAMS_BASE}/${id}`, data: payload });
  assertSuccess(response, "Failed to update team");
  return mapTeamDetail(unwrap(response.data));
}

export async function deleteSchoolTeam(id: number | string): Promise<void> {
  const response = await httpClient.delete<unknown>({ url: `${TEAMS_BASE}/${id}` });
  assertSuccess(response, "Failed to delete team");
}

export async function getSchoolTeamRankingKpis(
  schoolScope: SchoolTeamRankingsParams["schoolScope"],
): Promise<SchoolTeamRankingKpis> {
  const response = await httpClient.get<unknown>({
    url: `${RANKINGS_BASE}/kpis`,
    params: { schoolScope },
  });
  assertSuccess(response, "Failed to load ranking KPIs");
  return mapRankingKpis(unwrap(response.data));
}

export async function getSchoolTeamRankings(
  params: SchoolTeamRankingsParams,
): Promise<SchoolTeamRankingsPage> {
  const [listResponse, kpis] = await Promise.all([
    httpClient.get<unknown>({
      url: `${RANKINGS_BASE}/`,
      params: {
        schoolScope: params.schoolScope,
        pageNumber: params.pageNumber,
        pageSize: params.pageSize,
        ...(params.seasonId ? { seasonId: params.seasonId } : {}),
      },
    }),
    getSchoolTeamRankingKpis(params.schoolScope).catch(() =>
      mapRankingKpis(null),
    ),
  ]);

  assertSuccess(listResponse, "Failed to load rankings");
  const payload = unwrap(listResponse.data);
  const record = asRecord(payload);
  const rows = Array.isArray(payload)
    ? payload
    : readArray(record, ["items", "rankings", "results", "data"]);
  const items = rows
    .map(mapRankingEntry)
    .filter((item): item is SchoolTeamRankingEntry => item !== null);
  const enrichedItems = await Promise.all(items.map((item) => enrichRankingMembers(item)));
  const pagination = parseXPaginationHeader(listResponse.headers);
  const totalCount =
    pagination?.totalCount ?? readNumber(record, ["totalCount", "total"], enrichedItems.length);
  const pageSize = pagination?.pageSize ?? params.pageSize;
  const currentPage = pagination?.currentPage ?? params.pageNumber;
  const totalPages =
    pagination?.totalPages ?? Math.max(1, Math.ceil(totalCount / Math.max(pageSize, 1)));

  const nestedKpis = asRecord(record?.kpis);
  return {
    kpis: nestedKpis ? mapRankingKpis(nestedKpis) : kpis,
    items: enrichedItems,
    currentPage,
    pageSize,
    totalCount,
    totalPages,
  };
}

export async function uploadSchoolTeamLogo(file: File) {
  return uploadAdminFile(file, SCHOOL_TEAM_UPLOAD_FOLDER);
}
