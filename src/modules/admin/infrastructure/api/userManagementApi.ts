import type {
  AddUserCountryId,
  AddUserGradeLevelId,
  AddUserPermissionId,
  AddUserStageId,
  AddUserSubjectId,
  ParentAccountFormValues,
  StudentAccountFormValues,
  TeacherAccountFormValues,
} from "@/modules/admin/domain/types/addUser.types";
import { UserManagementRoleApiValue } from "@/modules/admin/domain/entities/userManagementRole.enum";
import type {
  UserManagementGradeId,
  UserManagementRoleId,
  UserManagementSchoolId,
  UserManagementStatusId,
  UserManagementSubscriptionId,
} from "@/modules/admin/domain/data/userManagementDashboardData";
import type { BackendApiResponse, BackendStatus } from "@/shared/domain/types/api.types";
import { FILE_UPLOAD_URL, resolveFileUrl } from "@/shared/infrastructure/files/fileUrl";
import { unwrapUploadRecord } from "@/modules/admin/infrastructure/api/fileUploadApi";
import { httpClient } from "@/shared/infrastructure/http/httpClient";
import { parseXPaginationHeader, type XPaginationMeta } from "@/shared/infrastructure/http/xPagination";

export const USER_MANAGEMENT_PLACEHOLDER_IDS = {
  countries: {
    egypt: 1,
    saudi: 2,
  } satisfies Record<AddUserCountryId, number>,
  educationLevels: {
    primary: 101,
    middle: 102,
    secondary: 103,
  } satisfies Record<AddUserStageId, number>,
  grades: {
    year1: 201,
    year2: 202,
    year3: 203,
  } as const,
  assignedGrades: {
    first: 301,
    second: 302,
    third: 303,
    fourth: 304,
    fifth: 305,
    sixth: 306,
  } satisfies Record<AddUserGradeLevelId, number>,
  schools: {
    alnour: "11111111-1111-1111-1111-111111111111",
    riyadhPrivate: "22222222-2222-2222-2222-222222222222",
    alfajr: "33333333-3333-3333-3333-333333333333",
    fallback: "00000000-0000-0000-0000-000000000000",
  } as const,
} as const;

export type UserManagementListParams = {
  roleId?: UserManagementRoleId;
  schoolId?: UserManagementSchoolId;
  gradeId?: UserManagementGradeId;
  isActive?: boolean;
  keyword?: string;
  pageNumber: number;
  pageSize: number;
};

export type UserManagementStats = {
  totalStudents: number;
  totalTeachers: number;
  totalParents: number;
  totalActiveUsers: number;
  totalInactiveUsers: number;
};

export type UserManagementListRow = {
  id: string;
  profileImageUrl: string | null;
  fullName: string;
  phoneNumber: string;
  role: string;
  schoolName: string;
  gradeName: string;
  isActive: boolean;
  lastActivity: string | null;
};

export type UserManagementListPage = {
  rows: UserManagementListRow[];
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
};

export type UserManagementDropdownOption<TId extends string | number = string> = {
  id: TId;
  name: string;
};

export type UserManagementToggleStatusData = {
  userId: string;
  isActive: boolean;
};

export type UserManagementApiResult<T> = {
  status: BackendStatus | string;
  message?: string;
  errorMessage?: string;
  validationErrors?: UserManagementValidationErrors;
  data: T | null;
};

export type UserManagementValidationErrorItem = {
  propertyName: string;
  errorMessage: string;
};

export type UserManagementValidationErrors =
  | Record<string, string[]>
  | UserManagementValidationErrorItem[]
  | null;

export type UploadedFileData = {
  filePath: string;
  fileUrl: string;
  originalFileName: string;
  storedFileName: string;
  fileSize: number;
  contentType: string;
  folder: string;
  message: string;
};

export type UserManagementParentSearchResult = {
  parentUserId: string;
  fullName: string;
  phoneNumber: string;
  profileImageUrl: string | null;
};

export type UserManagementParentStudentOption = {
  studentUserId: string;
  fullName: string;
  phoneNumber: string;
  profileImageUrl: string | null;
  gradeName: string;
};

export type StudentUserDetail = {
  userId: string;
  fullName: string;
  profileImagePath: string | null;
  profileImageUrl: string | null;
  email: string;
  phoneNumber: string;
  phoneCountryCode: number | null;
  isActive: boolean;
  countryId: number | null;
  countryName: string;
  educationLevelId: number | null;
  educationLevelName: string;
  gradeId: number | null;
  gradeName: string;
  schoolId: string | null;
  schoolName: string | null;
  address: string;
  whatsAppNumber: string;
  whatsAppCountryCode: number | null;
  alternativePhone: string;
  parentPhone: string;
  username: string;
  points: number | null;
  maxPointsEverReached: number | null;
  achievementBadgeCount: number | null;
  earnedAchievementBadges: Array<{
    badgeId: string;
    name: string;
    description: string;
    iconUrl: string | null;
    requiredPoints: number | null;
    earnedAt: string | null;
  }>;
  onboardingQuizCompleted: boolean;
  linkedParent: {
    parentUserId: string;
    fullName: string;
    phoneNumber: string;
    profileImageUrl: string | null;
  } | null;
  createdAt: string | null;
};

