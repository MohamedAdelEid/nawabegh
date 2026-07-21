import {
  appendChatMessage,
  mapLiveChatMessageDto,
  mapLiveChatMessagesPageDto,
  mapLiveHandRaisedEvent,
  mapLiveParticipantDto,
  mapLiveRecordingProgressDto,
  mapLiveStationCompletionResultDto,
  mapLiveStationInfoDto,
  mapLiveStationJoinResultDto,
} from "@/modules/student/domain/live-station/live-station.utils";
import type {
  LiveChatMessageDto,
  LiveChatMessagesPageDto,
  LiveHandRaisedEvent,
  LiveParticipantDto,
  LiveRecordingProgressDto,
  LiveStationCompletionResultDto,
  LiveStationInfoDto,
  LiveStationJoinResultDto,
} from "@/modules/student/domain/live-station/live-station.types";
import {
  extractApiErrorMessage,
  resolveApiData,
} from "@/shared/infrastructure/api/apiResponse.utils";
import { httpClient } from "@/shared/infrastructure/http/httpClient";

async function callLiveStationApi<T>(
  action: () => Promise<T>,
  fallbackMessage: string,
): Promise<T> {
  try {
    return await action();
  } catch (error) {
    throw new Error(extractApiErrorMessage(error, fallbackMessage));
  }
}

export async function getStudentLiveStationInfo(
  stationId: string,
): Promise<LiveStationInfoDto> {
  return callLiveStationApi(async () => {
    const response = await httpClient.get<unknown>({
      url: `live-stations/${encodeURIComponent(stationId)}/info`,
    });
    const dto = mapLiveStationInfoDto(resolveApiData(response));
    if (!dto) throw new Error("Failed to load live station info");
    return dto;
  }, "Failed to load live station info");
}

export async function joinStudentLiveStation(
  stationId: string,
): Promise<LiveStationJoinResultDto> {
  return callLiveStationApi(async () => {
    const response = await httpClient.post<unknown>({
      url: `live-stations/${encodeURIComponent(stationId)}/join`,
    });
    const dto = mapLiveStationJoinResultDto(resolveApiData(response));
    if (!dto) throw new Error("Failed to join live session");
    return dto;
  }, "Failed to join live session");
}

export async function getLiveStationChatMessages(
  stationId: string,
  pageNumber = 1,
  pageSize = 50,
): Promise<LiveChatMessagesPageDto> {
  return callLiveStationApi(async () => {
    const response = await httpClient.get<unknown>({
      url: `live-stations/${encodeURIComponent(stationId)}/chat/messages`,
      params: { pageNumber, pageSize },
    });
    return mapLiveChatMessagesPageDto(resolveApiData(response));
  }, "Failed to load chat messages");
}

export async function sendLiveStationChatMessage(
  stationId: string,
  body: string,
): Promise<LiveChatMessageDto> {
  return callLiveStationApi(async () => {
    const response = await httpClient.post<unknown>({
      url: `live-stations/${encodeURIComponent(stationId)}/chat/messages`,
      data: { body },
    });
    const dto = mapLiveChatMessageDto(resolveApiData(response));
    if (!dto) throw new Error("Failed to send chat message");
    return dto;
  }, "Failed to send chat message");
}

export async function raiseLiveStationHand(
  stationId: string,
  raised: boolean,
): Promise<LiveHandRaisedEvent | null> {
  return callLiveStationApi(async () => {
    const response = await httpClient.post<unknown>({
      url: `live-stations/${encodeURIComponent(stationId)}/raise-hand`,
      data: { raised },
    });
    return mapLiveHandRaisedEvent(resolveApiData(response));
  }, "Failed to toggle raise hand");
}

export async function getLiveStationParticipants(
  stationId: string,
): Promise<LiveParticipantDto[]> {
  return callLiveStationApi(async () => {
    const response = await httpClient.get<unknown>({
      url: `live-stations/${encodeURIComponent(stationId)}/participants`,
    });
    const data = resolveApiData(response);
    const record =
      data !== null && typeof data === "object" && !Array.isArray(data)
        ? (data as Record<string, unknown>)
        : null;
    const list = Array.isArray(data)
      ? data
      : Array.isArray(record?.participants)
        ? record.participants
        : [];
    return list
      .map(mapLiveParticipantDto)
      .filter((item): item is LiveParticipantDto => Boolean(item));
  }, "Failed to load participants");
}

export async function getLiveStationRecordingProgress(
  stationId: string,
): Promise<LiveRecordingProgressDto> {
  return callLiveStationApi(async () => {
    const response = await httpClient.get<unknown>({
      url: `live-stations/${encodeURIComponent(stationId)}/recording-progress`,
    });
    return mapLiveRecordingProgressDto(resolveApiData(response));
  }, "Failed to load recording progress");
}

export async function saveLiveStationRecordingProgress(
  stationId: string,
  lastPositionSeconds: number,
): Promise<LiveRecordingProgressDto> {
  return callLiveStationApi(async () => {
    const response = await httpClient.put<unknown>({
      url: `live-stations/${encodeURIComponent(stationId)}/recording-progress`,
      data: { lastPositionSeconds },
    });
    return mapLiveRecordingProgressDto(resolveApiData(response));
  }, "Failed to save recording progress");
}

export async function completeLiveStationRecording(
  stationId: string,
  percentageCompleted: number,
): Promise<LiveStationCompletionResultDto> {
  return callLiveStationApi(async () => {
    const response = await httpClient.post<unknown>({
      url: `progress/stations/${encodeURIComponent(stationId)}/complete`,
      data: {
        percentageCompleted,
        scoreAchieved: null,
      },
    });
    const dto = mapLiveStationCompletionResultDto(resolveApiData(response));
    if (!dto) {
      return {
        pathCompleted: false,
        pathId: null,
        pathPointsEarned: 0,
        totalPoints: 0,
        currentLevel: 0,
        pointsToNextLevel: 0,
      };
    }
    return dto;
  }, "Failed to complete station");
}

export { appendChatMessage };
