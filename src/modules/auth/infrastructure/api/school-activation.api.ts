import { httpClient } from "@/shared/infrastructure/http/httpClient";
import { isApiSuccess } from "@/shared/infrastructure/api/apiResponse.utils";
import {
  extractRegistrationApiError,
  getRegistrationApiErrorMessage,
} from "@/modules/auth/infrastructure/api/student-registration.api";
import type {
  SchoolActivationRequest,
  SchoolActivationResponse,
} from "@/modules/auth/domain/types/school-activation.types";

const SCHOOL_ACTIVATION_PATH = "/api/v1/Auth/school-activation-request";

export async function submitSchoolActivationRequest(
  payload: SchoolActivationRequest,
  fallbackMessage: string,
): Promise<SchoolActivationResponse> {
  try {
    const response = await httpClient.post<unknown>({
      url: SCHOOL_ACTIVATION_PATH,
      data: payload,
    });

    if (!isApiSuccess(response)) {
      throw new Error(getRegistrationApiErrorMessage(response, fallbackMessage));
    }

    return { success: true, message: response.message ?? undefined };
  } catch (error) {
    throw new Error(extractRegistrationApiError(error, fallbackMessage));
  }
}
