import type { BackendApiResponse, BackendStatus } from "@/shared/domain/types/api.types";
import type {
  DailyChallengeRateRow,
  DifficultyDistributionRow,
  FriendChallengeAnswerEntry,
  FriendChallengeDifficulty,
  FriendChallengeListItem,
  FriendChallengeOverviewData,
  FriendChallengeOverviewPlayer,
  FriendChallengePlayer,
  FriendChallengeStatus,
  FriendChallengesDashboardData,
  FriendChallengesKpis,
} from "@/modules/admin/domain/types/friendChallenges.types";
import type { FriendChallengesFilterState } from "@/modules/admin/domain/types/friendChallengesFilters.types";
import {
  isFriendChallengeDifficulty,
} from "@/modules/admin/domain/utils/friendChallengesDisplay";
import { httpClient } from "@/shared/infrastructure/http/httpClient";

const BASE = "/api/v1/admin/friend-challenges";

export type FriendChallengesApiResult<T> = {
  status: BackendStatus | string;
  message?: string;
  errorMessage?: string;
  data: T | null;
};

export type GetFriendChallengesDashboardParams = {
  status?: string;
  subjectId?: number;
  difficulty?: FriendChallengeDifficulty;
  schoolId?: string;
  studentId?: string;
  fromDate?: string;
  toDate?: string;
  search?: string;
  pageNumber: number;
  pageSize: number;
};

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

function readNullableString(record: UnknownRecord | null, keys: string[]): string | null {
  const value = readString(record, keys, "").trim();
  return value || null;
}

function readNumber(record: UnknownRecord | null, keys: string[], fallback: number | null = null) {
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
  if (!record) return data;
  if ("data" in record) return record.data;
  return data;
}

function mapHttpStatus(statusCode: number | null): BackendStatus | "Error" {
  switch (statusCode) {
    case 400:
      return "BadRequest";
    case 401:
      return "Unauthorized";
    case 403:
      return "Forbidden";
    case 404:
      return "NotFound";
    default:
      return "Error";
  }
}

function buildErrorResult<T>(error: unknown, fallbackMessage: string): FriendChallengesApiResult<T> {
  const axiosError = asRecord(error);
  const response = asRecord(axiosError?.response);
  const responseData = asRecord(response?.data) as BackendApiResponse<unknown> | null;
  const httpStatusCode = readNumber(response, ["status"]);

  return {
    status:
      (typeof responseData?.status === "string" ? responseData.status : undefined) ??
      mapHttpStatus(httpStatusCode),
    message: typeof responseData?.message === "string" ? responseData.message : undefined,
    errorMessage:
      (typeof responseData?.error === "object" &&
        responseData?.error !== null &&
        typeof (responseData.error as { message?: string }).message === "string"
        ? (responseData.error as { message: string }).message
        : undefined) ??
      (typeof responseData?.message === "string" ? responseData.message : undefined) ??
      fallbackMessage,
    data: null,
  };
}

function mapPlayer(record: UnknownRecord): FriendChallengePlayer {
  return {
    studentId: readString(record, ["studentId", "StudentId"]),
    fullName: readString(record, ["fullName", "FullName"]),
    schoolName: readNullableString(record, ["schoolName", "SchoolName"]) ?? "",
    profileImageUrl: readNullableString(record, ["profileImageUrl", "ProfileImageUrl"]),
  };
}

function mapOverviewPlayer(record: UnknownRecord): FriendChallengeOverviewPlayer {
  return {
    studentId: readString(record, ["studentId", "StudentId"]),
    fullName: readString(record, ["fullName", "FullName"]),
    profileImageUrl: readNullableString(record, ["profileImageUrl", "ProfileImageUrl"]),
    schoolName: readString(record, ["schoolName", "SchoolName"]),
    totalScore: readNumber(record, ["totalScore", "TotalScore"], 0) ?? 0,
    correctAnswers: readNumber(record, ["correctAnswers", "CorrectAnswers"], 0) ?? 0,
    pointsChange: readNumber(record, ["pointsChange", "PointsChange"], 0) ?? 0,
    isWinner: readBoolean(record, ["isWinner", "IsWinner"]),
  };
}

