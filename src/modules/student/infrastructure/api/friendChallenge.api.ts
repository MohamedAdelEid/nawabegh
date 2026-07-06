import {
  mapFriendChallengeHubResponse,
  mapListItem,
  mapSessionPhase,
  mapSessionStatus,
} from "@/modules/student/domain/friend-challenge/friend-challenge.utils";
import type {
  ActiveFriendChallengeSession,
  CreateFriendChallengePayload,
  CreateFriendChallengeResponse,
  EnterFriendChallengeResponse,
  FriendChallengeApiError,
  FriendChallengeHubResponse,
  FriendChallengeListItem,
  FriendChallengeQuestion,
  FriendChallengeQuestionsResponse,
  FriendChallengeSearchOpponent,
  FriendChallengeSessionResult,
  FriendChallengeSessionState,
  SubmitFriendChallengeAnswerResponse,
} from "@/modules/student/domain/friend-challenge/friend-challenge.types";
import type { BackendApiResponse } from "@/shared/domain/types/api.types";
import {
  extractApiErrorMessage,
  resolveApiData,
  resolveApiList,
} from "@/shared/infrastructure/api/apiResponse.utils";
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

function readNullableString(record: UnknownRecord | null, keys: string[]): string | null {
  if (!record) return null;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim() !== "") return value;
    if (value === null) return null;
  }
  return null;
}

function getApiError(response: BackendApiResponse<unknown>): FriendChallengeApiError {
  return {
    message: response.error?.message ?? response.message ?? "",
    errorCode: (response.error as { errorCode?: string } | undefined)?.errorCode ?? null,
  };
}

function throwApiError(response: BackendApiResponse<unknown>, fallback: string): never {
  const error = getApiError(response);
  const err = new Error(error.message || fallback) as Error & { errorCode?: string | null };
  err.errorCode = error.errorCode;
  throw err;
}

async function callFriendChallengeApi<T>(
  action: () => Promise<T>,
  fallbackMessage: string,
): Promise<T> {
  try {
    return await action();
  } catch (error) {
    throw new Error(extractApiErrorMessage(error, fallbackMessage));
  }
}

function mapSearchOpponent(raw: unknown): FriendChallengeSearchOpponent | null {
  const record = asRecord(raw);
  if (!record) return null;
  const id = readString(record, ["studentUserId"]);
  if (!id) return null;
  return {
    studentUserId: id,
    fullName: readString(record, ["fullName"]),
    username: readString(record, ["username"]),
    email: readString(record, ["email"]),
    phoneNumber: readString(record, ["phoneNumber"]),
    gradeName: readString(record, ["gradeName"]),
    schoolName: readString(record, ["schoolName"]),
    profileImageUrl: readNullableString(record, ["profileImageUrl"]),
    level: readNumber(record, ["level"], 0) || null,
  };
}

function mapQuestion(raw: unknown): FriendChallengeQuestion | null {
  const record = asRecord(raw);
  if (!record) return null;
  const questionId = readString(record, ["questionId"]);
  if (!questionId) return null;
  const optionsRaw = Array.isArray(record.options) ? record.options : [];
  const options = optionsRaw
    .map((optionRaw) => {
      const option = asRecord(optionRaw);
      if (!option) return null;
      const optionId = readString(option, ["optionId"]);
      if (!optionId) return null;
      return {
        optionId,
        text: readString(option, ["text"]),
        order: readNumber(option, ["order"]),
      };
    })
    .filter((option): option is NonNullable<typeof option> => option != null)
    .sort((a, b) => a.order - b.order);

  return {
    questionId,
    text: readString(record, ["text"]),
    category: readString(record, ["category"]),
    points: readNumber(record, ["points"], 20),
    order: readNumber(record, ["order"]),
    options,
  };
}

function mapSessionState(data: unknown): FriendChallengeSessionState {
  const record = asRecord(data);
  const participantsRaw = Array.isArray(record?.participants) ? record.participants : [];
  const participants = participantsRaw.map((raw) => {
    const participant = asRecord(raw);
    return {
      studentId: readString(participant, ["studentId"]),
      totalScore: readNumber(participant, ["totalScore"]),
      correctAnswers: readNumber(participant, ["correctAnswers"]),
      isConnected: readBoolean(participant, ["isConnected"], true),
      isWinner: readBoolean(participant, ["isWinner"], false),
    };
  });

  return {
    sessionId: readString(record, ["sessionId"]),
    status: mapSessionStatus(record),
    phase: mapSessionPhase(record),
    winnerId: readNullableString(record, ["winnerId"]),
    myFinished: readBoolean(record, ["myFinished"]),
    opponentFinished: readBoolean(record, ["opponentFinished"]),
    participants,
  };
}

