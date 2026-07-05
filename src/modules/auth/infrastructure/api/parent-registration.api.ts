import { httpClient } from "@/shared/infrastructure/http/httpClient";
import { isApiSuccess } from "@/shared/infrastructure/api/apiResponse.utils";
import {
  extractRegistrationApiError,
  getRegistrationApiErrorMessage,
} from "@/modules/auth/infrastructure/api/student-registration.api";
import type {
  ParentRegistrationRequest,
  ParentRegistrationResponse,
} from "@/modules/auth/domain/types/parent-registration.types";

const PARENT_REGISTRATION_PATH = "/api/v1/Auth/parent-registration";

export async function submitParentRegistration(
  payload: ParentRegistrationRequest,
  fallbackMessage: string,
): Promise<ParentRegistrationResponse> {
  try {
    const response = await httpClient.post<unknown>({
      url: PARENT_REGISTRATION_PATH,
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
