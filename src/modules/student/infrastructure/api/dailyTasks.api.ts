import { mapStudentDailyTasksDto } from "@/modules/student/domain/daily-tasks/daily-tasks.utils";
import type { StudentDailyTasksDto } from "@/modules/student/domain/daily-tasks/daily-tasks.types";
import {
  extractApiErrorMessage,
  resolveApiData,
} from "@/shared/infrastructure/api/apiResponse.utils";
import { httpClient } from "@/shared/infrastructure/http/httpClient";

async function callDailyTasksApi<T>(
  action: () => Promise<T>,
  fallbackMessage: string,
): Promise<T> {
  try {
    return await action();
  } catch (error) {
    throw new Error(extractApiErrorMessage(error, fallbackMessage));
  }
}

export async function getStudentDailyTasks(): Promise<StudentDailyTasksDto> {
  return callDailyTasksApi(async () => {
    const response = await httpClient.get<unknown>({
      url: "student/daily-tasks",
    });
    const dto = mapStudentDailyTasksDto(resolveApiData(response));
    if (!dto) throw new Error("Failed to load daily tasks");
    return dto;
  }, "Failed to load daily tasks");
}

export async function joinLiveStation(stationId: string): Promise<void> {
  // Prefer navigating to LIVE_STATION route; this remains for legacy callers.
  // Join credentials are obtained on the live station page via joinStudentLiveStation.
  await callDailyTasksApi(async () => {
    await httpClient.post<unknown>({
      url: `live-stations/${encodeURIComponent(stationId)}/join`,
    });
  }, "Failed to join live session");
}

export async function enterChallengeQueue(challengeId: string): Promise<void> {
  return callDailyTasksApi(async () => {
    await httpClient.post<unknown>({
      url: `student/challenges/${encodeURIComponent(challengeId)}/queue`,
      data: {},
    });
  }, "Failed to enter challenge");
}
