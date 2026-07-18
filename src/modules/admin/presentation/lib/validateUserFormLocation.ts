import type {
  StudentAccountFormValues,
  TeacherAccountFormValues,
} from "@/modules/admin/domain/types/addUser.types";
import type { UserManagementDropdownOption } from "@/modules/admin/infrastructure/api/userManagementApi";

export type UserLocationValidationKey = "countryRequired" | "schoolRequired";

/** Country is required; school is optional (backend accepts null). */
export function validateRequiredCountry(
  countryId: string,
): UserLocationValidationKey | null {
  if (!countryId.trim()) return "countryRequired";
  return null;
}

/** @deprecated Prefer validateRequiredCountry — school is optional. */
export function validateRequiredCountryAndSchool(
  countryId: string,
  schoolId: string,
): UserLocationValidationKey | null {
  const countryError = validateRequiredCountry(countryId);
  if (countryError) return countryError;
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