export type TeacherUserDetail = {
  userId: string;
  fullName: string;
  profileImagePath: string | null;
  profileImageUrl: string | null;
  email: string;
  phoneNumber: string;
  phoneCountryCode: number | null;
  isActive: boolean;
  countryId: number | null;
  countryName: string;
  educationLevelId: number | null;
  jobTitle: string;
  schoolId: string | null;
  schoolName: string;
  address: string;
  about: string;
  yearsOfExperience: number | null;
  city: string;
  rating: number | null;
  certificatesJson: string;
  courses: string[];
  assignedGrades: Array<{
    gradeId: number;
    gradeName: string;
  }>;
  permissions: {
    canManageLearningPaths: boolean;
    canCreateLearningPaths: boolean;
    canStartLiveSessions: boolean;
    canUploadFiles: boolean;
    canAddExams: boolean;
    canManageConversations: boolean;
  };
  createdAt: string | null;
};

export type ParentUserDetail = {
  userId: string;
  fullName: string;
  profileImagePath: string | null;
  profileImageUrl: string | null;
  email: string;
  phoneNumber: string;
  phoneCountryCode: number | null;
  isActive: boolean;
  countryId: number | null;
  countryName: string;
  address: string;
  children: Array<{
    studentUserId: string;
    fullName: string;
    profileImageUrl: string | null;
    gradeName: string;
    username: string;
  }>;
  createdAt: string | null;
};

type UnknownRecord = Record<string, unknown>;
const FILE_UPLOAD_FOLDER = "users";

function asRecord(value: unknown): UnknownRecord | null {
  return value !== null && typeof value === "object" ? (value as UnknownRecord) : null;
}

function readString(record: UnknownRecord | null, keys: string[], fallback = ""): string {
  if (!record) return fallback;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string") return value;
  }
  return fallback;
}

function readNumber(record: UnknownRecord | null, keys: string[]): number | null {
  if (!record) return null;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() !== "" && !Number.isNaN(Number(value))) {
      return Number(value);
    }
  }
  return null;
}

function readBoolean(record: UnknownRecord | null, keys: string[], fallback = false): boolean {
  if (!record) return fallback;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "boolean") return value;
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

function mapHttpStatus(statusCode: number | null): BackendStatus | "Error" {
  switch (statusCode) {
    case 400:
      return "BadRequest";
    case 401:
      return "Unauthorized";
    case 403:
      return "Forbidden";
    case 404:
      return "NotFound";
    case 409:
      return "Conflict";
    default:
      return "Error";
  }
}

function mapValidationErrors(
  rawValidationErrors: unknown,
): UserManagementValidationErrors {
  if (!rawValidationErrors) return null;

  if (Array.isArray(rawValidationErrors)) {
    const rows = rawValidationErrors
      .map((item) => {
        const record = asRecord(item);
        if (!record) return null;
        const propertyName = readString(record, ["propertyName", "PropertyName"]);
        const errorMessage = readString(record, ["errorMessage", "ErrorMessage"]);
        if (!errorMessage) return null;

        return {
          propertyName: propertyName || "general",
          errorMessage,
        } satisfies UserManagementValidationErrorItem;
      })
      .filter((item): item is UserManagementValidationErrorItem => item !== null);

    return rows.length > 0 ? rows : null;
  }

  const record = asRecord(rawValidationErrors);
  if (!record) return null;

  const mapped: Record<string, string[]> = {};
  for (const [key, value] of Object.entries(record)) {
    if (!Array.isArray(value)) continue;

    const messages = value.filter(
      (item): item is string => typeof item === "string" && item.trim().length > 0,
    );
    if (messages.length > 0) {
      mapped[key] = messages;
    }
  }

  return Object.keys(mapped).length > 0 ? mapped : null;
}

function getFirstValidationErrorMessage(
  validationErrors: UserManagementValidationErrors,
): string | undefined {
  if (!validationErrors) return undefined;

  if (Array.isArray(validationErrors)) {
    return validationErrors.find((item) => item.errorMessage.trim().length > 0)?.errorMessage;
  }

  return Object.values(validationErrors)
    .flat()
    .find((message) => typeof message === "string" && message.trim().length > 0);
}

const mapImageUrl = (pathOrUrl: string): string | null => resolveFileUrl(pathOrUrl);

function mapUploadedFileData(data: unknown): UploadedFileData | null {
  const record = unwrapUploadRecord(data);
  if (!record) return null;

  const filePath = readString(record, ["filePath", "fileUrl", "url", "path"]);
  const explicitSuccess = readBoolean(record, ["success"], false);
  const hasPath = Boolean(filePath.trim());

  if (!hasPath && !explicitSuccess) return null;
  if (!hasPath) return null;

  return {
    filePath: filePath.trim(),
    fileUrl: readString(record, ["fileUrl"]),
    originalFileName: readString(record, ["originalFileName"]),
    storedFileName: readString(record, ["storedFileName"]),
    fileSize: readNumber(record, ["fileSize"]) ?? 0,
    contentType: readString(record, ["contentType"]),
    folder: readString(record, ["folder"]),
    message: readString(record, ["message"]),
  };
}

