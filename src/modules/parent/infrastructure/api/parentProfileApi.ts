import type {
  ParentChangePasswordPayload,
  ParentProfile,
  UpdateParentProfilePayload,
} from "@/modules/parent/domain/types/parentProfile.types";
import {
  getApiErrorMessage,
  resolveApiData,
} from "@/shared/infrastructure/api/apiResponse.utils";
import { httpClient } from "@/shared/infrastructure/http/httpClient";

const PROFILE_URL = "/api/v1/Parent/profile";
const CHANGE_PASSWORD_URL = `${PROFILE_URL}/change-password`;

export async function fetchParentProfile(): Promise<ParentProfile> {
  const response = await httpClient.get<ParentProfile>({ url: PROFILE_URL });
  return resolveApiData(response);
}

export async function updateParentProfile(
  payload: UpdateParentProfilePayload,
): Promise<void> {
  const response = await httpClient.put<boolean>({
    url: PROFILE_URL,
    data: payload,
  });

  if (response.isSuccess === false || response.data !== true) {
    throw new Error(getApiErrorMessage(response, "Failed to update profile"));
  }
}

export async function changeParentPassword(
  payload: ParentChangePasswordPayload,
): Promise<void> {
  const response = await httpClient.put<boolean>({
    url: CHANGE_PASSWORD_URL,
    data: payload,
  });

  if (response.isSuccess === false || response.data !== true) {
    throw new Error(getApiErrorMessage(response, "Failed to change password"));
  }
}
