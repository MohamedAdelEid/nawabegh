import type {
  StudentAccountFormValues,
  TeacherAccountFormValues,
} from "@/modules/admin/domain/types/addUser.types";
import type { UserManagementDropdownOption } from "@/modules/admin/infrastructure/api/userManagementApi";

export type UserLocationValidationKey = "countryRequired" | "schoolRequired";

export function validateRequiredCountryAndSchool(
  countryId: string,
  schoolId: string,
): UserLocationValidationKey | null {
  if (!countryId.trim()) return "countryRequired";
  if (!schoolId.trim()) return "schoolRequired";
  return null;
}

export function resolveSchoolNameFromRows(
  schoolRows: UserManagementDropdownOption<string>[],
  schoolId: string,
  schoolNameFallback = "",
): string {
  if (!schoolId.trim()) return schoolNameFallback;
  const row = schoolRows.find((item) => String(item.id) === schoolId);
  return row?.name.trim() || schoolNameFallback;
}

export function withResolvedStudentSchoolName(
  values: StudentAccountFormValues,
  schoolRows: UserManagementDropdownOption<string>[],
): StudentAccountFormValues {
  return {
    ...values,
    schoolName: resolveSchoolNameFromRows(schoolRows, values.schoolId, values.schoolName),
  };
}

export function withResolvedTeacherSchoolName(
  values: TeacherAccountFormValues,
  schoolRows: UserManagementDropdownOption<string>[],
): TeacherAccountFormValues {
  return {
    ...values,
    schoolName: resolveSchoolNameFromRows(schoolRows, values.schoolId, values.schoolName),
  };
}
