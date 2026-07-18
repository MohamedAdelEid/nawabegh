import type {
  SchoolAccountFormValues,
  SchoolAccountNotifications,
  SchoolAccountSession,
  SchoolAccountSettingsData,
  SchoolChangePasswordPayload,
  UpdateSchoolAccountNotificationsPayload,
  UpdateSchoolAccountSettingsPayload,
} from "@/modules/school/domain/types/schoolAccount.types";
import { uploadAdminFile } from "@/modules/admin/infrastructure/api/fileUploadApi";
import {
  extractApiList,
  getApiErrorMessage,
  isApiSuccess,
} from "@/shared/infrastructure/api/apiResponse.utils";
import { httpClient } from "@/shared/infrastructure/http/httpClient";

const BASE = "/api/v1/school/account";
const SETTINGS_URL = `${BASE}/settings`;
const NOTIFICATIONS_URL = `${BASE}/notifications`;
const CHANGE_PASSWORD_URL = `${BASE}/change-password`;
const SESSIONS_URL = `${BASE}/sessions`;
const SCHOOL_LOGO_FOLDER = "schools/logos";
const SCHOOL_COVER_FOLDER = "schools/covers";

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as UnknownRecord)
    : null;
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
    if (value === "true") return true;
    if (value === "false") return false;
  }
  return fallback;
}

function readArray(record: UnknownRecord | null, keys: string[]): unknown[] {
  if (!record) return [];
  for (const key of keys) {
    const value = record[key];
    if (Array.isArray(value)) return value;
  }
  return [];
}

function formatEducationLevels(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (!Array.isArray(value)) return "";
  return value
    .map((item) => {
      if (typeof item === "string") return item.trim();
      const record = asRecord(item);
      return readString(record, ["name", "nameAr", "nameEn", "label", "title"]);
    })
    .filter(Boolean)
    .join(" · ");
}

function mapSummary(
  record: UnknownRecord | null,
  schoolData: SchoolAccountSettingsData["schoolData"],
): SchoolAccountSettingsData["summary"] {
  return {
    schoolId: readString(record, ["schoolId", "id", "userId"]),
    name: readString(record, ["name", "schoolName"], schoolData.name),
    logoUrl: readString(record, ["logoUrl", "profileImageUrl"], schoolData.logoUrl ?? "") || null,
    coverImageUrl:
      readString(record, ["coverImageUrl", "coverUrl"], schoolData.coverImageUrl ?? "") || null,
    profileCompletionPercent: readNumber(record, ["profileCompletionPercent", "completionPercent"], 0) ?? 0,
    city: readString(record, ["city"], schoolData.city),
    countryName: readString(record, ["countryName", "countryNameAr", "country"], schoolData.countryName),
  };
}

function mapSchoolData(record: UnknownRecord | null): SchoolAccountSettingsData["schoolData"] {
  return {
    name: readString(record, ["name", "schoolName"]),
    city: readString(record, ["city"]),
    description: readString(record, ["description", "about"]),
    address: readString(record, ["address"]),
    logoUrl: readString(record, ["logoUrl", "profileImageUrl"]) || null,
    coverImageUrl: readString(record, ["coverImageUrl", "coverUrl"]) || null,
    phoneNumber: readString(record, ["phoneNumber", "phone"]),
    countryId: readNumber(record, ["countryId"]),
    countryName: readString(record, ["countryName", "countryNameAr", "country"]),
    educationLevelsLabel: formatEducationLevels(
      record?.educationLevels ?? record?.educationLevelNames ?? record?.levels,
    ),
  };
}

function mapNotifications(record: UnknownRecord | null): SchoolAccountNotifications {
  return {
    enableAlerts: readBoolean(record, ["enableAlerts", "enableNotifications"], true),
    enableEmailNotifications: readBoolean(record, ["enableEmailNotifications", "emailNotifications"], true),
    enableSmsNotifications: readBoolean(record, ["enableSmsNotifications", "smsNotifications"], false),
    enableSubscriptionRenewalAlerts: readBoolean(
      record,
      ["enableSubscriptionRenewalAlerts", "subscriptionRenewalAlerts"],
      true,
    ),
  };
}