function buildErrorResult<T>(
  error: unknown,
  fallbackMessage: string,
): UserManagementApiResult<T> {
  const axiosError = asRecord(error);
  const response = asRecord(axiosError?.response);
  const responseData = asRecord(response?.data);
  const dataEnvelope = responseData as BackendApiResponse<unknown> | null;
  const httpStatusCode = readNumber(response, ["status"]);
  const problemDetail = responseData;

  const detailMessage =
    readString(problemDetail, ["detail", "title"], "") ||
    dataEnvelope?.error?.message ||
    (typeof axiosError?.message === "string" ? axiosError.message : fallbackMessage);

  return {
    status:
      (typeof dataEnvelope?.status === "string" ? dataEnvelope.status : undefined) ??
      mapHttpStatus(httpStatusCode),
    message: typeof dataEnvelope?.message === "string" ? dataEnvelope.message : undefined,
    errorMessage: detailMessage,
    validationErrors: dataEnvelope?.error?.validationErrors ?? null,
    data: null,
  };
}

function mapRoleIdToApiValue(roleId?: UserManagementRoleId): number | undefined {
  switch (roleId) {
    case "student":
      return UserManagementRoleApiValue.Student;
    case "teacher":
      return UserManagementRoleApiValue.Teacher;
    case "parent":
      return UserManagementRoleApiValue.Parent;
    case "all":
    case undefined:
      return undefined;
    default:
      return undefined;
  }
}

function mapSchoolIdToApiValue(schoolId?: UserManagementSchoolId): string | undefined {
  if (!schoolId || schoolId === "all") return undefined;

  switch (schoolId) {
    case "alnour":
      return USER_MANAGEMENT_PLACEHOLDER_IDS.schools.alnour;
    case "riyadhPrivate":
      return USER_MANAGEMENT_PLACEHOLDER_IDS.schools.riyadhPrivate;
    case "alfajr":
      return USER_MANAGEMENT_PLACEHOLDER_IDS.schools.alfajr;
    default:
      return schoolId;
  }
}

function mapGradeIdToApiValue(gradeId?: UserManagementGradeId): number | undefined {
  if (!gradeId || gradeId === "all" || gradeId === "allGrades") return undefined;
  if (/^\d+$/.test(gradeId)) return Number(gradeId);

  switch (gradeId) {
    case "grade4":
      return 4;
    case "grade5":
      return 5;
    default:
      return undefined;
  }
}

export function normalizeUserManagementRole(role: string): string {
  const normalized = role.trim().toLowerCase();
  if (["student", "طالب"].includes(normalized)) return "student";
  if (["teacher", "معلم"].includes(normalized)) return "teacher";
  if (["parent", "ولي أمر", "parents"].includes(normalized)) return "parent";
  if (["admin", "مشرف"].includes(normalized)) return "admin";
  if (["school", "المدرسة"].includes(normalized)) return "school";
  return normalized || "student";
}

export function mapApiStatusToUiStatusId(isActive: boolean): UserManagementStatusId {
  return isActive ? "active" : "inactive";
}

export function mapApiRoleToSubscriptionId(
  _role: string,
): Exclude<UserManagementSubscriptionId, "all"> {
  return "active";
}

function extractListRows(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  const record = asRecord(data);
  return readArray(record, ["items", "records", "results", "data", "list"]);
}

function extractPaginationMeta(
  data: unknown,
  params: UserManagementListParams,
  rowCount: number,
  headerMeta?: XPaginationMeta | null,
) {
  if (headerMeta) {
    return {
      totalItems: headerMeta.totalCount,
      pageSize: headerMeta.pageSize,
      currentPage: headerMeta.currentPage,
      totalPages: headerMeta.totalPages,
      hasPrevious: headerMeta.hasPrevious,
      hasNext: headerMeta.hasNext,
    };
  }

  const record = asRecord(data);
  const totalItems =
    readNumber(record, ["totalCount", "total", "count", "totalItems"]) ?? rowCount;
  const pageSize =
    readNumber(record, ["pageSize", "limit", "size"]) ?? params.pageSize;
  const currentPage =
    readNumber(record, ["pageNumber", "page", "currentPage"]) ?? params.pageNumber;
  const totalPages =
    readNumber(record, ["totalPages", "pagesCount"]) ??
    Math.max(1, Math.ceil(totalItems / Math.max(pageSize, 1)));

  return {
    totalItems,
    pageSize,
    currentPage,
    totalPages,
    hasPrevious: currentPage > 1,
    hasNext: currentPage < totalPages,
  };
}

function mapListRow(item: unknown): UserManagementListRow {
  const record = asRecord(item);
  return {
    id: readString(record, ["id", "userId"]),
    profileImageUrl: mapImageUrl(readString(record, ["profileImageUrl"], "")),
    fullName: readString(record, ["fullName", "name"], "—"),
    phoneNumber: readString(record, ["phoneNumber"], "—"),
    role: readString(record, ["role"], "student"),
    schoolName: readString(record, ["schoolName"], "—"),
    gradeName: readString(record, ["gradeName"], ""),
    isActive: readBoolean(record, ["isActive"], false),
    lastActivity: readString(record, ["lastActivity"], "") || null,
  };
}

