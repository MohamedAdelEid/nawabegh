import type {
  SchoolEventCard,
  SchoolEventFeedItem,
  SchoolEventHonorEntry,
  SchoolEventKpis,
  SchoolEventLiveDashboard,
  SchoolEventLiveHero,
  SchoolEventLiveScore,
  SchoolEventMatch,
  SchoolEventMatchStatus,
  SchoolEventMeta,
  SchoolEventMetaOption,
  SchoolEventNextMatch,
  SchoolEventParticipantPreview,
  SchoolEventPoll,
  SchoolEventStandingEntry,
  SchoolEventStatus,
  SchoolEventActionType,
  SchoolEventsListPage,
  SchoolEventsListParams,
} from "@/modules/student/domain/types/schoolEvent.types";
import { httpClient } from "@/shared/infrastructure/http/httpClient";
import { parseXPaginationHeader } from "@/shared/infrastructure/http/xPagination";

const BASE = "/api/v1/student/school/events";

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

function normalizeStatus(value: string): SchoolEventStatus {
  const normalized = value.trim().toLowerCase();
  if (normalized === "published" || normalized === "publish") return "Published";
  if (normalized === "ongoing" || normalized === "live" || normalized === "running") {
    return "Ongoing";
  }
  if (normalized === "finished" || normalized === "ended" || normalized === "completed") {
    return "Finished";
  }
  if (value === "Published" || value === "Ongoing" || value === "Finished") {
    return value;
  }
  return "Published";
}

function normalizeActionType(
  value: string,
  status: SchoolEventStatus,
): SchoolEventActionType {
  const normalized = value.trim().toLowerCase();
  if (normalized === "register" || normalized === "registration") return "Register";
  if (normalized === "view" || normalized === "viewlive" || normalized === "viewevent") {
    return "View";
  }
  return status === "Published" ? "Register" : "View";
}

function mapMetaOption(value: unknown): SchoolEventMetaOption | null {
  const record = asRecord(value);
  if (!record) return null;
  const optionValue = readString(record, ["value", "id", "key", "code"]);
  const label = readString(record, ["label", "name", "title", "nameAr", "nameEn"]);
  if (!optionValue && !label) return null;
  return { value: optionValue || label, label: label || optionValue };
}

function mapParticipant(value: unknown): SchoolEventParticipantPreview | null {
  const record = asRecord(value);
  if (!record) return null;
  const id = readString(record, ["id", "userId", "studentUserId"]);
  const fullName = readString(record, ["fullName", "name", "displayName"]);
  if (!id && !fullName) return null;
  return {
    id: id || fullName,
    fullName: fullName || id,
    avatarUrl: readNullableString(record, ["avatarUrl", "profileImageUrl", "imageUrl"]),
  };
}

function mapEventCard(value: unknown): SchoolEventCard | null {
  const record = asRecord(value);
  if (!record) return null;
  const id = readNumber(record, ["id", "eventId"]);
  const title = readString(record, ["title", "name"]);
  if (!id || !title) return null;
  const statusRaw = readString(record, ["status", "statusCode"], "Published");
  const status = normalizeStatus(statusRaw);
  const type = readString(record, ["type", "eventType", "category"], "academic");
  const actionRaw = readString(record, ["actionType", "action"], "");
  const actionType = normalizeActionType(actionRaw, status);
  const defaultActionLabel =
    actionType === "Register" ? "Register" : status === "Ongoing" ? "View" : "View";

  return {
    id,
    title,
    type,
    typeLabel: readString(record, ["typeLabel", "eventTypeLabel", "categoryLabel"], type),
    status,
    statusLabel: readString(record, ["statusLabel"], status),
    coverImageUrl: readNullableString(record, ["coverImageUrl", "imageUrl", "thumbnailUrl"]),
    startsAt: readNullableString(record, ["startsAt", "startAt", "startDate"]),
    endsAt: readNullableString(record, ["endsAt", "endAt", "endDate"]),
    dateLabel: readString(record, ["dateLabel", "periodLabel", "dateRangeLabel"]),
    participantCount: readNumber(record, ["participantCount", "participantsCount", "membersCount"]),
    participantPreview: readArray(record, ["participantPreview", "participants", "avatars"])
      .map(mapParticipant)
      .filter((item): item is SchoolEventParticipantPreview => item !== null)
      .slice(0, 5),
    actionType,
    actionLabel: readString(record, ["actionLabel"], defaultActionLabel),
    canManage: readBoolean(record, ["canManage"], false),
  };
}

