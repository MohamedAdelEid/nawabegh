import { httpClient } from "@/shared/infrastructure/http/httpClient";
import { isApiSuccess } from "@/shared/infrastructure/api/apiResponse.utils";
import {
  extractRegistrationApiError,
  getRegistrationApiErrorMessage,
} from "@/modules/auth/infrastructure/api/student-registration.api";
import type {
  CompleteProfileBody,
  CompleteProfileUser,
} from "@/modules/auth/domain/types/complete-profile.types";

const COMPLETE_PROFILE_PATH = "/api/v1/Auth/complete-profile";

export async function submitCompleteProfile(
  body: CompleteProfileBody,
  fallbackMessage: string,
): Promise<CompleteProfileUser> {
  try {
    const response = await httpClient.post<CompleteProfileUser>({
      url: COMPLETE_PROFILE_PATH,
      data: body,
    });

    if (!isApiSuccess(response) || !response.data) {
      throw new Error(getRegistrationApiErrorMessage(response, fallbackMessage));
    }

    return response.data;
  } catch (error) {
    throw new Error(extractRegistrationApiError(error, fallbackMessage));
  }
}