function mapSessionResult(data: unknown): FriendChallengeSessionResult {
  const record = asRecord(data);
  const participantsRaw = Array.isArray(record?.participants) ? record.participants : [];
  const participants = participantsRaw.map((raw) => {
    const participant = asRecord(raw);
    return {
      studentId: readString(participant, ["studentId"]),
      totalScore: readNumber(participant, ["totalScore"]),
      correctAnswers: readNumber(participant, ["correctAnswers"]),
      isWinner: readBoolean(participant, ["isWinner"], false),
    };
  });

  return {
    sessionId: readString(record, ["sessionId"]),
    friendChallengeId: readString(record, ["friendChallengeId"]),
    winnerId: readNullableString(record, ["winnerId"]),
    loserId: readNullableString(record, ["loserId"]),
    isTie: readBoolean(record, ["isTie"]),
    endReason: readString(record, ["endReason"], "BothFinished") as FriendChallengeSessionResult["endReason"],
    wagerPoints: readNumber(record, ["wagerPoints"]),
    participants,
  };
}

export async function fetchFriendChallengeHub(): Promise<FriendChallengeHubResponse> {
  return callFriendChallengeApi(async () => {
    const response = await httpClient.get<unknown>({
      url: "student/friend-challenges",
    });
    const data = resolveApiData(response);
    if (!data) throwApiError(response, "Failed to load friend challenges");
    return mapFriendChallengeHubResponse(data);
  }, "Failed to load friend challenges");
}

export async function fetchFriendChallengeDetail(
  challengeId: string,
): Promise<FriendChallengeListItem> {
  return callFriendChallengeApi(async () => {
    const response = await httpClient.get<unknown>({
      url: `student/friend-challenges/${encodeURIComponent(challengeId)}`,
    });
    const data = resolveApiData(response);
    const item = mapListItem(data);
    if (!item) throwApiError(response, "Failed to load challenge detail");
    return item;
  }, "Failed to load challenge detail");
}

export async function searchFriendChallengeOpponents(
  keyword: string,
  take = 20,
): Promise<FriendChallengeSearchOpponent[]> {
  return callFriendChallengeApi(async () => {
    const response = await httpClient.get<unknown>({
      url: "student/friend-challenges/search-opponents",
      params: { keyword, take },
    });
    return resolveApiList(response)
      .map(mapSearchOpponent)
      .filter((item): item is FriendChallengeSearchOpponent => item != null);
  }, "Failed to search opponents");
}

export async function createFriendChallenge(
  payload: CreateFriendChallengePayload,
): Promise<CreateFriendChallengeResponse> {
  return callFriendChallengeApi(async () => {
    const response = await httpClient.post<unknown>({
      url: "student/friend-challenges",
      data: payload,
    });
    const data = resolveApiData(response);
    if (!data) throwApiError(response, "Failed to create challenge");
    const record = asRecord(data);
    return {
      friendChallengeId: readString(record, ["friendChallengeId"]),
      status: readString(record, ["status"], "Pending") as CreateFriendChallengeResponse["status"],
      questionSelectionStatus: readString(record, ["questionSelectionStatus"]),
    };
  }, "Failed to create challenge");
}

export async function acceptFriendChallenge(challengeId: string): Promise<void> {
  return callFriendChallengeApi(async () => {
    const response = await httpClient.post<unknown>({
      url: `student/friend-challenges/${encodeURIComponent(challengeId)}/accept`,
      data: {},
    });
    if (!response.isSuccess) throwApiError(response, "Failed to accept challenge");
  }, "Failed to accept challenge");
}

export async function declineFriendChallenge(challengeId: string): Promise<void> {
  return callFriendChallengeApi(async () => {
    const response = await httpClient.post<unknown>({
      url: `student/friend-challenges/${encodeURIComponent(challengeId)}/decline`,
      data: {},
    });
    if (!response.isSuccess) throwApiError(response, "Failed to decline challenge");
  }, "Failed to decline challenge");
}

export async function cancelFriendChallenge(challengeId: string): Promise<void> {
  return callFriendChallengeApi(async () => {
    const response = await httpClient.post<unknown>({
      url: `student/friend-challenges/${encodeURIComponent(challengeId)}/cancel`,
      data: {},
    });
    if (!response.isSuccess) throwApiError(response, "Failed to cancel challenge");
  }, "Failed to cancel challenge");
}

