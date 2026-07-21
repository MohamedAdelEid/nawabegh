import {
  mapShortQuizAttempt,
  mapShortQuizStationIntro,
  mapShortQuizStationResult,
} from "@/modules/student/domain/short-quiz/short-quiz.utils";
import type {
  SaveShortQuizAnswerPayload,
  ShortQuizAttemptDto,
  ShortQuizStationIntroDto,
  ShortQuizStationResultDto,
} from "@/modules/student/domain/short-quiz/short-quiz.types";
import {
  extractApiErrorMessage,
  resolveApiData,
} from "@/shared/infrastructure/api/apiResponse.utils";
import { httpClient } from "@/shared/infrastructure/http/httpClient";

async function callShortQuizApi<T>(
  action: () => Promise<T>,
  fallbackMessage: string,
): Promise<T> {
  try {
    return await action();
  } catch (error) {
    throw new Error(extractApiErrorMessage(error, fallbackMessage));
  }
}

export async function getShortQuizStationIntro(
  stationId: string,
): Promise<ShortQuizStationIntroDto> {
  return callShortQuizApi(async () => {
    const response = await httpClient.get<unknown>({
      url: `Station/${stationId}`,
    });
    const dto = mapShortQuizStationIntro(resolveApiData(response));
    if (!dto) throw new Error("Failed to load quiz station");
    return dto;
  }, "Failed to load quiz station");
}

export async function getShortQuizAttempt(
  stationId: string,
): Promise<ShortQuizAttemptDto> {
  return callShortQuizApi(async () => {
    const response = await httpClient.get<unknown>({
      url: `progress/quiz-stations/${stationId}/attempt`,
    });
    const data = resolveApiData(response);
    const result = mapShortQuizStationResult(data);
    if (result) return result.attempt;
    const attempt = mapShortQuizAttempt(data);
    if (!attempt) throw new Error("Failed to load quiz attempt");
    return attempt;
  }, "Failed to load quiz attempt");
}

export async function saveShortQuizAnswer(
  stationId: string,
  payload: SaveShortQuizAnswerPayload,
): Promise<ShortQuizAttemptDto> {
  return callShortQuizApi(async () => {
    const response = await httpClient.post<unknown>({
      url: `progress/quiz-stations/${stationId}/answers`,
      data: payload,
    });
    const data = resolveApiData(response);
    const result = mapShortQuizStationResult(data);
    if (result) return result.attempt;
    const attempt = mapShortQuizAttempt(data);
    if (!attempt) throw new Error("Failed to save answer");
    return attempt;
  }, "Failed to save answer");
}

export async function submitShortQuizAttempt(
  stationId: string,
): Promise<ShortQuizStationResultDto> {
  return callShortQuizApi(async () => {
    const response = await httpClient.post<unknown>({
      url: `progress/quiz-stations/${stationId}/submit`,
    });
    const dto = mapShortQuizStationResult(resolveApiData(response));
    if (!dto) throw new Error("Failed to submit quiz");
    return dto;
  }, "Failed to submit quiz");
}
