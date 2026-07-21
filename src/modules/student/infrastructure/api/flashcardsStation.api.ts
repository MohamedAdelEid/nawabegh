import {
  mapFlashcardReviewOutcomeResultDto,
  mapFlashcardsStationCompletionResultDto,
  mapFlashcardsStationDeckDto,
  mapFlashcardsStationIntroDto,
} from "@/modules/student/domain/flashcards-station/flashcards-station.utils";
import type {
  FlashcardReviewOutcomeResultDto,
  FlashcardsStationCompletionResultDto,
  FlashcardsStationDeckDto,
  FlashcardsStationIntroDto,
} from "@/modules/student/domain/flashcards-station/flashcards-station.types";
import type {
  FlashcardCardOutcome,
  FlashcardReviewOutcome,
} from "@/modules/student/domain/flashcards-station/flashcards-station.enums";
import {
  extractApiErrorMessage,
  resolveApiData,
} from "@/shared/infrastructure/api/apiResponse.utils";
import { httpClient } from "@/shared/infrastructure/http/httpClient";

async function callFlashcardsApi<T>(
  action: () => Promise<T>,
  fallbackMessage: string,
): Promise<T> {
  try {
    return await action();
  } catch (error) {
    throw new Error(extractApiErrorMessage(error, fallbackMessage));
  }
}

export async function getFlashcardsStationIntro(
  stationId: string,
): Promise<FlashcardsStationIntroDto> {
  return callFlashcardsApi(async () => {
    const response = await httpClient.get<unknown>({
      url: `Station/${encodeURIComponent(stationId)}`,
    });
    const dto = mapFlashcardsStationIntroDto(resolveApiData(response));
    if (!dto) throw new Error("Failed to load flashcards station");
    return dto;
  }, "Failed to load flashcards station");
}

export async function getFlashcardsStationDeck(
  stationId: string,
): Promise<FlashcardsStationDeckDto> {
  return callFlashcardsApi(async () => {
    const response = await httpClient.get<unknown>({
      url: `progress/flashcard-stations/${encodeURIComponent(stationId)}/deck`,
    });
    const dto = mapFlashcardsStationDeckDto(resolveApiData(response));
    if (!dto) throw new Error("Failed to load flashcard deck");
    return dto;
  }, "Failed to load flashcard deck");
}

export async function submitFlashcardOutcome(params: {
  stationId: string;
  flashcardId: string;
  outcome: FlashcardCardOutcome;
}): Promise<void> {
  return callFlashcardsApi(async () => {
    await httpClient.post<unknown>({
      url: `progress/flashcard-stations/${encodeURIComponent(params.stationId)}/outcomes`,
      data: {
        flashcardId: params.flashcardId,
        outcome: params.outcome,
      },
    });
  }, "Failed to submit flashcard outcome");
}

export async function submitFlashcardReviewOutcome(params: {
  stationId: string;
  flashcardId: string;
  outcome: FlashcardReviewOutcome;
}): Promise<FlashcardReviewOutcomeResultDto> {
  return callFlashcardsApi(async () => {
    const response = await httpClient.post<unknown>({
      url: `progress/flashcard-stations/${encodeURIComponent(params.stationId)}/review-outcomes`,
      data: {
        flashcardId: params.flashcardId,
        outcome: params.outcome,
      },
    });
    return (
      mapFlashcardReviewOutcomeResultDto(resolveApiData(response)) ?? {
        reviewPointsAwarded: 0,
        flashcardId: params.flashcardId,
      }
    );
  }, "Failed to submit review outcome");
}

export async function completeFlashcardsStation(params: {
  stationId: string;
  percentageCompleted: number;
}): Promise<FlashcardsStationCompletionResultDto> {
  return callFlashcardsApi(async () => {
    const response = await httpClient.post<unknown>({
      url: `progress/flashcard-stations/${encodeURIComponent(params.stationId)}/complete`,
      data: {
        percentageCompleted: params.percentageCompleted,
      },
    });
    const dto = mapFlashcardsStationCompletionResultDto(resolveApiData(response));
    if (!dto) throw new Error("Failed to complete flashcards station");
    return dto;
  }, "Failed to complete flashcards station");
}