export async function enterFriendChallenge(
  challengeId: string,
  signalRConnectionId?: string,
): Promise<EnterFriendChallengeResponse> {
  return callFriendChallengeApi(async () => {
    const response = await httpClient.post<unknown>({
      url: `student/friend-challenges/${encodeURIComponent(challengeId)}/enter`,
      data: signalRConnectionId ? { signalRConnectionId } : {},
    });
    const data = resolveApiData(response);
    if (!data) throwApiError(response, "Failed to enter challenge");
    const record = asRecord(data);
    return {
      sessionId: readString(record, ["sessionId"]),
      status: readString(record, ["status"], "Waiting") as EnterFriendChallengeResponse["status"],
      phase: readString(record, ["phase"], "WaitingForOpponent") as EnterFriendChallengeResponse["phase"],
      canLoadQuestions: readBoolean(record, ["canLoadQuestions"]),
      readyToStart: readBoolean(record, ["readyToStart"]),
      opponent: {
        studentId: readString(asRecord(record?.opponent), ["studentId"]),
        fullName: readString(asRecord(record?.opponent), ["fullName"]),
        profileImageUrl: readNullableString(asRecord(record?.opponent), ["profileImageUrl"]),
        level: readNumber(asRecord(record?.opponent), ["level"], 0) || null,
        schoolRank: readNumber(asRecord(record?.opponent), ["schoolRank"], 0) || null,
      },
    };
  }, "Failed to enter challenge");
}

export async function fetchActiveFriendChallengeSession(): Promise<ActiveFriendChallengeSession | null> {
  return callFriendChallengeApi(async () => {
    const response = await httpClient.get<unknown>({
      url: "student/friend-challenges/active-session",
    });
    const data = resolveApiData(response);
    if (!data) return null;
    const record = asRecord(data);
    const sessionId = readString(record, ["sessionId"]);
    if (!sessionId) return null;
    return {
      sessionId,
      friendChallengeId: readString(record, ["friendChallengeId"]),
      status: readString(record, ["status"], "Waiting") as ActiveFriendChallengeSession["status"],
      phase: readString(record, ["phase"], "WaitingForOpponent") as ActiveFriendChallengeSession["phase"],
      canLoadQuestions: readBoolean(record, ["canLoadQuestions"]),
    };
  }, "Failed to load active session");
}

export async function fetchFriendChallengeSession(
  sessionId: string,
): Promise<FriendChallengeSessionState> {
  return callFriendChallengeApi(async () => {
    const response = await httpClient.get<unknown>({
      url: `student/friend-challenges/sessions/${encodeURIComponent(sessionId)}`,
    });
    const data = resolveApiData(response);
    if (!data) throwApiError(response, "Failed to load session");
    return mapSessionState(data);
  }, "Failed to load session");
}

export async function fetchFriendChallengeQuestions(
  sessionId: string,
): Promise<FriendChallengeQuestionsResponse> {
  return callFriendChallengeApi(async () => {
    const response = await httpClient.get<unknown>({
      url: `student/friend-challenges/sessions/${encodeURIComponent(sessionId)}/questions`,
    });
    const data = resolveApiData(response);
    const record = asRecord(data);
    const questionsRaw = Array.isArray(record?.questions) ? record.questions : [];
    const questions = questionsRaw
      .map(mapQuestion)
      .filter((question): question is FriendChallengeQuestion => question != null)
      .sort((a, b) => a.order - b.order);
    return { questions };
  }, "Failed to load questions");
}

export async function submitFriendChallengeAnswer(
  sessionId: string,
  questionId: string,
  optionId: string,
): Promise<SubmitFriendChallengeAnswerResponse> {
  return callFriendChallengeApi(async () => {
    const response = await httpClient.post<unknown>({
      url: `student/friend-challenges/sessions/${encodeURIComponent(sessionId)}/answers`,
      data: { questionId, optionId },
    });
    const data = resolveApiData(response);
    if (!data) throwApiError(response, "Failed to submit answer");
    const record = asRecord(data);
    return {
      pointsEarned: readNumber(record, ["pointsEarned"]),
      totalScore: readNumber(record, ["totalScore"]),
      allQuestionsAnswered: readBoolean(record, ["allQuestionsAnswered"]),
    };
  }, "Failed to submit answer");
}

export async function finishFriendChallengeSession(sessionId: string): Promise<void> {
  return callFriendChallengeApi(async () => {
    const response = await httpClient.post<unknown>({
      url: `student/friend-challenges/sessions/${encodeURIComponent(sessionId)}/finish`,
      data: {},
    });
    if (!response.isSuccess) throwApiError(response, "Failed to finish session");
  }, "Failed to finish session");
}

export async function forfeitFriendChallengeSession(sessionId: string): Promise<void> {
  return callFriendChallengeApi(async () => {
    const response = await httpClient.post<unknown>({
      url: `student/friend-challenges/sessions/${encodeURIComponent(sessionId)}/forfeit`,
      data: {},
    });
    if (!response.isSuccess) throwApiError(response, "Failed to forfeit session");
  }, "Failed to forfeit session");
}

export async function fetchFriendChallengeSessionResult(
  sessionId: string,
): Promise<FriendChallengeSessionResult> {
  return callFriendChallengeApi(async () => {
    const response = await httpClient.get<unknown>({
      url: `student/friend-challenges/sessions/${encodeURIComponent(sessionId)}/result`,
    });
    const data = resolveApiData(response);
    if (!data) throwApiError(response, "Failed to load result");
    return mapSessionResult(data);
  }, "Failed to load result");
}

export { getApiError as getFriendChallengeApiError };