function mapAccount(record: UnknownRecord | null): SchoolAccountSettingsData["account"] {
  return {
    organizationEmail: readString(record, ["organizationEmail", "email"]),
    canChangePassword: readBoolean(record, ["canChangePassword"], true),
    minimumPasswordLength: readNumber(record, ["minimumPasswordLength"], 8) ?? 8,
    passwordRequirements: readString(record, [
      "passwordRequirements",
      "passwordRequirementsAr",
      "passwordHint",
    ]),
  };
}

function mapSecurity(record: UnknownRecord | null): SchoolAccountSettingsData["security"] {
  return {
    canRevokeAllSessions: readBoolean(record, ["canRevokeAllSessions"], true),
    canRemoveSessions: readBoolean(record, ["canRemoveSessions"], true),
  };
}

function detectMobile(label: string, deviceType: string): boolean {
  const haystack = `${label} ${deviceType}`.toLowerCase();
  return (
    haystack.includes("iphone") ||
    haystack.includes("android") ||
    haystack.includes("mobile") ||
    haystack.includes("ipad") ||
    haystack.includes("tablet")
  );
}

function mapSession(item: unknown, index: number): SchoolAccountSession | null {
  const record = asRecord(item);
  if (!record) return null;
  const id = readString(record, ["id", "sessionId"], `session-${index}`);
  if (!id) return null;

  const deviceLabel = readString(record, ["deviceLabel", "device", "deviceName", "userAgent"], "—");
  const browser = readString(record, ["browser", "browserName"]);
  const deviceType = readString(record, ["deviceType", "platform"]);

  return {
    id,
    deviceLabel,
    browser,
    ipAddress: readString(record, ["ipAddress", "ip", "remoteIp"]),
    location: readString(record, ["location", "locationLabel", "cityCountry", "geoLocation"]),
    lastSeenAt: readString(record, ["lastSeenAt", "lastActiveAt", "lastActivityAt"]) || null,
    lastSeenLabel: readString(record, ["lastSeenLabel", "lastSeenText"]),
    isCurrent: readBoolean(record, ["isCurrent", "isCurrentSession", "current"]),
    isMobile: readBoolean(record, ["isMobile"], detectMobile(deviceLabel, deviceType)),
  };
}

function mapAccountSettings(data: unknown): SchoolAccountSettingsData | null {
  const record = asRecord(data);
  if (!record) return null;

  const schoolData = mapSchoolData(asRecord(record.schoolData) ?? record);
  const summary = mapSummary(asRecord(record.summary) ?? record, schoolData);
  const sessionsSource =
    readArray(record, ["sessions", "activeSessions"]) ||
    extractApiList(record.sessions);

  return {
    summary,
    schoolData,
    notifications: mapNotifications(asRecord(record.notifications)),
    account: mapAccount(asRecord(record.account) ?? asRecord(record.accountInfo)),
    security: mapSecurity(asRecord(record.security)),
    sessions: sessionsSource
      .map(mapSession)
      .filter((session): session is SchoolAccountSession => session !== null),
  };
}

export function mapSchoolAccountSettingsToFormValues(
  data: SchoolAccountSettingsData,
): SchoolAccountFormValues {
  const { schoolData, summary } = data;
  return {
    name: schoolData.name || summary.name,
    city: schoolData.city || summary.city,
    description: schoolData.description,
    address: schoolData.address,
    phoneNumber: schoolData.phoneNumber,
    countryId: schoolData.countryId ? String(schoolData.countryId) : "",
    logoUrl: schoolData.logoUrl || summary.logoUrl,
    coverImageUrl: schoolData.coverImageUrl || summary.coverImageUrl,
    logoPreviewUrl: null,
    coverPreviewUrl: null,
    logoFile: null,
    coverFile: null,
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  };
}

export function buildSchoolAccountUpdatePayload(
  values: SchoolAccountFormValues,
): UpdateSchoolAccountSettingsPayload {
  return {
    name: values.name.trim(),
    city: values.city.trim(),
    description: values.description.trim(),
    address: values.address.trim(),
    logoUrl: values.logoUrl,
    coverImageUrl: values.coverImageUrl,
    phoneNumber: values.phoneNumber.trim() || null,
    countryId: values.countryId ? Number(values.countryId) : null,
  };
}