export async function getUserManagementUsers(
  params: UserManagementListParams,
): Promise<UserManagementApiResult<UserManagementListPage>> {
  try {
    const response = await httpClient.get<unknown>({
      url: "/api/v1/UserManagement/page",
      params: {
        role: mapRoleIdToApiValue(params.roleId),
        schoolId: mapSchoolIdToApiValue(params.schoolId),
        gradeId: mapGradeIdToApiValue(params.gradeId),
        isActive: params.isActive,
        keyword: params.keyword ?? "",
        pageNumber: params.pageNumber,
        pageSize: params.pageSize,
      },
    });

    const rows = extractListRows(response.data).map(mapListRow);
    const headerMeta = parseXPaginationHeader(response.headers);
    const meta = extractPaginationMeta(response.data, params, rows.length, headerMeta);

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      validationErrors: response.error?.validationErrors ?? null,
      data: {
        rows,
        ...meta,
      },
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to load users");
  }
}

export async function getUserManagementStats(): Promise<UserManagementApiResult<UserManagementStats>> {
  try {
    const response = await httpClient.get<unknown>({
      url: "/api/v1/UserManagement/stats",
    });
    const record = asRecord(response.data);

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      validationErrors: response.error?.validationErrors ?? null,
      data: {
        totalStudents: readNumber(record, ["totalStudents"]) ?? 0,
        totalTeachers: readNumber(record, ["totalTeachers"]) ?? 0,
        totalParents: readNumber(record, ["totalParents"]) ?? 0,
        totalActiveUsers: readNumber(record, ["totalActiveUsers"]) ?? 0,
        totalInactiveUsers: readNumber(record, ["totalInactiveUsers"]) ?? 0,
      },
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to load user statistics");
  }
}

export async function toggleUserManagementStatus(
  userId: string,
): Promise<UserManagementApiResult<UserManagementToggleStatusData>> {
  try {
    const response = await httpClient.patch<unknown>({
      url: "/api/v1/UserManagement/toggle-status",
      data: { userId },
    });
    console.log(response);
    const record = asRecord(response.data);
    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      validationErrors: response.error?.validationErrors ?? null,
      data: record
        ? {
            userId: readString(record, ["userId"], userId),
            isActive: readBoolean(record, ["isActive"], false),
          }
        : null,
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to update user status");
  }
}

export async function deleteUserManagementUser(
  userId: string,
): Promise<UserManagementApiResult<Record<string, never>>> {
  try {
    const response = await httpClient.delete<unknown>({
      url: `/api/v1/UserManagement/${userId}/delete`,
    });
    const record = asRecord(response.data);

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      validationErrors: response.error?.validationErrors ?? null,
      data: record ? ({} as Record<string, never>) : null,
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to delete user");
  }
}

function mapDropdownOptions<TId extends string | number>(
  data: unknown,
): UserManagementDropdownOption<TId>[] {
  const rows = extractListRows(data);

  return rows
    .map((item) => {
      const record = asRecord(item);
      if (!record) return null;
      const numericId = readNumber(record, ["id"]);
      const stringId = readString(record, ["id"]);
      const resolvedId =
        numericId !== null ? numericId : stringId !== "" ? stringId : null;
      const name = readString(record, ["name", "title"], "");

      if (resolvedId === null || !name) return null;

      return {
        id: resolvedId as TId,
        name,
      };
    })
    .filter((item): item is UserManagementDropdownOption<TId> => item !== null);
}

export type UserManagementCountryDropdownItem =
  UserManagementDropdownOption<number> & {
    flagIcon?: string;
  };

function mapCountryDropdownRows(data: unknown): UserManagementCountryDropdownItem[] {
  const rows = extractListRows(data);

  return rows
    .map((item) => {
      const record = asRecord(item);
      if (!record) return null;
      const numericId = readNumber(record, ["id"]);
      const stringId = readString(record, ["id"]);
      const resolvedId =
        numericId !== null ? numericId : stringId !== "" ? stringId : null;
      const name = readString(record, ["name", "title"], "");
      const flagIcon = readString(record, ["flagIcon"], "") || undefined;

      if (resolvedId === null || !name) return null;

      const id =
        typeof resolvedId === "number" ? resolvedId : Number(resolvedId);
      if (Number.isNaN(id)) return null;

      return {
        id,
        name,
        ...(flagIcon ? { flagIcon } : {}),
      };
    })
    .filter((item): item is UserManagementCountryDropdownItem => item !== null);
}

export async function getCountriesDropdown(
  keyword = " ",
): Promise<UserManagementApiResult<UserManagementCountryDropdownItem[]>> {
  try {
    const response = await httpClient.get<unknown>({
      url: "/api/v1/Countries/dropdown",
      params: {
        keyword,
        pageNumber: 1,
        pageSize: 200,
      },
    });

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      validationErrors: response.error?.validationErrors ?? null,
      data: mapCountryDropdownRows(response.data),
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to load countries");
  }
}

export async function getEducationLevelsDropdown(
  countryId: number,
  keyword = " ",
): Promise<UserManagementApiResult<UserManagementDropdownOption<number>[]>> {
  try {
    const response = await httpClient.get<unknown>({
      url: "/api/v1/EducationLevels/dropdown",
      params: {
        countryId,
        keyword,
        pageNumber: 1,
        pageSize: 200,
      },
    });

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      validationErrors: response.error?.validationErrors ?? null,
      data: mapDropdownOptions<number>(response.data),
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to load education levels");
  }
}

export async function getUserManagementSchoolsDropdown(
  keyword = "",
): Promise<UserManagementApiResult<UserManagementDropdownOption<string>[]>> {
  try {
    const response = await httpClient.get<unknown>({
      url: "/api/v1/School/dropdown",
      params: {
        keyword,
        pageNumber: 1,
        pageSize: 200,
      },
    });

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      validationErrors: response.error?.validationErrors ?? null,
      data: mapDropdownOptions<string>(response.data),
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to load schools");
  }
}

