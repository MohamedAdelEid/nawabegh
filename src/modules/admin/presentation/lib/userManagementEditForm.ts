import type {
  AddUserPermissionId,
  ParentAccountFormValues,
  StudentAccountFormValues,
  TeacherAccountFormValues,
} from "@/modules/admin/domain/types/addUser.types";
import {
  getCountriesDropdown,
  getEducationLevelsDropdown,
  getParentUserDetail,
  getStudentUserDetail,
  getTeacherUserDetail,
  getUserManagementGradesDropdown,
  normalizeUserManagementRole,
  type ParentUserDetail,
  type ParentUserUpdateContext,
  type StudentUserDetail,
  type StudentUserUpdateContext,
  type TeacherUserDetail,
  type TeacherUserUpdateContext,
  type UserManagementDropdownOption,
  type UserManagementParentStudentOption,
} from "@/modules/admin/infrastructure/api/userManagementApi";
import { fetchSchoolDropdownRowsForCountryId } from "@/modules/admin/presentation/lib/loadSchoolsForCountry";
import { ROUTES } from "@/shared/infrastructure/config/routes";

export function getUserManagementEditPath(role: string, userId: string) {
  const normalizedRole = normalizeUserManagementRole(role);

  if (normalizedRole === "teacher") {
    return `${ROUTES.ADMIN.USER_MANAGEMENT.ADD.TEACHER}?userId=${encodeURIComponent(userId)}`;
  }
  if (normalizedRole === "parent") {
    return `${ROUTES.ADMIN.USER_MANAGEMENT.ADD.PARENT}?userId=${encodeURIComponent(userId)}`;
  }

  return `${ROUTES.ADMIN.USER_MANAGEMENT.ADD.STUDENT}?userId=${encodeURIComponent(userId)}`;
}

function resolveDropdownIdByName<T extends string | number>(
  rows: UserManagementDropdownOption<T>[],
  id: number | string | null | undefined,
  name: string,
) {
  if (id !== null && id !== undefined && String(id) !== "") {
    return String(id);
  }

  if (!name.trim()) return "";

  const match = rows.find((row) => row.name.trim() === name.trim());
  return match ? String(match.id) : "";
}

function mapTeacherPermissionsToFormIds(
  permissions: TeacherUserDetail["permissions"],
): AddUserPermissionId[] {
  const ids: AddUserPermissionId[] = [];

  if (permissions.canManageLearningPaths || permissions.canCreateLearningPaths) {
    ids.push("createLessons");
  }
  if (permissions.canStartLiveSessions) ids.push("liveBroadcast");
  if (permissions.canUploadFiles) ids.push("uploadFiles");
  if (permissions.canAddExams) ids.push("addTests");
  if (permissions.canManageConversations) ids.push("manageChats");

  return ids;
}

export function mapStudentDetailToFormValues(
  detail: StudentUserDetail,
  countries: UserManagementDropdownOption<number>[],
  educationLevels: UserManagementDropdownOption<number>[],
  grades: UserManagementDropdownOption<number>[],
  schools: UserManagementDropdownOption<string>[],
): StudentAccountFormValues {
  const countryId = resolveDropdownIdByName(countries, detail.countryId, detail.countryName);
  const educationLevelId = resolveDropdownIdByName(
    educationLevels,
    detail.educationLevelId,
    detail.educationLevelName,
  );
  const gradeId = resolveDropdownIdByName(grades, detail.gradeId, detail.gradeName);
  const schoolId = resolveDropdownIdByName(schools, detail.schoolId, detail.schoolName ?? "");
  const schoolRow = schools.find((row) => String(row.id) === schoolId);

  return {
    fullName: detail.fullName,
    countryId,
    educationLevelId,
    gradeId,
    phoneNumber: detail.phoneNumber,
    schoolId,
    schoolName: detail.schoolName?.trim() || schoolRow?.name || "",
    email: detail.email,
    password: "",
    avatarFile: null,
    avatarPreviewUrl: detail.profileImageUrl,
    avatarFilePath: detail.profileImagePath,
    linkParentEnabled: Boolean(detail.linkedParent),
    parentSearch: "",
    selectedParentId: detail.linkedParent?.parentUserId ?? null,
    subscriptionPlanId: "active",
    subscriptionStartDate: "",
    subscriptionEndDate: "",
  };
}