export async function fetchSchoolAccountSettings(): Promise<SchoolAccountSettingsData> {
  const response = await httpClient.get<unknown>({ url: SETTINGS_URL });
  if (!isApiSuccess(response)) {
    throw new Error(getApiErrorMessage(response, "Failed to load school account settings"));
  }

  const mapped = mapAccountSettings(response.data);
  if (!mapped) {
    throw new Error("Invalid school account settings response");
  }
  return mapped;
}

export async function updateSchoolAccountSettings(
  payload: UpdateSchoolAccountSettingsPayload,
): Promise<SchoolAccountSettingsData> {
  const response = await httpClient.put<unknown>({
    url: SETTINGS_URL,
    data: payload,
  });
  if (!isApiSuccess(response)) {
    throw new Error(getApiErrorMessage(response, "Failed to update school account settings"));
  }

  const mapped = mapAccountSettings(response.data);
  if (!mapped) {
    throw new Error("Invalid school account settings response");
  }
  return mapped;
}

export async function updateSchoolAccountNotifications(
  payload: UpdateSchoolAccountNotificationsPayload,
): Promise<SchoolAccountNotifications> {
  const response = await httpClient.put<unknown>({
    url: NOTIFICATIONS_URL,
    data: payload,
  });
  if (!isApiSuccess(response)) {
    throw new Error(getApiErrorMessage(response, "Failed to update notification preferences"));
  }

  const record = asRecord(response.data);
  if (!record) return payload;

  const nested = asRecord(record.notifications);
  if (nested) return mapNotifications(nested);

  if (
    "enableAlerts" in record ||
    "enableEmailNotifications" in record ||
    "enableSmsNotifications" in record ||
    "enableSubscriptionRenewalAlerts" in record
  ) {
    return mapNotifications(record);
  }

  return payload;
}

export async function changeSchoolPassword(payload: SchoolChangePasswordPayload): Promise<void> {
  const response = await httpClient.put<unknown>({
    url: CHANGE_PASSWORD_URL,
    data: payload,
  });
  if (!isApiSuccess(response)) {
    throw new Error(getApiErrorMessage(response, "Failed to change password"));
  }
}

export async function fetchSchoolAccountSessions(): Promise<SchoolAccountSession[]> {
  const response = await httpClient.get<unknown>({ url: SESSIONS_URL });
  if (!isApiSuccess(response)) {
    throw new Error(getApiErrorMessage(response, "Failed to load sessions"));
  }

  return extractApiList(response.data)
    .map(mapSession)
    .filter((session): session is SchoolAccountSession => session !== null);
}

export async function removeSchoolAccountSession(sessionId: string): Promise<void> {
  const response = await httpClient.delete<unknown>({
    url: `${SESSIONS_URL}/${encodeURIComponent(sessionId)}`,
  });
  if (!isApiSuccess(response)) {
    throw new Error(getApiErrorMessage(response, "Failed to remove device session"));
  }
}

export async function revokeAllSchoolAccountSessions(
  keepCurrentSession = true,
): Promise<void> {
  const response = await httpClient.post<unknown>({
    url: `${SESSIONS_URL}/revoke-all`,
    params: { keepCurrentSession },
    data: {},
  });
  if (!isApiSuccess(response)) {
    throw new Error(getApiErrorMessage(response, "Failed to revoke sessions"));
  }
}

export async function uploadSchoolAccountImage(
  file: File,
  kind: "logo" | "cover",
): Promise<{ ok: true; filePath: string } | { ok: false; errorMessage: string }> {
  const folder = kind === "logo" ? SCHOOL_LOGO_FOLDER : SCHOOL_COVER_FOLDER;
  const result = await uploadAdminFile(file, folder);
  if (!result.ok) {
    return { ok: false, errorMessage: result.errorMessage };
  }
  return { ok: true, filePath: result.filePath };
}
