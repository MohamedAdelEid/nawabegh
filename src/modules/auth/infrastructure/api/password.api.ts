import { httpClient } from "@/shared/infrastructure/http/httpClient";
import { isApiSuccess } from "@/shared/infrastructure/api/apiResponse.utils";
import {
  extractRegistrationApiError,
  getRegistrationApiErrorMessage,
} from "@/modules/auth/infrastructure/api/student-registration.api";

const FORGOT_PASSWORD_PATH = "/api/v1/Auth/forgot-password";
const RESET_PASSWORD_PATH = "/api/v1/Auth/reset-password";

export type ForgotPasswordRequest = {
  email: string;
};

export type ResetPasswordRequest = {
  email: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
};

export async function requestForgotPassword(
  payload: ForgotPasswordRequest,
  fallbackMessage: string,
): Promise<void> {
  try {
    const response = await httpClient.post<unknown>({
      url: FORGOT_PASSWORD_PATH,
      data: payload,
    });

    if (!isApiSuccess(response)) {
      throw new Error(getRegistrationApiErrorMessage(response, fallbackMessage));
    }
  } catch (error) {
    throw new Error(extractRegistrationApiError(error, fallbackMessage));
  }
}

export async function resetPasswordWithOtp(
  payload: ResetPasswordRequest,
  fallbackMessage: string,
): Promise<void> {
  try {
    const response = await httpClient.post<unknown>({
      url: RESET_PASSWORD_PATH,
      data: payload,
    });

    if (!isApiSuccess(response)) {
      throw new Error(getRegistrationApiErrorMessage(response, fallbackMessage));
    }
  } catch (error) {
    throw new Error(extractRegistrationApiError(error, fallbackMessage));
  }
}