export async function getUserManagementGradesDropdown(
  educationLevelId: number,
  keyword = " ",
): Promise<UserManagementApiResult<UserManagementDropdownOption<number>[]>> {
  try {
    const response = await httpClient.get<unknown>({
      url: "/api/v1/Grades/dropdown",
      params: {
        educationLevelId,
        keyword,
        pageNumber: 1,
        pageSize: 200,
      },
    });

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      validationErrors: response.error?.validationErrors ?? null,
      data: mapDropdownOptions<number>(response.data),
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to load grades");
  }
}

function unwrapDetailRecord(data: unknown): UnknownRecord | null {
  const record = asRecord(data);
  if (!record) return null;
  const nested = asRecord(record.data);
  return nested ?? record;
}

function readProfileImageFields(record: UnknownRecord | null) {
  const profileImagePath = readString(record, ["profileImageUrl"], "") || null;

  return {
    profileImagePath,
    profileImageUrl: mapImageUrl(profileImagePath ?? ""),
  };
}

function mapStudentDetail(data: unknown): StudentUserDetail {
  const record = unwrapDetailRecord(data);
  const linkedParentRecord = asRecord(record?.linkedParent);
  const profileImage = readProfileImageFields(record);

  return {
    userId: readString(record, ["userId", "id"]),
    fullName: readString(record, ["fullName"], "—"),
    ...profileImage,
    email: readString(record, ["email"]),
    phoneNumber: readString(record, ["phoneNumber"]),
    phoneCountryCode: readNumber(record, ["phoneCountryCode"]),
    isActive: readBoolean(record, ["isActive"], false),
    countryId: readNumber(record, ["countryId"]),
    countryName: readString(record, ["countryName"]),
    educationLevelId: readNumber(record, ["educationLevelId"]),
    educationLevelName: readString(record, ["educationLevelName"]),
    gradeId: readNumber(record, ["gradeId"]),
    gradeName: readString(record, ["gradeName"]),
    schoolId: readString(record, ["schoolId"], "") || null,
    schoolName: readString(record, ["schoolName"], "") || null,
    address: readString(record, ["address"]),
    whatsAppNumber: readString(record, ["whatsAppNumber"]),
    whatsAppCountryCode: readNumber(record, ["whatsAppCountryCode"]),
    alternativePhone: readString(record, ["alternativePhone"]),
    parentPhone: readString(record, ["parentPhone"]),
    username: readString(record, ["username"]),
    points: readNumber(record, ["points"]),
    maxPointsEverReached: readNumber(record, ["maxPointsEverReached"]),
    achievementBadgeCount: readNumber(record, ["achievementBadgeCount"]),
    earnedAchievementBadges: readArray(record, ["earnedAchievementBadges"]).map((item) => {
      const badgeRecord = asRecord(item);
      return {
        badgeId: readString(badgeRecord, ["badgeId"]),
        name: readString(badgeRecord, ["name"]),
        description: readString(badgeRecord, ["description"]),
        iconUrl: mapImageUrl(readString(badgeRecord, ["iconUrl"], "")),
        requiredPoints: readNumber(badgeRecord, ["requiredPoints"]),
        earnedAt: readString(badgeRecord, ["earnedAt"], "") || null,
      };
    }),
    onboardingQuizCompleted: readBoolean(record, ["onboardingQuizCompleted"], false),
    linkedParent: linkedParentRecord
      ? {
          parentUserId: readString(linkedParentRecord, ["parentUserId"]),
          fullName: readString(linkedParentRecord, ["fullName"]),
          phoneNumber: readString(linkedParentRecord, ["phoneNumber"]),
          profileImageUrl: mapImageUrl(readString(linkedParentRecord, ["profileImageUrl"], "")),
        }
      : null,
    createdAt: readString(record, ["createdAt"], "") || null,
  };
}

function mapTeacherDetail(data: unknown): TeacherUserDetail {
  const record = unwrapDetailRecord(data);
  const permissions = asRecord(record?.permissions);
  const profileImage = readProfileImageFields(record);

  return {
    userId: readString(record, ["userId", "id"]),
    fullName: readString(record, ["fullName"], "—"),
    ...profileImage,
    email: readString(record, ["email"]),
    phoneNumber: readString(record, ["phoneNumber"]),
    phoneCountryCode: readNumber(record, ["phoneCountryCode"]),
    isActive: readBoolean(record, ["isActive"], false),
    countryId: readNumber(record, ["countryId"]),
    countryName: readString(record, ["countryName"]),
    educationLevelId: readNumber(record, ["educationLevelId"]),
    jobTitle: readString(record, ["jobTitle"]),
    schoolId: readString(record, ["schoolId"], "") || null,
    schoolName: readString(record, ["schoolName"]),
    address: readString(record, ["address"]),
    about: readString(record, ["about"]),
    yearsOfExperience: readNumber(record, ["yearsOfExperience"]),
    city: readString(record, ["city"]),
    rating: readNumber(record, ["rating"]),
    certificatesJson: readString(record, ["certificatesJson"]),
    courses: readArray(record, ["courses", "subjects"]).map((item) => String(item)),
    assignedGrades: readArray(record, ["assignedGrades"]).map((item) => {
      if (typeof item === "string") {
        return {
          gradeId: 0,
          gradeName: item,
        };
      }

      const gradeRecord = asRecord(item);
      return {
        gradeId: readNumber(gradeRecord, ["gradeId"]) ?? 0,
        gradeName: readString(gradeRecord, ["gradeName"]),
      };
    }),
    permissions: {
      canManageLearningPaths: readBoolean(permissions, ["canManageLearningPaths"], false),
      canCreateLearningPaths: readBoolean(permissions, ["canCreateLearningPaths"], false),
      canStartLiveSessions: readBoolean(permissions, ["canStartLiveSessions"], false),
      canUploadFiles: readBoolean(permissions, ["canUploadFiles"], false),
      canAddExams: readBoolean(permissions, ["canAddExams"], false),
      canManageConversations: readBoolean(permissions, ["canManageConversations"], false),
    },
    createdAt: readString(record, ["createdAt"], "") || null,
  };
}