function mapAnswerEntry(record: UnknownRecord): FriendChallengeAnswerEntry {
  const inviterAnswer = asRecord(record.inviterAnswer ?? record.InviterAnswer) ?? {};
  const inviteeAnswer = asRecord(record.inviteeAnswer ?? record.InviteeAnswer) ?? {};

  const mapAnswer = (answer: UnknownRecord) => ({
    selectedAnswerText: readString(answer, ["selectedAnswerText", "SelectedAnswerText"]),
    isCorrect: readBoolean(answer, ["isCorrect", "IsCorrect"]),
    pointsEarned: readNumber(answer, ["pointsEarned", "PointsEarned"], 0) ?? 0,
    responseTimeMs: readNumber(answer, ["responseTimeMs", "ResponseTimeMs"], 0) ?? 0,
  });

  return {
    order: readNumber(record, ["order", "Order"], 0) ?? 0,
    questionId: readString(record, ["questionId", "QuestionId"]),
    questionText: readString(record, ["questionText", "QuestionText"]),
    correctAnswerText: readString(record, ["correctAnswerText", "CorrectAnswerText"]),
    inviterAnswer: mapAnswer(inviterAnswer),
    inviteeAnswer: mapAnswer(inviteeAnswer),
  };
}

function mapListItem(record: UnknownRecord): FriendChallengeListItem {
  const inviter = asRecord(record.inviter ?? record.Inviter);
  const invitee = asRecord(record.invitee ?? record.Invitee);
  const difficulty = readString(record, ["difficulty", "Difficulty"], "Medium");

  return {
    friendChallengeId: readString(record, ["friendChallengeId", "FriendChallengeId"]),
    title: readString(record, ["title", "Title"]),
    subjectName: readString(record, ["subjectName", "SubjectName"]),
    difficulty: isFriendChallengeDifficulty(difficulty) ? difficulty : "Medium",
    challengeDate: readString(record, ["challengeDate", "ChallengeDate"]),
    inviter: inviter ? mapPlayer(inviter) : { studentId: "", fullName: "", schoolName: "", profileImageUrl: null },
    invitee: invitee ? mapPlayer(invitee) : { studentId: "", fullName: "", schoolName: "", profileImageUrl: null },
    winnerStudentId: readNullableString(record, ["winnerStudentId", "WinnerStudentId"]),
    winnerPointsEarned: readNumber(record, ["winnerPointsEarned", "WinnerPointsEarned"]),
    status: readString(record, ["status", "Status"], "Completed") as FriendChallengeStatus,
  };
}

function mapKpis(record: UnknownRecord): FriendChallengesKpis {
  const averageDifficulty = readString(record, ["averageDifficulty", "AverageDifficulty"], "Medium");
  return {
    totalChallenges: readNumber(record, ["totalChallenges", "TotalChallenges"], 0) ?? 0,
    successRatePercent: readNumber(record, ["successRatePercent", "SuccessRatePercent"], 0) ?? 0,
    totalPointsEarned: readNumber(record, ["totalPointsEarned", "TotalPointsEarned"], 0) ?? 0,
    averageDifficulty: isFriendChallengeDifficulty(averageDifficulty) ? averageDifficulty : "Medium",
  };
}

function mapDifficultyDistribution(record: UnknownRecord): DifficultyDistributionRow {
  const difficulty = readString(record, ["difficulty", "Difficulty"], "Medium");
  return {
    difficulty: isFriendChallengeDifficulty(difficulty) ? difficulty : "Medium",
    count: readNumber(record, ["count", "Count"], 0) ?? 0,
    percent: readNumber(record, ["percent", "Percent"], 0) ?? 0,
  };
}