function mapKpis(value: unknown): SchoolEventKpis {
  const record = asRecord(value);
  return {
    ongoingCount: readNumber(record, ["ongoingCount", "liveCount", "runningCount"]),
    totalCount: readNumber(record, ["totalCount", "totalEvents", "total"]),
    publishedCount: readNumber(record, ["publishedCount"]),
    finishedCount: readNumber(record, ["finishedCount", "endedCount"]),
  };
}

function mapMeta(value: unknown): SchoolEventMeta {
  const record = asRecord(value);
  const statuses = readArray(record, ["statuses", "statusTabs", "statusFilters"])
    .map(mapMetaOption)
    .filter((item): item is SchoolEventMetaOption => item !== null)
    .filter((item) => {
      const value = item.value.trim().toLowerCase();
      return value !== "draft" && value !== "archived";
    });
  const types = readArray(record, ["types", "eventTypes", "categories"])
    .map(mapMetaOption)
    .filter((item): item is SchoolEventMetaOption => item !== null);
  return { statuses, types };
}

function mapFeedItem(value: unknown): SchoolEventFeedItem | null {
  const record = asRecord(value);
  if (!record) return null;
  const id = readString(record, ["id", "activityId"]) || String(readNumber(record, ["id"]));
  const message = readString(record, ["message", "text", "content", "body"]);
  if (!message) return null;
  return {
    id: id || message,
    message,
    createdAt: readNullableString(record, ["createdAt", "timestamp"]),
    relativeTimeLabel: readString(record, ["relativeTimeLabel", "timeAgo", "relativeTime"]),
    icon: readNullableString(record, ["icon", "iconType", "type"]),
    teamId: readNullableNumber(record, ["teamId"]),
  };
}

function readTeamName(
  record: UnknownRecord | null,
  flatKeys: string[],
  nestedKeys: string[],
): string {
  const flat = readString(record, flatKeys);
  if (flat) return flat;
  if (!record) return "";
  for (const key of nestedKeys) {
    const nested = asRecord(record[key]);
    const name = readString(nested, ["name", "teamName", "title", "fullName"]);
    if (name) return name;
  }
  return "";
}

function readTeamLogo(
  record: UnknownRecord | null,
  flatKeys: string[],
  nestedKeys: string[],
): string | null {
  const flat = readNullableString(record, flatKeys);
  if (flat) return flat;
  if (!record) return null;
  for (const key of nestedKeys) {
    const nested = asRecord(record[key]);
    const logo = readNullableString(nested, ["logoUrl", "imageUrl", "avatarUrl"]);
    if (logo) return logo;
  }
  return null;
}

function readTeamId(
  record: UnknownRecord | null,
  flatKeys: string[],
  nestedKeys: string[],
): number | null {
  const flat = readNullableNumber(record, flatKeys);
  if (flat != null) return flat;
  if (!record) return null;
  for (const key of nestedKeys) {
    const nested = asRecord(record[key]);
    const id = readNullableNumber(nested, ["id", "teamId"]);
    if (id != null) return id;
  }
  return null;
}

function mapScore(value: unknown): SchoolEventLiveScore | null {
  const record = asRecord(value);
  if (!record) return null;
  const homeTeamName = readTeamName(
    record,
    ["homeTeamName", "teamAName", "leftTeamName"],
    ["homeTeam", "teamA", "leftTeam"],
  );
  const awayTeamName = readTeamName(
    record,
    ["awayTeamName", "teamBName", "rightTeamName"],
    ["awayTeam", "teamB", "rightTeam"],
  );
  if (!homeTeamName && !awayTeamName) return null;
  const homePoints = readNumber(record, ["homePoints", "teamAPoints", "homeScore", "leftPoints"]);
  const awayPoints = readNumber(record, ["awayPoints", "teamBPoints", "awayScore", "rightPoints"]);
  return {
    matchId: readNullableNumber(record, ["matchId", "id", "currentMatchId"]),
    homeTeamId: readTeamId(
      record,
      ["homeTeamId", "teamAId"],
      ["homeTeam", "teamA", "leftTeam"],
    ),
    homeTeamName: homeTeamName || "—",
    homeTeamLogoUrl: readTeamLogo(
      record,
      ["homeTeamLogoUrl", "teamALogoUrl"],
      ["homeTeam", "teamA", "leftTeam"],
    ),
    homePoints,
    awayTeamId: readTeamId(
      record,
      ["awayTeamId", "teamBId"],
      ["awayTeam", "teamB", "rightTeam"],
    ),
    awayTeamName: awayTeamName || "—",
    awayTeamLogoUrl: readTeamLogo(
      record,
      ["awayTeamLogoUrl", "teamBLogoUrl"],
      ["awayTeam", "teamB", "rightTeam"],
    ),
    awayPoints,
    setsWonHome: readNumber(record, ["setsWonHome", "homeSets"]),
    setsWonAway: readNumber(record, ["setsWonAway", "awaySets"]),
    scoreLabel:
      readString(record, ["scoreLabel"]) ||
      `${homePoints} : ${awayPoints}`,
    roundLabel: readString(record, ["roundLabel", "round"]),
    timerSeconds: readNumber(record, ["timerSeconds", "remainingSeconds"]),
    timerLabel: readString(record, ["timerLabel", "countdown"]),
    likesCount: readNumber(record, ["likesCount", "likes"]),
    fireCount: readNumber(record, ["fireCount", "fires"]),
    medalsCount: readNumber(record, ["medalsCount", "medals", "goldCount", "stars"]),
  };
}