function mapParentDetail(data: unknown): ParentUserDetail {
  const record = unwrapDetailRecord(data);
  const profileImage = readProfileImageFields(record);

  return {
    userId: readString(record, ["userId", "id"]),
    fullName: readString(record, ["fullName"], "—"),
    ...profileImage,
    email: readString(record, ["email"]),
    phoneNumber: readString(record, ["phoneNumber"]),
    phoneCountryCode: readNumber(record, ["phoneCountryCode"]),
    isActive: readBoolean(record, ["isActive"], false),
    countryId: readNumber(record, ["countryId"]),
    countryName: readString(record, ["countryName"]),
    address: readString(record, ["address"]),
    children: readArray(record, ["children"]).map((item) => {
      const childRecord = asRecord(item);
      return {
        studentUserId: readString(childRecord, ["studentUserId"]),
        fullName: readString(childRecord, ["fullName"]),
        profileImageUrl: mapImageUrl(readString(childRecord, ["profileImageUrl"], "")),
        gradeName: readString(childRecord, ["gradeName"]),
        username: readString(childRecord, ["username"]),
      };
    }),
    createdAt: readString(record, ["createdAt"], "") || null,
  };
}

function mapParentStudentOption(item: unknown): UserManagementParentStudentOption | null {
  const record = asRecord(item);
  if (!record) return null;

  const studentUserId = readString(record, ["studentUserId", "userId", "id"]);
  if (!studentUserId) return null;

  return {
    studentUserId,
    fullName: readString(record, ["fullName", "name"], "—"),
    phoneNumber: readString(record, ["phoneNumber"], ""),
    profileImageUrl: mapImageUrl(readString(record, ["profileImageUrl"], "")),
    gradeName: readString(record, ["gradeName"], ""),
  };
}

async function getUserDetail<T>(
  url: string,
  mapper: (data: unknown) => T,
  fallbackMessage: string,
): Promise<UserManagementApiResult<T>> {
  try {
    const response = await httpClient.get<unknown>({ url });
    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      validationErrors: response.error?.validationErrors ?? null,
      data: response.data ? mapper(response.data) : null,
    };
  } catch (error) {
    return buildErrorResult(error, fallbackMessage);
  }
}

export async function getStudentUserDetail(userId: string) {
  return getUserDetail(
    `/api/v1/UserManagement/student/${userId}`,
    mapStudentDetail,
    "Failed to load student details",
  );
}

export async function getTeacherUserDetail(userId: string) {
  return getUserDetail(
    `/api/v1/UserManagement/teacher/${userId}`,
    mapTeacherDetail,
    "Failed to load teacher details",
  );
}

export async function getParentUserDetail(userId: string) {
  return getUserDetail(
    `/api/v1/UserManagement/parent/${userId}`,
    mapParentDetail,
    "Failed to load parent details",
  );
}

export type LinkParentStudentPayload = {
  parentUserId: string;
  studentUserId: string;
};

export async function searchParentsByKeyword(
  keyword: string,
  pageNumber = 1,
  pageSize = 10,
): Promise<UserManagementApiResult<UserManagementListPage>> {
  return getUserManagementUsers({
    roleId: "parent",
    keyword,
    pageNumber,
    pageSize,
  });
}

async function mutateParentStudentLink(
  url: string,
  payload: LinkParentStudentPayload,
  fallbackMessage: string,
): Promise<UserManagementApiResult<Record<string, never>>> {
  try {
    const response = await httpClient.post<unknown>({
      url,
      data: payload,
    });
    const validationErrors = mapValidationErrors(response.error?.validationErrors);

    return {
      status: response.status,
      message: response.message,
      errorMessage: getFirstValidationErrorMessage(validationErrors) ?? response.error?.message,
      validationErrors,
      data: response.data !== null ? ({} as Record<string, never>) : null,
    };
  } catch (error) {
    return buildErrorResult(error, fallbackMessage);
  }
}

export async function linkParentStudent(payload: LinkParentStudentPayload) {
  return mutateParentStudentLink(
    "/api/v1/UserManagement/link-parent-student",
    payload,
    "Failed to link parent to student",
  );
}

export async function unlinkParentStudent(payload: LinkParentStudentPayload) {
  return mutateParentStudentLink(
    "/api/v1/UserManagement/unlink-parent-student",
    payload,
    "Failed to unlink parent from student",
  );
}