function mapDailyChallengeRate(record: UnknownRecord): DailyChallengeRateRow {
  return {
    date: readString(record, ["date", "Date"]),
    dayNameAr: readString(record, ["dayNameAr", "DayNameAr"]),
    count: readNumber(record, ["count", "Count"], 0) ?? 0,
  };
}

function extractChallengesPage(
  record: UnknownRecord,
  kpisRecord: UnknownRecord,
  requestPageNumber: number,
  requestPageSize: number,
): FriendChallengesDashboardData["challenges"] {
  const challengesRaw = record.challenges ?? record.Challenges;

  if (Array.isArray(challengesRaw)) {
    const items = challengesRaw.map((row) => mapListItem(asRecord(row) ?? {}));
    const totalCount =
      readNumber(kpisRecord, ["totalChallenges", "TotalChallenges"], items.length) ?? items.length;
    const totalPages =
      requestPageSize > 0 ? Math.max(1, Math.ceil(totalCount / requestPageSize)) : 1;

    return {
      items,
      totalCount,
      currentPage: requestPageNumber,
      pageSize: requestPageSize,
      totalPages,
    };
  }

  const challengesRecord = asRecord(challengesRaw) ?? {};
  const metaRecord = asRecord(challengesRecord.metaData ?? challengesRecord.MetaData) ?? {};
  const items = readArray(challengesRecord, ["items", "Items"]).map((row) =>
    mapListItem(asRecord(row) ?? {}),
  );
  const pageSize =
    readNumber(metaRecord, ["pageSize", "PageSize"], requestPageSize) ?? requestPageSize;
  const totalCount =
    readNumber(metaRecord, ["totalCount", "TotalCount"], items.length) ??
    readNumber(kpisRecord, ["totalChallenges", "TotalChallenges"], items.length) ??
    items.length;
  const currentPage =
    readNumber(metaRecord, ["currentPage", "CurrentPage"], requestPageNumber) ?? requestPageNumber;
  const totalPages = pageSize > 0 ? Math.max(1, Math.ceil(totalCount / pageSize)) : 1;

  return {
    items,
    totalCount,
    currentPage,
    pageSize,
    totalPages,
  };
}

function mapDashboardData(
  raw: unknown,
  requestPageNumber = 1,
  requestPageSize = 10,
): FriendChallengesDashboardData {
  const record = asRecord(extractEnvelopeData(raw)) ?? {};
  const kpisRecord = asRecord(record.kpis ?? record.Kpis) ?? {};

  return {
    kpis: mapKpis(kpisRecord),
    difficultyDistribution: readArray(record, ["difficultyDistribution", "DifficultyDistribution"]).map(
      (row) => mapDifficultyDistribution(asRecord(row) ?? {}),
    ),
    dailyChallengeRate: readArray(record, ["dailyChallengeRate", "DailyChallengeRate"]).map((row) =>
      mapDailyChallengeRate(asRecord(row) ?? {}),
    ),
    challenges: extractChallengesPage(record, kpisRecord, requestPageNumber, requestPageSize),
  };
}

