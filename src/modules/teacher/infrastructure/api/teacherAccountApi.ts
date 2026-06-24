import type {
  TeacherAccountSettingsData,
  TeacherAccountSettingsUpdatePayload,
  TeacherChangePasswordPayload,
} from "@/modules/teacher/domain/types/teacherAccount.types";
import { uploadAdminFile } from "@/modules/admin/infrastructure/api/fileUploadApi";
import { getApiErrorMessage, isApiSuccess } from "@/shared/infrastructure/api/apiResponse.utils";
import { httpClient } from "@/shared/infrastructure/http/httpClient";

const SETTINGS_URL = "/api/v1/Teacher/account/settings";
const CHANGE_PASSWORD_URL = "/api/v1/Teacher/account/change-password";
const TEACHER_AVATAR_FOLDER = "teachers";

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord | null {
  return value !== null && typeof value === "object" ? (value as UnknownRecord) : null;
}

function readString(record: UnknownRecord | null, keys: string[], fallback = ""): string {
  if (!record) return fallback;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string") return value;
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
  }
  return fallback;
}

function readNumber(record: UnknownRecord | null, keys: string[], fallback?: number): number | null {
  if (!record) return fallback ?? null;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() !== "" && !Number.isNaN(Number(value))) {
      return Number(value);
    }
  }
  return fallback ?? null;
}

function readBoolean(record: UnknownRecord | null, keys: string[], fallback = false): boolean {
  if (!record) return fallback;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "boolean") return value;
  }
  return fallback;
}

function mapSummary(record: UnknownRecord | null): TeacherAccountSettingsData["summary"] {
  const profileImagePath = readString(record, ["profileImageUrl"], "") || null;
  return {
    userId: readString(record, ["userId", "id"]),
    fullName: readString(record, ["fullName", "name"]),
    profileImageUrl: profileImagePath,
    jobTitle: readString(record, ["jobTitle"]),
    schoolName: readString(record, ["schoolName"]),
    studentCount: readNumber(record, ["studentCount"], 0) ?? 0,
    courseCount: readNumber(record, ["courseCount"], 0) ?? 0,
    profileCompletionPercent: readNumber(record, ["profileCompletionPercent"], 0) ?? 0,
  };
}

function mapPersonalInfo(record: UnknownRecord | null): TeacherAccountSettingsData["personalInfo"] {
  return {
    fullName: readString(record, ["fullName", "name"]),
    schoolName: readString(record, ["schoolName"]),
    jobTitle: readString(record, ["jobTitle"]),
    about: readString(record, ["about"]),
    yearsOfExperience: readNumber(record, ["yearsOfExperience"]),
  };
}

function mapContactInfo(record: UnknownRecord | null): TeacherAccountSettingsData["contactInfo"] {
  return {
    email: readString(record, ["email"]),
    phoneNumber: readString(record, ["phoneNumber"]),
    phoneCountryCode: readNumber(record, ["phoneCountryCode"], 20) ?? 20,
    countryId: readNumber(record, ["countryId"], 0) ?? 0,
    countryNameAr: readString(record, ["countryNameAr"]),
    city: readString(record, ["city"]),
    address: readString(record, ["address"]),
    countryCityLabelAr: readString(record, ["countryCityLabelAr"]),
  };
}

function mapSecurity(record: UnknownRecord | null): TeacherAccountSettingsData["security"] {
  return {
    canChangePassword: readBoolean(record, ["canChangePassword"], true),
    minimumPasswordLength: readNumber(record, ["minimumPasswordLength"], 8) ?? 8,
    passwordRequirementsAr: readString(record, ["passwordRequirementsAr"]),
  };
}

function mapWeeklyPerformance(
  record: UnknownRecord | null,
): TeacherAccountSettingsData["weeklyStudentPerformance"] {
  return {
    activeStudentsThisWeek: readNumber(record, ["activeStudentsThisWeek"], 0) ?? 0,
    totalStudents: readNumber(record, ["totalStudents"], 0) ?? 0,
    activeRatePercent: readNumber(record, ["activeRatePercent"], 0) ?? 0,
    changePercentVsLastWeek: readNumber(record, ["changePercentVsLastWeek"], 0) ?? 0,
    weekLabelAr: readString(record, ["weekLabelAr"]),
  };
}

function mapAccountSettings(data: unknown): TeacherAccountSettingsData | null {
  const record = asRecord(data);
  if (!record) return null;

  return {
    summary: mapSummary(asRecord(record.summary) ?? record),
    personalInfo: mapPersonalInfo(asRecord(record.personalInfo)),
    contactInfo: mapContactInfo(asRecord(record.contactInfo)),
    security: mapSecurity(asRecord(record.security)),
    weeklyStudentPerformance: mapWeeklyPerformance(asRecord(record.weeklyStudentPerformance)),
  };
}

export function mapTeacherAccountSettingsToFormValues(
  data: TeacherAccountSettingsData,
): import("@/modules/teacher/domain/types/teacherAccount.types").TeacherAccountFormValues {
  const { personalInfo, contactInfo, summary } = data;
  return {
    fullName: personalInfo.fullName || summary.fullName,
    jobTitle: personalInfo.jobTitle || summary.jobTitle,
    schoolName: personalInfo.schoolName || summary.schoolName,
    about: personalInfo.about,
    yearsOfExperience:
      personalInfo.yearsOfExperience !== null ? String(personalInfo.yearsOfExperience) : "",
    phoneNumber: contactInfo.phoneNumber,
    phoneCountryCode: String(contactInfo.phoneCountryCode || 20),
    countryId: contactInfo.countryId ? String(contactInfo.countryId) : "",
    city: contactInfo.city,
    address: contactInfo.address,
    profileImageUrl: summary.profileImageUrl,
    avatarPreviewUrl: null,
    avatarFile: null,
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  };
}

export async function fetchTeacherAccountSettings(): Promise<TeacherAccountSettingsData> {
  const response = await httpClient.get<unknown>({ url: SETTINGS_URL });

  if (!isApiSuccess(response)) {
    throw new Error(getApiErrorMessage(response, "Failed to load account settings"));
  }

  const mapped = mapAccountSettings(response.data);
  if (!mapped) {
    throw new Error("Invalid account settings response");
  }

  return mapped;
}

export async function updateTeacherAccountSettings(
  payload: TeacherAccountSettingsUpdatePayload,
): Promise<TeacherAccountSettingsData> {
  const response = await httpClient.put<unknown>({
    url: SETTINGS_URL,
    data: payload,
  });

  if (!isApiSuccess(response)) {
    throw new Error(getApiErrorMessage(response, "Failed to update account settings"));
  }

  const mapped = mapAccountSettings(response.data);
  if (!mapped) {
    throw new Error("Invalid account settings response");
  }

  return mapped;
}

export async function changeTeacherPassword(payload: TeacherChangePasswordPayload): Promise<void> {
  const response = await httpClient.put<unknown>({
    url: CHANGE_PASSWORD_URL,
    data: payload,
  });

  if (!isApiSuccess(response)) {
    throw new Error(getApiErrorMessage(response, "Failed to change password"));
  }
}

export async function uploadTeacherAvatar(file: File): Promise<{ ok: true; filePath: string } | { ok: false; errorMessage: string }> {
  const result = await uploadAdminFile(file, TEACHER_AVATAR_FOLDER);
  if (!result.ok) {
    return { ok: false, errorMessage: result.errorMessage };
  }
  return { ok: true, filePath: result.filePath };
}