function mapPoll(value: unknown): SchoolEventPoll | null {
  const record = asRecord(value);
  if (!record) return null;
  const question = readString(record, ["question", "title", "prompt"]);
  if (!question) return null;
  const options = readArray(record, ["options", "choices"]).map((item, index) => {
    const option = asRecord(item);
    return {
      id: readString(option, ["id", "optionId"]) || String(index),
      label: readString(option, ["label", "text", "name"]),
      votesCount: readNumber(option, ["votesCount", "votes", "count"]),
      percent: readNumber(option, ["percent", "percentage", "ratio", "votePercentage"]),
    };
  });
  return {
    id: readString(record, ["id", "pollId"]) || question,
    question,
    totalVotes: readNumber(record, ["totalVotes", "votesCount"]),
    options,
  };
}

function mapStanding(value: unknown): SchoolEventStandingEntry | null {
  const record = asRecord(value);
  if (!record) return null;
  const teamName = readString(record, ["teamName", "name"]);
  const rank = readNumber(record, ["rank", "position"]);
  if (!teamName || !rank) return null;
  return {
    rank,
    teamId: readNumber(record, ["teamId", "id"]),
    teamName,
    schoolName: readString(record, ["schoolName"]),
    logoUrl: readNullableString(record, ["logoUrl", "imageUrl"]),
    points: readNumber(record, ["points", "score"]),
    rankChange: readNullableNumber(record, ["rankChange", "change"]),
  };
}

function mapNextMatch(value: unknown): SchoolEventNextMatch | null {
  const record = asRecord(value);
  if (!record) return null;
  const homeTeamName = readTeamName(
    record,
    ["homeTeamName", "teamAName", "leftTeamName"],
    ["homeTeam", "teamA", "leftTeam"],
  );
  const awayTeamName = readTeamName(
    record,
    ["awayTeamName", "teamBName", "rightTeamName"],
    ["awayTeam", "teamB", "rightTeam"],
  );
  if (!homeTeamName && !awayTeamName) return null;
  return {
    matchId: readNullableNumber(record, ["matchId", "id"]),
    startsAt: readNullableString(record, ["startsAt", "startAt", "scheduledAt"]),
    timeLabel: readString(record, ["timeLabel", "label", "scheduledLabel"]),
    homeTeamId: readTeamId(record, ["homeTeamId", "teamAId"], ["homeTeam", "teamA"]),
    awayTeamId: readTeamId(record, ["awayTeamId", "teamBId"], ["awayTeam", "teamB"]),
    homeTeamName: homeTeamName || "—",
    awayTeamName: awayTeamName || "—",
  };
}

function mapHero(value: unknown, fallbackTitle = ""): SchoolEventLiveHero {
  const record = asRecord(value);
  return {
    title: readString(record, ["title", "name", "eventTitle"], fallbackTitle),
    description: readString(record, ["description", "subtitle", "summary"]),
    seriesLabel: readNullableString(record, ["seriesLabel", "series", "championshipLabel"]),
    statusLabel: readString(record, ["liveStatusLabel", "statusLabel", "liveLabel"], "Live"),
    isLive: readBoolean(record, ["isLive", "live"], false),
    bannerImageUrl: readNullableString(record, ["bannerImageUrl", "coverImageUrl", "imageUrl"]),
  };
}

