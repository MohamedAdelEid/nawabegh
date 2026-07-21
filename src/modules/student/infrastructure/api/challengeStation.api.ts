import {
  mapAchievementAuditItems,
  mapChallengeAnswerResultDto,
  mapChallengeOverviewDto,
  mapChallengeQuestionsDto,
  mapChallengeQueueResultDto,
  mapChallengeSessionDto,
  mapChallengeStationIntroDto,
  mapStudentPointsSummaryDto,
} from "@/modules/student/domain/challenge-station/challenge-station.utils";
import type {
  AchievementAuditItemDto,
  ChallengeAnswerResultDto,
  ChallengeOverviewDto,
  ChallengeQuestionsDto,
  ChallengeQueueResultDto,
  ChallengeSessionDto,
  ChallengeStationIntroDto,
  StudentPointsSummaryDto,
} from "@/modules/student/domain/challenge-station/challenge-station.types";
import {
  extractApiErrorMessage,
  resolveApiData,
} from "@/shared/infrastructure/api/apiResponse.utils";
import { httpClient } from "@/shared/infrastructure/http/httpClient";

async function callChallengeApi<T>(
  action: () => Promise<T>,
  fallbackMessage: string,
): Promise<T> {
  try {
    return await action();
  } catch (error) {
    throw new Error(extractApiErrorMessage(error, fallbackMessage));
  }
}

export async function getChallengeStationIntro(
  stationId: string,
): Promise<ChallengeStationIntroDto> {
  return callChallengeApi(async () => {
    const response = await httpClient.get<unknown>({
      url: `Station/${encodeURIComponent(stationId)}`,
    });
    const dto = mapChallengeStationIntroDto(resolveApiData(response));
    if (!dto?.challengeId) throw new Error("Challenge not found for station");
    return dto;
  }, "Failed to load challenge station");
}

export async function getChallengeOverview(
  challengeId: string,
): Promise<ChallengeOverviewDto> {
  return callChallengeApi(async () => {
    const response = await httpClient.get<unknown>({
      url: `student/challenges/${encodeURIComponent(challengeId)}`,
    });
    const dto = mapChallengeOverviewDto(resolveApiData(response));
    if (!dto) throw new Error("Failed to load challenge");
    return dto;
  }, "Failed to load challenge");
}

export async function enterChallengeStationQueue(params: {
  challengeId: string;
  signalRConnectionId: string;
}): Promise<ChallengeQueueResultDto> {
  return callChallengeApi(async () => {
    const response = await httpClient.post<unknown>({
      url: `student/challenges/${encodeURIComponent(params.challengeId)}/queue`,
      data: { signalRConnectionId: params.signalRConnectionId },
    });
    return mapChallengeQueueResultDto(resolveApiData(response));
  }, "Failed to enter challenge queue");
}

export async function cancelChallengeQueue(challengeId: string): Promise<void> {
  return callChallengeApi(async () => {
    await httpClient.delete<unknown>({
      url: `student/challenges/${encodeURIComponent(challengeId)}/queue`,
    });
  }, "Failed to cancel challenge queue");
}

export async function startChallengePractice(
  challengeId: string,
): Promise<ChallengeQueueResultDto> {
  return callChallengeApi(async () => {
    const response = await httpClient.post<unknown>({
      url: `student/challenges/${encodeURIComponent(challengeId)}/practice/start`,
      data: {},
    });
    return mapChallengeQueueResultDto(resolveApiData(response));
  }, "Failed to start practice");
}

export async function getChallengeSession(
  sessionId: string,
): Promise<ChallengeSessionDto> {
  return callChallengeApi(async () => {
    const response = await httpClient.get<unknown>({
      url: `student/challenges/sessions/${encodeURIComponent(sessionId)}`,
    });
    const dto = mapChallengeSessionDto(resolveApiData(response));
    if (!dto) throw new Error("Failed to load session");
    return dto;
  }, "Failed to load session");
}

export async function getChallengeSessionQuestions(
  sessionId: string,
): Promise<ChallengeQuestionsDto> {
  return callChallengeApi(async () => {
    const response = await httpClient.get<unknown>({
      url: `student/challenges/sessions/${encodeURIComponent(sessionId)}/questions`,
    });
    return mapChallengeQuestionsDto(resolveApiData(response));
  }, "Failed to load questions");
}

export async function submitChallengeAnswer(params: {
  sessionId: string;
  questionId: string;
  optionId: string;
}): Promise<ChallengeAnswerResultDto> {
  return callChallengeApi(async () => {
    const response = await httpClient.post<unknown>({
      url: `student/challenges/sessions/${encodeURIComponent(params.sessionId)}/answers`,
      data: {
        questionId: params.questionId,
        optionId: params.optionId,
      },
    });
    return mapChallengeAnswerResultDto(resolveApiData(response));
  }, "Failed to submit answer");
}

export async function finishChallengeSession(sessionId: string): Promise<void> {
  return callChallengeApi(async () => {
    await httpClient.post<unknown>({
      url: `student/challenges/sessions/${encodeURIComponent(sessionId)}/finish`,
      data: {},
    });
  }, "Failed to finish session");
}

export async function forfeitChallengeSession(sessionId: string): Promise<void> {
  return callChallengeApi(async () => {
    await httpClient.post<unknown>({
      url: `student/challenges/sessions/${encodeURIComponent(sessionId)}/forfeit`,
      data: {},
    });
  }, "Failed to forfeit session");
}

export async function reconnectChallengeSession(params: {
  sessionId: string;
  signalRConnectionId: string;
}): Promise<void> {
  return callChallengeApi(async () => {
    await httpClient.post<unknown>({
      url: `student/challenges/sessions/${encodeURIComponent(params.sessionId)}/reconnect`,
      data: { signalRConnectionId: params.signalRConnectionId },
    });
  }, "Failed to reconnect session");
}

export async function getStudentPointsSummary(
  recent = 20,
): Promise<StudentPointsSummaryDto> {
  return callChallengeApi(async () => {
    const response = await httpClient.get<unknown>({
      url: "student/points",
      params: { recent },
    });
    return mapStudentPointsSummaryDto(resolveApiData(response));
  }, "Failed to load points");
}

export async function getAchievementAudit(params?: {
  pageNumber?: number;
  pageSize?: number;
}): Promise<AchievementAuditItemDto[]> {
  return callChallengeApi(async () => {
    const response = await httpClient.get<unknown>({
      url: "leaderboard/achievement-audit",
      params: {
        pageNumber: params?.pageNumber ?? 1,
        pageSize: params?.pageSize ?? 10,
      },
    });
    return mapAchievementAuditItems(resolveApiData(response));
  }, "Failed to load achievements");
}
