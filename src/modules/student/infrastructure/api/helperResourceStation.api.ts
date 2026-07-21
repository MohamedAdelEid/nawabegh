import type {
  HelperResourceReadingProgressDto,
  ResourceFileMediaKind,
  StudentHelperResourceFileDto,
  StudentHelperResourceStationDto,
} from "@/modules/student/domain/types/helperResource.types";
import {
  extractApiErrorMessage,
  resolveApiData,
} from "@/shared/infrastructure/api/apiResponse.utils";
import { httpClient } from "@/shared/infrastructure/http/httpClient";
import {
  getHelperResourceReadingProgress as getHelperResourceReadingProgressResult,
  getStudentHelperResourceFile as getStudentHelperResourceFileResult,
  getStudentHelperResourceStation as getStudentHelperResourceStationResult,
  updateHelperResourceReadingProgress as updateHelperResourceReadingProgressResult,
} from "@/modules/student/infrastructure/api/studentHelperResourceApi";

export type HelperResourceStationCompletionResultDto = {
  pathCompleted: boolean;
  pathId: string | null;
  pathPointsEarned: number;
  totalPoints: number;
  currentLevel: number;
  pointsToNextLevel: number;
};

async function callHelperResourceApi<T>(
  action: () => Promise<T>,
  fallbackMessage: string,
): Promise<T> {
  try {
    return await action();
  } catch (error) {
    throw new Error(extractApiErrorMessage(error, fallbackMessage));
  }
}

function assertResultData<T>(
  result: { data: T | null; errorMessage?: string; message?: string },
  fallbackMessage: string,
): T {
  if (result.data) return result.data;
  throw new Error(result.errorMessage || result.message || fallbackMessage);
}

export async function getHelperResourceStation(
  stationId: string,
  params?: { mediaKind?: ResourceFileMediaKind; category?: string },
): Promise<StudentHelperResourceStationDto> {
  const result = await getStudentHelperResourceStationResult(stationId, params);
  return assertResultData(result, "Failed to load helper resource station");
}

export async function getHelperResourceFile(
  resourceFileId: string,
): Promise<StudentHelperResourceFileDto> {
  const result = await getStudentHelperResourceFileResult(resourceFileId);
  return assertResultData(result, "Failed to load helper resource file");
}

export async function getHelperResourceProgress(
  resourceFileId: string,
): Promise<HelperResourceReadingProgressDto> {
  const result = await getHelperResourceReadingProgressResult(resourceFileId);
  if (result.data) return result.data;
  return {
    resourceFileId,
    readPercentage: 0,
    lastPageOrSlide: 0,
    lastSyncedAt: "",
  };
}

export async function saveHelperResourceProgress(
  resourceFileId: string,
  progress: { readPercentage: number; lastPageOrSlide: number },
): Promise<HelperResourceReadingProgressDto> {
  const result = await updateHelperResourceReadingProgressResult(
    resourceFileId,
    progress,
  );
  return assertResultData(result, "Failed to save reading progress");
}

export async function completeHelperResourceStation(
  stationId: string,
  percentageCompleted = 100,
): Promise<HelperResourceStationCompletionResultDto> {
  return callHelperResourceApi(async () => {
    const response = await httpClient.post<unknown>({
      url: `progress/stations/${encodeURIComponent(stationId)}/complete`,
      data: {
        percentageCompleted,
        scoreAchieved: null,
      },
    });
    const data = resolveApiData(response) as Record<string, unknown> | null;
    return {
      pathCompleted: Boolean(data?.pathCompleted),
      pathId: typeof data?.pathId === "string" ? data.pathId : null,
      pathPointsEarned:
        typeof data?.pathPointsEarned === "number" ? data.pathPointsEarned : 0,
      totalPoints: typeof data?.totalPoints === "number" ? data.totalPoints : 0,
      currentLevel:
        typeof data?.currentLevel === "number" ? data.currentLevel : 0,
      pointsToNextLevel:
        typeof data?.pointsToNextLevel === "number"
          ? data.pointsToNextLevel
          : 0,
    };
  }, "Failed to complete helper resource station");
}