function mapLiveDashboard(value: unknown): SchoolEventLiveDashboard {
  const record = asRecord(value);
  const scoreSource =
    asRecord(record?.currentMatch) ??
    asRecord(record?.score) ??
    asRecord(record?.currentScore) ??
    asRecord(record?.matchScore) ??
    null;
  const pollSource = asRecord(record?.activePoll) ?? asRecord(record?.poll) ?? null;
  const nextMatchSource =
    asRecord(record?.nextMatch) ?? asRecord(record?.upcomingMatch) ?? null;
  const heroSource = asRecord(record?.hero) ?? asRecord(record?.event) ?? record;

  return {
    hero: mapHero(heroSource, readString(record, ["title", "name"])),
    score: mapScore(scoreSource),
    feed: readArray(record, [
      "activityFeed",
      "feed",
      "activity",
      "updates",
      "recentUpdates",
    ])
      .map(mapFeedItem)
      .filter((item): item is SchoolEventFeedItem => item !== null),
    poll: mapPoll(pollSource),
    standings: readArray(record, ["teamStandings", "standings", "rankings"])
      .map(mapStanding)
      .filter((item): item is SchoolEventStandingEntry => item !== null)
      .slice(0, 5),
    nextMatch: mapNextMatch(nextMatchSource),
  };
}

function mapMatch(value: unknown): SchoolEventMatch | null {
  const record = asRecord(value);
  if (!record) return null;
  const id = readNumber(record, ["id", "matchId"]);
  const homeTeamName = readTeamName(
    record,
    ["homeTeamName", "teamAName"],
    ["homeTeam", "teamA"],
  );
  const awayTeamName = readTeamName(
    record,
    ["awayTeamName", "teamBName"],
    ["awayTeam", "teamB"],
  );
  if (!id || (!homeTeamName && !awayTeamName)) return null;
  const statusRaw = readString(record, ["status"], "scheduled");
  const status = statusRaw.toLowerCase() as SchoolEventMatchStatus;
  const round = readNumber(record, ["round"]);
  return {
    id,
    round,
    homeTeamId: readTeamId(record, ["homeTeamId", "teamAId"], ["homeTeam", "teamA"]),
    awayTeamId: readTeamId(record, ["awayTeamId", "teamBId"], ["awayTeam", "teamB"]),
    homeTeamName: homeTeamName || "—",
    awayTeamName: awayTeamName || "—",
    homeScore: readNullableNumber(record, ["homeScore", "teamAScore"]),
    awayScore: readNullableNumber(record, ["awayScore", "teamBScore"]),
    startsAt: readNullableString(record, ["startsAt", "startAt", "scheduledAt"]),
    status,
    statusLabel: readString(record, ["statusLabel"], statusRaw),
    roundLabel: readString(record, ["roundLabel"]) || (round ? String(round) : ""),
  };
}

function mapHonorEntry(value: unknown): SchoolEventHonorEntry | null {
  const record = asRecord(value);
  if (!record) return null;
  const fullName = readString(record, ["fullName", "name", "studentName", "title"]);
  const rank = readNumber(record, ["rank", "position"]);
  if (!fullName || !rank) return null;
  const isCaptain = readBoolean(record, ["isCaptain", "captain"], false);
  const roleLabel = readString(record, ["roleLabel", "role", "subtitle"]);
  return {
    rank,
    fullName,
    avatarUrl: readNullableString(record, ["avatarUrl", "profileImageUrl", "imageUrl"]),
    points: readNumber(record, ["points", "score"]),
    pointsLabel: readString(record, ["pointsLabel", "scoreLabel"]),
    gradeLabel: readString(record, ["gradeLabel", "grade", "className"]),
    teamName: readString(record, ["teamName", "team"]),
    isCaptain,
    roleLabel,
  };
}

export async function getStudentSchoolEventKpis(): Promise<SchoolEventKpis> {
  const response = await httpClient.get<unknown>({ url: `${BASE}/kpis` });
  assertSuccess(response, "Failed to load event KPIs");
  return mapKpis(unwrap(response.data));
}

export async function getStudentSchoolEventMeta(): Promise<SchoolEventMeta> {
  const response = await httpClient.get<unknown>({ url: `${BASE}/meta` });
  assertSuccess(response, "Failed to load event meta");
  return mapMeta(unwrap(response.data));
}

