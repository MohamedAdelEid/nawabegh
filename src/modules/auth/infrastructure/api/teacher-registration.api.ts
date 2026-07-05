import { httpClient } from "@/shared/infrastructure/http/httpClient";
import { isApiSuccess } from "@/shared/infrastructure/api/apiResponse.utils";
import {
  extractRegistrationApiError,
  getRegistrationApiErrorMessage,
} from "@/modules/auth/infrastructure/api/student-registration.api";
import type {
  TeacherRegistrationRequest,
  TeacherRegistrationResponse,
} from "@/modules/auth/domain/types/teacher-registration.types";

const TEACHER_REGISTRATION_PATH = "/api/v1/Auth/teacher-registration";

export async function submitTeacherRegistration(
  payload: TeacherRegistrationRequest,
  fallbackMessage: string,
): Promise<TeacherRegistrationResponse> {
  try {
    const response = await httpClient.post<unknown>({
      url: TEACHER_REGISTRATION_PATH,
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