export function mapTeacherDetailToFormValues(
  detail: TeacherUserDetail,
  countries: UserManagementDropdownOption<number>[],
  schools: UserManagementDropdownOption<string>[],
): TeacherAccountFormValues {
  const countryId = resolveDropdownIdByName(countries, detail.countryId, detail.countryName);
  const schoolId = resolveDropdownIdByName(schools, detail.schoolId, detail.schoolName);
  const schoolRow = schools.find((row) => String(row.id) === schoolId);

  return {
    fullName: detail.fullName,
    phoneNumber: detail.phoneNumber,
    countryId,
    educationLevelId: detail.educationLevelId ? String(detail.educationLevelId) : "",
    jobTitle: detail.jobTitle,
    schoolId,
    schoolName: detail.schoolName?.trim() || schoolRow?.name || "",
    password: "",
    address: detail.address,
    avatarFile: null,
    avatarPreviewUrl: detail.profileImageUrl,
    avatarFilePath: detail.profileImagePath,
    subjectIds: [],
    gradeLevelIds: detail.assignedGrades
      .map((grade) => String(grade.gradeId))
      .filter((gradeId) => gradeId !== "0"),
    permissionIds: mapTeacherPermissionsToFormIds(detail.permissions),
  };
}

export function mapParentDetailToFormValues(detail: ParentUserDetail): ParentAccountFormValues {
  return {
    fullName: detail.fullName,
    phoneNumber: detail.phoneNumber,
    countryId: detail.countryId ? String(detail.countryId) : "",
    address: detail.address,
    email: detail.email,
    password: "",
    avatarFile: null,
    avatarPreviewUrl: detail.profileImageUrl,
    avatarFilePath: detail.profileImagePath,
    studentSearch: "",
    selectedStudentIds: detail.children.map((child) => child.studentUserId).filter(Boolean),
  };
}

function mapParentChildToStudentOption(
  child: ParentUserDetail["children"][number],
): UserManagementParentStudentOption {
  return {
    studentUserId: child.studentUserId,
    fullName: child.fullName,
    phoneNumber: "",
    profileImageUrl: child.profileImageUrl,
    gradeName: child.gradeName,
  };
}

export type StudentEditFormLoadResult = {
  formValues: StudentAccountFormValues;
  updateContext: StudentUserUpdateContext;
  countryRows: UserManagementDropdownOption<number>[];
  educationLevelRows: UserManagementDropdownOption<number>[];
  gradeRows: UserManagementDropdownOption<number>[];
  schoolRows: UserManagementDropdownOption<string>[];
};

export async function loadStudentEditForm(userId: string): Promise<StudentEditFormLoadResult | null> {
  const [countriesResult, studentResult] = await Promise.all([
    getCountriesDropdown(),
    getStudentUserDetail(userId),
  ]);

  if (!studentResult.data) return null;

  const student = studentResult.data;
  const countries = countriesResult.data ?? [];
  const countryId = resolveDropdownIdByName(countries, student.countryId, student.countryName);
  const schoolsResult = await fetchSchoolDropdownRowsForCountryId(
    countries,
    countryId,
    student.countryName,
  );
  const schools = schoolsResult.rows;

  let educationLevels: UserManagementDropdownOption<number>[] = [];
  let grades: UserManagementDropdownOption<number>[] = [];

  if (countryId) {
    const educationLevelsResult = await getEducationLevelsDropdown(Number(countryId));
    educationLevels = educationLevelsResult.data ?? [];

    const educationLevelId = resolveDropdownIdByName(
      educationLevels,
      student.educationLevelId,
      student.educationLevelName,
    );

    if (educationLevelId) {
      const gradesResult = await getUserManagementGradesDropdown(Number(educationLevelId));
      grades = gradesResult.data ?? [];
    }
  }

  return {
    formValues: mapStudentDetailToFormValues(student, countries, educationLevels, grades, schools),
    updateContext: {
      phoneCountryCode: student.phoneCountryCode,
      address: student.address,
      whatsAppNumber: student.whatsAppNumber,
      whatsAppCountryCode: student.whatsAppCountryCode,
      alternativePhone: student.alternativePhone,
      parentPhone: student.parentPhone,
    },
    countryRows: countries,
    educationLevelRows: educationLevels,
    gradeRows: grades,
    schoolRows: schools,
  };
}

