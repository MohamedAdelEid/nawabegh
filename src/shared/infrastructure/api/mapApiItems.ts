import type { Country } from "@/shared/domain/types/country.types";
import type { EducationLevel } from "@/shared/domain/types/education-level.types";
import type { Grade } from "@/shared/domain/types/grade.types";
import type { School } from "@/shared/domain/types/school.types";

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function readString(record: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value;
  }
  return "";
}

export function mapCountryItem(item: unknown): Country | null {
  const record = asRecord(item);
  if (!record || record.id == null) return null;

  const name = readString(record, ["name", "title", "nameAr", "nameEn"]);
  if (!name) return null;

  const flagIcon = readString(record, ["flagIcon", "flag", "icon"]) || undefined;

  return {
    id: Number(record.id),
    name,
    flagIcon,
  };
}

export function mapEducationLevelItem(item: unknown): EducationLevel | null {
  const record = asRecord(item);
  if (!record || record.id == null) return null;

  const nameAr = readString(record, ["nameAr", "name", "title"]);
  const nameEn = readString(record, ["nameEn", "name", "title"]);
  if (!nameAr && !nameEn) return null;

  const icon = readString(record, ["icon", "iconUrl", "imageUrl", "iconPath"]) || undefined;

  return {
    id: Number(record.id),
    countryId: Number(record.countryId ?? 0),
    nameAr: nameAr || nameEn,
    nameEn: nameEn || nameAr,
    gradeCount: Number(record.gradeCount ?? 0),
    icon,
  };
}

export function mapGradeItem(item: unknown): Grade | null {
  const record = asRecord(item);
  if (!record || record.id == null) return null;

  const nameAr = readString(record, ["nameAr", "name", "title"]);
  const nameEn = readString(record, ["nameEn", "name", "title"]);
  if (!nameAr && !nameEn) return null;

  return {
    id: Number(record.id),
    nameAr: nameAr || nameEn,
    nameEn: nameEn || nameAr,
  };
}

export function mapSchoolItem(item: unknown): School | null {
  const record = asRecord(item);
  if (!record || record.id == null) return null;

  const name = readString(record, ["name", "title", "nameAr", "nameEn"]);
  if (!name) return null;

  return {
    id: String(record.id),
    name,
  };
}

export function mapApiItems<T>(
  items: unknown[],
  mapper: (item: unknown) => T | null,
): T[] {
  return items
    .map(mapper)
    .filter((item): item is T => item != null);
}