export async function searchParentByPhone(
  phoneNumber: string,
): Promise<UserManagementApiResult<UserManagementParentSearchResult>> {
  try {
    const response = await httpClient.get<unknown>({
      url: "/api/v1/UserManagement/search-parent",
      params: { phoneNumber },
    });
    const record = asRecord(response.data);

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      validationErrors: response.error?.validationErrors ?? null,
      data: record
        ? {
            parentUserId: readString(record, ["parentUserId"]),
            fullName: readString(record, ["fullName"]),
            phoneNumber: readString(record, ["phoneNumber"]),
            profileImageUrl: mapImageUrl(readString(record, ["profileImageUrl"], "")),
          }
        : null,
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to search parent");
  }
}

export async function getParentStudentsPage(
  pageNumber = 1,
  pageSize = 5,
): Promise<UserManagementApiResult<UserManagementParentStudentOption[]>> {
  try {
    const response = await httpClient.get<unknown>({
      url: "/api/v1/UserManagement/students/page",
      params: { pageNumber, pageSize },
    });

    const rows = extractListRows(response.data)
      .map(mapParentStudentOption)
      .filter((item): item is UserManagementParentStudentOption => item !== null);

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      validationErrors: mapValidationErrors(response.error?.validationErrors),
      data: rows,
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to load students");
  }
}

export async function searchStudentsForParent(
  keyword: string,
): Promise<UserManagementApiResult<UserManagementParentStudentOption[]>> {
  try {
    const response = await httpClient.get<unknown>({
      url: "/api/v1/UserManagement/search-students",
      params: { keyword },
    });

    const rows = extractListRows(response.data)
      .map(mapParentStudentOption)
      .filter((item): item is UserManagementParentStudentOption => item !== null);

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      validationErrors: mapValidationErrors(response.error?.validationErrors),
      data: rows,
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to search students");
  }
}

export async function uploadUserImage(
  file: File,
): Promise<UserManagementApiResult<UploadedFileData>> {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", FILE_UPLOAD_FOLDER);

    const response = await httpClient.post<unknown>({
      url: FILE_UPLOAD_URL,
      data: formData,
      isFormData: true,
    });

    const uploaded = mapUploadedFileData(response);
    const responseRecord = unwrapUploadRecord(response);
    const message = readString(responseRecord, ["message"]);

    if (!uploaded) {
      return {
        status: "Error",
        message,
        errorMessage: message || "Failed to upload image",
        validationErrors: null,
        data: null,
      };
    }

    return {
      status: "Success",
      message: uploaded.message || message,
      errorMessage: undefined,
      validationErrors: null,
      data: uploaded,
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to upload image");
  }
}

function mapTeacherAssignedGrades(gradeIds: string[]): number[] {
  return gradeIds
    .map((id) => Number(id))
    .filter((id) => Number.isFinite(id));
}

function mapTeacherPermissions(permissionIds: AddUserPermissionId[]) {
  return {
    canCreateLessons: permissionIds.includes("createLessons"),
    canStartLiveSessions: permissionIds.includes("liveBroadcast"),
    canUploadFiles: permissionIds.includes("uploadFiles"),
    canAddExams: permissionIds.includes("addTests"),
    canManageConversations: permissionIds.includes("manageChats"),
  };
}

function mapTeacherUpdatePermissions(permissionIds: AddUserPermissionId[]) {
  const canManageLessons = permissionIds.includes("createLessons");

  return {
    canManageLearningPaths: canManageLessons,
    canCreateLearningPaths: canManageLessons,
    canStartLiveSessions: permissionIds.includes("liveBroadcast"),
    canUploadFiles: permissionIds.includes("uploadFiles"),
    canAddExams: permissionIds.includes("addTests"),
    canManageConversations: permissionIds.includes("manageChats"),
  };
}

function mapTeacherSubjects(subjectIds: AddUserSubjectId[]): string[] {
  return subjectIds.map((subjectId) => subjectId);
}

async function createUser<TPayload>(
  url: string,
  payload: TPayload,
  fallbackMessage: string,
): Promise<UserManagementApiResult<string>> {
  try {
    const response = await httpClient.post<string>({
      url,
      data: payload,
    });
    const validationErrors = mapValidationErrors(response.error?.validationErrors);

    return {
      status: response.status,
      message: response.message,
      errorMessage: getFirstValidationErrorMessage(validationErrors) ?? response.error?.message,
      validationErrors,
      data: response.data,
    };
  } catch (error) {
    return buildErrorResult(error, fallbackMessage);
  }
}

export async function createStudentUser(values: StudentAccountFormValues) {
  return createUser(
    "/api/v1/UserManagement/student/create",
    {
      fullName: values.fullName,
      email: values.email,
      password: values.password,
      phoneNumber: values.phoneNumber,
      phoneCountryCode: 20,
      countryId: Number(values.countryId),
      educationLevelId: Number(values.educationLevelId),
      gradeId: Number(values.gradeId),
      schoolId: values.schoolId,
      address: values.schoolName || "",
      whatsAppNumber: values.phoneNumber,
      whatsAppCountryCode: 20,
      alternativePhone: values.phoneNumber,
      parentPhone: "",
      username: values.email || values.phoneNumber,
      parentUserId: values.selectedParentId ?? "",
      profileImageUrl: values.avatarFilePath ?? "",
    },
    "Failed to create student",
  );
}