export async function getStudentSchoolEventsList(
  params: SchoolEventsListParams,
): Promise<SchoolEventsListPage> {
  const status =
    params.status === "all" ||
    params.status === "ongoing" ||
    params.status === "published" ||
    params.status === "finished"
      ? params.status
      : "all";

  const response = await httpClient.get<unknown>({
    url: `${BASE}/`,
    params: {
      status,
      pageNumber: params.pageNumber,
      pageSize: params.pageSize,
    },
  });
  assertSuccess(response, "Failed to load events");
  const payload = unwrap(response.data);
  const record = asRecord(payload);
  const rows = Array.isArray(payload)
    ? payload
    : readArray(record, ["items", "events", "results", "data"]);
  const items = rows
    .map(mapEventCard)
    .filter((item): item is SchoolEventCard => item !== null);
  const pagination = parseXPaginationHeader(response.headers);
  const totalCount =
    pagination?.totalCount ?? readNumber(record, ["totalCount", "total"], items.length);
  const pageSize = pagination?.pageSize ?? params.pageSize;
  const currentPage = pagination?.currentPage ?? params.pageNumber;
  const totalPages =
    pagination?.totalPages ?? Math.max(1, Math.ceil(totalCount / Math.max(pageSize, 1)));

  return {
    items,
    currentPage,
    pageSize,
    totalCount,
    totalPages,
    hasNext: pagination?.hasNext ?? currentPage < totalPages,
  };
}

export async function getStudentSchoolEventLive(
  id: number | string,
): Promise<SchoolEventLiveDashboard> {
  const response = await httpClient.get<unknown>({ url: `${BASE}/${id}/live` });
  assertSuccess(response, "Failed to load live event");
  return mapLiveDashboard(unwrap(response.data));
}

export async function getStudentSchoolEventActivity(
  id: number | string,
  pageNumber = 1,
  pageSize = 20,
): Promise<SchoolEventFeedItem[]> {
  const response = await httpClient.get<unknown>({
    url: `${BASE}/${id}/activity`,
    params: { pageNumber, pageSize },
  });
  assertSuccess(response, "Failed to load activity");
  const payload = unwrap(response.data);
  const record = asRecord(payload);
  const rows = Array.isArray(payload)
    ? payload
    : readArray(record, ["items", "activity", "feed", "results"]);
  return rows
    .map(mapFeedItem)
    .filter((item): item is SchoolEventFeedItem => item !== null);
}

export async function getStudentSchoolEventMatches(
  id: number | string,
): Promise<SchoolEventMatch[]> {
  const response = await httpClient.get<unknown>({ url: `${BASE}/${id}/matches` });
  assertSuccess(response, "Failed to load matches");
  const payload = unwrap(response.data);
  const record = asRecord(payload);
  const rows = Array.isArray(payload)
    ? payload
    : readArray(record, ["items", "matches", "results"]);
  return rows
    .map(mapMatch)
    .filter((item): item is SchoolEventMatch => item !== null);
}

export async function getStudentSchoolEventStandings(
  id: number | string,
): Promise<SchoolEventStandingEntry[]> {
  const response = await httpClient.get<unknown>({ url: `${BASE}/${id}/standings` });
  assertSuccess(response, "Failed to load standings");
  const payload = unwrap(response.data);
  const record = asRecord(payload);
  const rows = Array.isArray(payload)
    ? payload
    : readArray(record, ["items", "standings", "results"]);
  return rows
    .map(mapStanding)
    .filter((item): item is SchoolEventStandingEntry => item !== null);
}

export async function getStudentSchoolEventActivePoll(
  id: number | string,
): Promise<SchoolEventPoll | null> {
  const response = await httpClient.get<unknown>({ url: `${BASE}/${id}/polls/active` });
  assertSuccess(response, "Failed to load poll");
  return mapPoll(unwrap(response.data));
}

export async function voteStudentSchoolEventPoll(
  eventId: number | string,
  pollId: number | string,
  optionId: number | string,
): Promise<SchoolEventPoll | null> {
  const response = await httpClient.post<unknown>({
    url: `${BASE}/${eventId}/polls/${pollId}/vote`,
    data: { optionId },
  });
  assertSuccess(response, "Failed to vote");
  return mapPoll(unwrap(response.data));
}

export async function getStudentSchoolEventHonorBoard(
  id: number | string,
): Promise<SchoolEventHonorEntry[]> {
  const response = await httpClient.get<unknown>({ url: `${BASE}/${id}/honor-board` });
  assertSuccess(response, "Failed to load honor board");
  const payload = unwrap(response.data);
  const record = asRecord(payload);
  const rows = Array.isArray(payload)
    ? payload
    : readArray(record, ["items", "entries", "results", "honorBoard"]);
  return rows
    .map(mapHonorEntry)
    .filter((item): item is SchoolEventHonorEntry => item !== null);
}
