import type { LoginApiUser } from "@/modules/auth/domain/types/login.types";
import type { BackendApiResponse } from "@/shared/domain/types/api.types";

/** TODO: Replace with real academic term from business rules when available. */
export const REGISTRATION_ACADEMIC_TERM_PLACEHOLDER = 1;

export type StudentRegistrationRequest = {
  countryId: number;
  educationLevelId: number;
  gradeId: number;
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  phoneCountryCode: number;
  address: string;
  whatsAppNumber: string;
  whatsAppCountryCode: number;
  alternativePhone: string;
  parentPhone: string;
  username: string;
  academicTerm: number;
  schoolId: string;
};

export type StudentRegistrationResponse = BackendApiResponse<unknown>;

export type ResendEmailOtpRequest = {
  email: string;
};

export type ConfirmEmailOtpRequest = {
  email: string;
  otp: string;
};

export type ConfirmEmailOtpData = {
  user?: LoginApiUser;
  token?: string;
  refreshToken?: string | null;
  expiresAt?: string;
};

export type ConfirmEmailOtpResponse = BackendApiResponse<ConfirmEmailOtpData> & {
  isSuccess?: boolean;
  status?: string | number;
};

export type VerificationTarget = "email" | "phone";

export const OTP_LENGTH_BY_VERIFICATION_TARGET = {
  email: 6,
  phone: 4,
} as const satisfies Record<VerificationTarget, number>;

export function getOtpLengthForVerificationTarget(target: VerificationTarget): number {
  return OTP_LENGTH_BY_VERIFICATION_TARGET[target];
}
