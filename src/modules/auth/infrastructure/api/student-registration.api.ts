import axios from "axios";
import { httpClient } from "@/shared/infrastructure/http/httpClient";
import {
  ApiRequestError,
  getApiErrorMessage,
  isApiSuccess,
} from "@/shared/infrastructure/api/apiResponse.utils";
import type { BackendApiResponse } from "@/shared/domain/types/api.types";
import type {
  ConfirmEmailOtpRequest,
  ConfirmEmailOtpResponse,
  ResendEmailOtpRequest,
  StudentRegistrationRequest,
  StudentRegistrationResponse,
} from "@/modules/auth/domain/types/student-registration.types";

const STUDENT_REGISTRATION_PATH = "/api/v1/Auth/student-registration";
const RESEND_EMAIL_OTP_PATH = "/api/v1/Auth/resend-email-otp";
const CONFIRM_EMAIL_OTP_PATH = "/api/v1/Auth/confirm-email-otp";

export function getRegistrationApiErrorMessage(
  response: unknown,
  fallback: string,
): string {
  return getApiErrorMessage(response, fallback);
}

export function extractRegistrationApiError(error: unknown, fallback: string): string {
  if (error instanceof ApiRequestError && error.message.trim()) {
    return error.message.trim();
  }

  if (axios.isAxiosError(error)) {
    const body = error.response?.data;
    if (body != null && typeof body === "object") {
      return getApiErrorMessage(body, fallback);
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return getApiErrorMessage({ message: error.message }, error.message);
  }

  return fallback;
}

export function assertRegistrationSuccess(
  response: StudentRegistrationResponse,
  fallback: string,
): void {
  if (!isApiSuccess(response)) {
    throw new Error(getRegistrationApiErrorMessage(response, fallback));
  }
}

function assertApiSuccess<T>(
  response: BackendApiResponse<T>,
  fallback: string,
): BackendApiResponse<T> {
  if (!isApiSuccess(response)) {
    throw new Error(getRegistrationApiErrorMessage(response, fallback));
  }
  return response;
}

export async function submitStudentRegistration(
  payload: StudentRegistrationRequest,
  fallbackMessage: string,
): Promise<StudentRegistrationResponse> {
  try {
    const response = await httpClient.post<unknown>({
      url: STUDENT_REGISTRATION_PATH,
      data: payload,
    });
    return assertApiSuccess(response, fallbackMessage);
  } catch (error) {
    throw new Error(extractRegistrationApiError(error, fallbackMessage));
  }
}

export async function resendEmailOtp(
  payload: ResendEmailOtpRequest,
  fallbackMessage: string,
): Promise<StudentRegistrationResponse> {
  try {
    const response = await httpClient.post<unknown>({
      url: RESEND_EMAIL_OTP_PATH,
      data: payload,
    });
    return assertApiSuccess(response, fallbackMessage);
  } catch (error) {
    throw new Error(extractRegistrationApiError(error, fallbackMessage));
  }
}

export async function confirmEmailOtp(
  payload: ConfirmEmailOtpRequest,
  fallbackMessage: string,
): Promise<ConfirmEmailOtpResponse> {
  try {
    const response = await httpClient.post<unknown>({
      url: CONFIRM_EMAIL_OTP_PATH,
      data: payload,
    });
    return assertApiSuccess(response, fallbackMessage) as ConfirmEmailOtpResponse;
  } catch (error) {
    throw new Error(extractRegistrationApiError(error, fallbackMessage));
  }
}
