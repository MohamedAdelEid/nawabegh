import type { Subject } from "@/shared/domain/types/subject.types";

type SubjectApiRow = Partial<Subject> & {
  id?: number;
  iconUrl?: string | null;
  createdAt?: string;
};

/** Normalizes a raw API row into a typed subject entity. */
export function mapSubjectDto(item: unknown): Subject | null {
  if (!item || typeof item !== "object") return null;

  const row = item as SubjectApiRow;
  if (row.id == null) return null;

  return {
    id: Number(row.id),
    nameAr: row.nameAr?.trim() || "",
    nameEn: row.nameEn?.trim() || "",
    iconUrl: row.iconUrl?.trim() || null,
    coursesCount: Number(row.coursesCount ?? 0),
    teachersCount: Number(row.teachersCount ?? 0),
  };
}