function mapOverviewData(raw: unknown): FriendChallengeOverviewData {
  const record = asRecord(extractEnvelopeData(raw)) ?? {};
  const inviter = asRecord(record.inviter ?? record.Inviter);
  const invitee = asRecord(record.invitee ?? record.Invitee);
  const difficulty = readString(record, ["difficulty", "Difficulty"], "Medium");

  return {
    friendChallengeId: readString(record, ["friendChallengeId", "FriendChallengeId"]),
    title: readString(record, ["title", "Title"]),
    topic: readString(record, ["topic", "Topic"]),
    subjectName: readString(record, ["subjectName", "SubjectName"]),
    difficulty: isFriendChallengeDifficulty(difficulty) ? difficulty : "Medium",
    questionCount: readNumber(record, ["questionCount", "QuestionCount"], 0) ?? 0,
    wagerPoints: readNumber(record, ["wagerPoints", "WagerPoints"], 0) ?? 0,
    durationMinutes: readNumber(record, ["durationMinutes", "DurationMinutes"], 0) ?? 0,
    status: readString(record, ["status", "Status"], "Completed") as FriendChallengeStatus,
    challengeDate: readString(record, ["challengeDate", "ChallengeDate"]),
    startTime: readString(record, ["startTime", "StartTime"]),
    playedAt: readString(record, ["playedAt", "PlayedAt"]),
    actualDurationSeconds: readNumber(record, ["actualDurationSeconds", "ActualDurationSeconds"], 0) ?? 0,
    sessionId: readString(record, ["sessionId", "SessionId"]),
    inviter: inviter
      ? mapOverviewPlayer(inviter)
      : {
          studentId: "",
          fullName: "",
          profileImageUrl: null,
          schoolName: "",
          totalScore: 0,
          correctAnswers: 0,
          pointsChange: 0,
          isWinner: false,
        },
    invitee: invitee
      ? mapOverviewPlayer(invitee)
      : {
          studentId: "",
          fullName: "",
          profileImageUrl: null,
          schoolName: "",
          totalScore: 0,
          correctAnswers: 0,
          pointsChange: 0,
          isWinner: false,
        },
    answerLog: readArray(record, ["answerLog", "AnswerLog"]).map((row) =>
      mapAnswerEntry(asRecord(row) ?? {}),
    ),
  };
}

export function filtersToDashboardParams(
  filters: FriendChallengesFilterState,
  debouncedSearch: string,
  pageNumber: number,
  pageSize: number,
): GetFriendChallengesDashboardParams {
  const subjectId =
    filters.subjectId !== "all" && filters.subjectId.trim() !== ""
      ? Number(filters.subjectId)
      : undefined;

  return {
    ...(filters.status !== "all" ? { status: filters.status } : {}),
    ...(subjectId !== undefined && !Number.isNaN(subjectId) ? { subjectId } : {}),
    ...(filters.difficulty !== "all" && isFriendChallengeDifficulty(filters.difficulty)
      ? { difficulty: filters.difficulty }
      : {}),
    ...(filters.fromDate.trim() ? { fromDate: filters.fromDate.trim() } : {}),
    ...(filters.toDate.trim() ? { toDate: filters.toDate.trim() } : {}),
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    pageNumber,
    pageSize,
  };
}

export async function getFriendChallengesDashboard(
  params: GetFriendChallengesDashboardParams,
): Promise<FriendChallengesApiResult<FriendChallengesDashboardData>> {
  try {
    const response = await httpClient.get<unknown>({
      url: `${BASE}/dashboard`,
      params: {
        pageNumber: params.pageNumber,
        pageSize: params.pageSize,
        ...(params.status ? { status: params.status } : {}),
        ...(params.subjectId != null ? { subjectId: params.subjectId } : {}),
        ...(params.difficulty ? { difficulty: params.difficulty } : {}),
        ...(params.schoolId ? { schoolId: params.schoolId } : {}),
        ...(params.studentId ? { studentId: params.studentId } : {}),
        ...(params.fromDate ? { fromDate: params.fromDate } : {}),
        ...(params.toDate ? { toDate: params.toDate } : {}),
        ...(params.search ? { search: params.search } : {}),
      },
    });

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: mapDashboardData(response.data, params.pageNumber, params.pageSize),
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to load friend challenges dashboard.");
  }
}

export async function getFriendChallengeOverview(
  challengeId: string,
): Promise<FriendChallengesApiResult<FriendChallengeOverviewData>> {
  try {
    const response = await httpClient.get<unknown>({
      url: `${BASE}/${encodeURIComponent(challengeId)}/overview`,
    });

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: mapOverviewData(response.data),
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to load challenge overview.");
  }
}