export type TeacherEditFormLoadResult = {
  formValues: TeacherAccountFormValues;
  updateContext: TeacherUserUpdateContext;
  countryRows: UserManagementDropdownOption<number>[];
  educationLevelRows: UserManagementDropdownOption<number>[];
  gradeRows: UserManagementDropdownOption<number>[];
  schoolRows: UserManagementDropdownOption<string>[];
};

export async function loadTeacherEditForm(userId: string): Promise<TeacherEditFormLoadResult | null> {
  const [countriesResult, teacherResult] = await Promise.all([
    getCountriesDropdown(),
    getTeacherUserDetail(userId),
  ]);

  if (!teacherResult.data) return null;

  const teacher = teacherResult.data;
  const countries = countriesResult.data ?? [];
  const countryId = resolveDropdownIdByName(countries, teacher.countryId, teacher.countryName);
  const schoolsResult = await fetchSchoolDropdownRowsForCountryId(
    countries,
    countryId,
    teacher.countryName,
  );
  const schools = schoolsResult.rows;

  let educationLevels: UserManagementDropdownOption<number>[] = [];
  let grades: UserManagementDropdownOption<number>[] = [];
  let educationLevelId = teacher.educationLevelId ? String(teacher.educationLevelId) : "";

  if (countryId) {
    const educationLevelsResult = await getEducationLevelsDropdown(Number(countryId));
    educationLevels = educationLevelsResult.data ?? [];

    if (!educationLevelId && educationLevels.length === 1) {
      educationLevelId = String(educationLevels[0]?.id ?? "");
    }

    if (educationLevelId) {
      const gradesResult = await getUserManagementGradesDropdown(Number(educationLevelId));
      grades = gradesResult.data ?? [];
    }
  }

  const formValues = mapTeacherDetailToFormValues(teacher, countries, schools);
  if (!formValues.educationLevelId && educationLevelId) {
    formValues.educationLevelId = educationLevelId;
  }

  return {
    formValues,
    updateContext: {
      phoneCountryCode: teacher.phoneCountryCode,
      email: teacher.email,
      about: teacher.about,
      yearsOfExperience: teacher.yearsOfExperience,
      city: teacher.city,
      rating: teacher.rating,
      certificatesJson: teacher.certificatesJson,
    },
    countryRows: countries,
    educationLevelRows: educationLevels,
    gradeRows: grades,
    schoolRows: schools,
  };
}

export type ParentEditFormLoadResult = {
  formValues: ParentAccountFormValues;
  updateContext: ParentUserUpdateContext;
  countryRows: UserManagementDropdownOption<number>[];
  linkedStudents: UserManagementParentStudentOption[];
};

export async function loadParentEditForm(userId: string): Promise<ParentEditFormLoadResult | null> {
  const [countriesResult, parentResult] = await Promise.all([
    getCountriesDropdown(),
    getParentUserDetail(userId),
  ]);

  if (!parentResult.data) return null;

  const parent = parentResult.data;
  const countries = countriesResult.data ?? [];
  const formValues = mapParentDetailToFormValues(parent);

  if (!formValues.countryId && parent.countryName) {
    formValues.countryId = resolveDropdownIdByName(countries, parent.countryId, parent.countryName);
  }

  return {
    formValues,
    updateContext: {
      phoneCountryCode: parent.phoneCountryCode,
    },
    countryRows: countries,
    linkedStudents: parent.children.map(mapParentChildToStudentOption),
  };
}

export function getUserManagementDetailsReturnPath(userId: string, role: string) {
  const normalizedRole = normalizeUserManagementRole(role);
  return `${ROUTES.ADMIN.USER_MANAGEMENT.VIEW(userId)}?role=${encodeURIComponent(normalizedRole)}`;
}