export async function createTeacherUser(values: TeacherAccountFormValues) {
  const permissions = mapTeacherPermissions(values.permissionIds);

  return createUser(
    "/api/v1/UserManagement/teacher/create",
    {
      fullName: values.fullName,
      email: "",
      password: values.password,
      phoneNumber: values.phoneNumber,
      phoneCountryCode: 20,
      countryId: Number(values.countryId),
      jobTitle: values.jobTitle,
      schoolName: values.schoolName,
      schoolId: values.schoolId,
      profileImageUrl: values.avatarFilePath ?? "",
      address: values.address,
      subjects: mapTeacherSubjects(values.subjectIds),
      assignedGradeIds: mapTeacherAssignedGrades(values.gradeLevelIds),
      ...permissions,
    },
    "Failed to create teacher",
  );
}

export async function createParentUser(values: ParentAccountFormValues) {
  return createUser(
    "/api/v1/UserManagement/parent/create",
    {
      fullName: values.fullName,
      email: values.email,
      password: values.password,
      phoneNumber: values.phoneNumber,
      phoneCountryCode: 20,
      countryId: Number(values.countryId),
      profileImageUrl: values.avatarFilePath ?? "",
      address: values.address,
      childStudentUserIds: values.selectedStudentIds,
    },
    "Failed to create parent",
  );
}

async function updateUser<TPayload>(
  url: string,
  payload: TPayload,
  fallbackMessage: string,
): Promise<UserManagementApiResult<Record<string, never>>> {
  try {
    const response = await httpClient.put<unknown>({
      url,
      data: payload,
    });
    const validationErrors = mapValidationErrors(response.error?.validationErrors);

    return {
      status: response.status,
      message: response.message,
      errorMessage: getFirstValidationErrorMessage(validationErrors) ?? response.error?.message,
      validationErrors,
      data: response.data ? ({} as Record<string, never>) : null,
    };
  } catch (error) {
    return buildErrorResult(error, fallbackMessage);
  }
}

export type StudentUserUpdateContext = {
  phoneCountryCode?: number | null;
  address?: string;
  whatsAppNumber?: string;
  whatsAppCountryCode?: number | null;
  alternativePhone?: string;
  parentPhone?: string;
};

export async function updateStudentUser(
  userId: string,
  values: StudentAccountFormValues,
  context: StudentUserUpdateContext = {},
) {
  const phoneCountryCode = context.phoneCountryCode ?? 20;

  return updateUser(
    `/api/v1/UserManagement/student/${userId}/update`,
    {
      userId,
      fullName: values.fullName,
      profileImageUrl: values.avatarFilePath ?? "",
      phoneNumber: values.phoneNumber,
      phoneCountryCode,
      countryId: Number(values.countryId),
      educationLevelId: Number(values.educationLevelId),
      gradeId: Number(values.gradeId),
      schoolId: values.schoolId,
      email: values.email,
      address: context.address ?? values.schoolName ?? "",
      whatsAppNumber: context.whatsAppNumber ?? values.phoneNumber,
      whatsAppCountryCode: context.whatsAppCountryCode ?? phoneCountryCode,
      alternativePhone: context.alternativePhone ?? values.phoneNumber,
      parentPhone: context.parentPhone ?? "",
    },
    "Failed to update student",
  );
}

export type TeacherUserUpdateContext = {
  phoneCountryCode?: number | null;
  email?: string;
  about?: string;
  yearsOfExperience?: number | null;
  city?: string;
  rating?: number | null;
  certificatesJson?: string;
};

export async function updateTeacherUser(
  userId: string,
  values: TeacherAccountFormValues,
  context: TeacherUserUpdateContext = {},
) {
  const phoneCountryCode = context.phoneCountryCode ?? 20;

  return updateUser(
    `/api/v1/UserManagement/teacher/${userId}/update`,
    {
      userId,
      fullName: values.fullName,
      profileImageUrl: values.avatarFilePath ?? "",
      phoneNumber: values.phoneNumber,
      phoneCountryCode,
      countryId: Number(values.countryId),
      jobTitle: values.jobTitle,
      schoolName: values.schoolName,
      schoolId: values.schoolId,
      email: context.email ?? "",
      address: values.address,
      assignedGradeIds: mapTeacherAssignedGrades(values.gradeLevelIds),
      ...mapTeacherUpdatePermissions(values.permissionIds),
      about: context.about ?? "",
      yearsOfExperience: context.yearsOfExperience ?? 0,
      city: context.city ?? "",
      rating: context.rating ?? 0,
      certificatesJson: context.certificatesJson ?? "",
    },
    "Failed to update teacher",
  );
}

export type ParentUserUpdateContext = {
  phoneCountryCode?: number | null;
};

export async function updateParentUser(
  userId: string,
  values: ParentAccountFormValues,
  context: ParentUserUpdateContext = {},
) {
  const phoneCountryCode = context.phoneCountryCode ?? 20;

  return updateUser(
    `/api/v1/UserManagement/parent/${userId}/update`,
    {
      userId,
      fullName: values.fullName,
      profileImageUrl: values.avatarFilePath ?? "",
      phoneNumber: values.phoneNumber,
      phoneCountryCode,
      countryId: Number(values.countryId),
      email: values.email,
      address: values.address,
      childStudentUserIds: values.selectedStudentIds,
    },
    "Failed to update parent",
  );
}
