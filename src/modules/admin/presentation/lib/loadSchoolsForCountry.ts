import { getSchoolFilterOptions } from "@/modules/admin/infrastructure/api/schoolApi";
import type { UserManagementDropdownOption } from "@/modules/admin/infrastructure/api/userManagementApi";

export function resolveCountryNameFromRows(
  countryRows: UserManagementDropdownOption<number>[],
  countryId: string,
): string {
  if (!countryId.trim()) return "";
  const row = countryRows.find((item) => String(item.id) === countryId);
  return row?.name.trim() ?? "";
}

export async function fetchSchoolDropdownRowsForCountry(
  countryName: string,
  keyword = "",
): Promise<{
  rows: UserManagementDropdownOption<string>[];
  errorMessage?: string;
}> {
  const trimmed = countryName.trim();
  if (!trimmed) {
    return { rows: [] };
  }

  const result = await getSchoolFilterOptions({
    keyword: keyword.trim() || undefined,
    pageSize: 50,
  });
  if (result.errorMessage) {
    return { rows: [], errorMessage: result.errorMessage };
  }

  return {
    rows: (result.data ?? []).map((row) => ({
      id: row.id,
      name: row.name,
    })),
  };
}

export async function fetchSchoolDropdownRowsForCountryId(
  countryRows: UserManagementDropdownOption<number>[],
  countryId: string,
  countryNameFallback = "",
  keyword = "",
): Promise<{
  rows: UserManagementDropdownOption<string>[];
  errorMessage?: string;
}> {
  const countryName =
    resolveCountryNameFromRows(countryRows, countryId) || countryNameFallback.trim();
  return fetchSchoolDropdownRowsForCountry(countryName, keyword);
}
