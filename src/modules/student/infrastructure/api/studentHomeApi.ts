import {
  mapCurrentStationsDto,
  mapInAppNotification,
  mapLeaderboardWidgetDto,
  mapStudentMyProfile,
} from "@/modules/student/domain/home/student-home.utils";
import type {
  CurrentStationsDto,
  InAppNotification,
  LeaderboardWidgetDto,
  StudentMyProfile,
} from "@/modules/student/domain/types/student-home.types";
import {
  extractApiErrorMessage,
  resolveApiData,
  resolveApiList,
} from "@/shared/infrastructure/api/apiResponse.utils";
import { mapApiItems } from "@/shared/infrastructure/api/mapApiItems";
import { httpClient } from "@/shared/infrastructure/http/httpClient";

async function callStudentHomeApi<T>(
  action: () => Promise<T>,
  fallbackMessage: string,
): Promise<T> {
  try {
    return await action();
  } catch (error) {
    throw new Error(extractApiErrorMessage(error, fallbackMessage));
  }
}

export async function getStudentMyProfile(): Promise<StudentMyProfile> {
  return callStudentHomeApi(async () => {
    const response = await httpClient.get<unknown>({
      url: "student/my-profile",
    });
    const profile = mapStudentMyProfile(resolveApiData(response));
    if (!profile) throw new Error("Failed to load profile");
    return profile;
  }, "Failed to load profile");
}

export async function getCurrentStations(limit = 10): Promise<CurrentStationsDto> {
  return callStudentHomeApi(async () => {
    const response = await httpClient.get<unknown>({
      url: "student/home/current-stations",
      params: { limit },
    });
    return mapCurrentStationsDto(resolveApiData(response));
  }, "Failed to load live sessions");
}

export async function getLeaderboardWidget(): Promise<LeaderboardWidgetDto> {
  return callStudentHomeApi(async () => {
    const response = await httpClient.get<unknown>({
      url: "leaderboard",
      params: { pageNumber: 1, pageSize: 1 },
    });
    return mapLeaderboardWidgetDto(resolveApiData(response));
  }, "Failed to load leaderboard");
}

export async function getUnreadInAppNotifications(): Promise<InAppNotification[]> {
  return callStudentHomeApi(async () => {
    const response = await httpClient.get<unknown>({
      url: "PushNotifications/in-app",
      params: { pageNumber: 1, pageSize: 20, unreadOnly: true },
    });
    return mapApiItems(resolveApiList(response), mapInAppNotification).filter(
      (item): item is InAppNotification => item != null,
    );
  }, "Failed to load notifications");
}
