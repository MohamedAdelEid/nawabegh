import {
  mapStudentBadgesMyDto,
  mapStudentSchoolRankDto,
} from "@/modules/student/domain/profile/profile.utils";
import type {
  StudentBadgesMyDto,
  StudentSchoolRankDto,
  UpdateStudentProfilePayload,
} from "@/modules/student/domain/profile/profile.types";
import { mapStudentMyProfile } from "@/modules/student/domain/home/student-home.utils";
import type { StudentMyProfile } from "@/modules/student/domain/types/student-home.types";
import {
  extractApiErrorMessage,
  resolveApiData,
} from "@/shared/infrastructure/api/apiResponse.utils";
import { httpClient } from "@/shared/infrastructure/http/httpClient";

async function callProfileApi<T>(
  action: () => Promise<T>,
  fallbackMessage: string,
): Promise<T> {
  try {
    return await action();
  } catch (error) {
    throw new Error(extractApiErrorMessage(error, fallbackMessage));
  }
}

export async function getStudentProfileBadges(): Promise<StudentBadgesMyDto> {
  return callProfileApi(async () => {
    const response = await httpClient.get<unknown>({
      url: "badges/my",
    });
    return mapStudentBadgesMyDto(resolveApiData(response));
  }, "Failed to load badges");
}

export async function getStudentSchoolRank(): Promise<StudentSchoolRankDto> {
  return callProfileApi(async () => {
    const response = await httpClient.get<unknown>({
      url: "leaderboard/my-school-rank",
    });
    return mapStudentSchoolRankDto(resolveApiData(response));
  }, "Failed to load school rank");
}

export async function updateStudentMyProfile(
  payload: UpdateStudentProfilePayload,
): Promise<StudentMyProfile> {
  return callProfileApi(async () => {
    const response = await httpClient.put<unknown>({
      url: "student/my-profile",
      data: payload,
    });
    const profile = mapStudentMyProfile(resolveApiData(response));
    if (!profile) throw new Error("Failed to update profile");
    return profile;
  }, "Failed to update profile");
}
