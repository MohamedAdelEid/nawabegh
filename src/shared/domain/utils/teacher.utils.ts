import type { Teacher } from "@/shared/domain/types/teacher.types";

type TeacherApiRow = Partial<Teacher> & {
  teacherId?: string;
  profileImageUrl?: string | null;
};

/** Normalizes a raw API row into a typed teacher entity. */
export function mapTeacherDto(item: unknown): Teacher | null {
  if (!item || typeof item !== "object") return null;

  const row = item as TeacherApiRow;
  const teacherId = row.teacherId?.trim();
  if (!teacherId) return null;

  return {
    teacherId,
    fullName: row.fullName?.trim() || "",
    profileImageUrl: row.profileImageUrl?.trim() || null,
    jobTitle: row.jobTitle?.trim() || "",
    primarySubjectNameAr: row.primarySubjectNameAr?.trim() || "",
    rating: Number(row.rating ?? 0),
    location: row.location?.trim() || "",
    studentCount: Number(row.studentCount ?? 0),
    isExpert: Boolean(row.isExpert),
    expertBadgeLabel: row.expertBadgeLabel?.trim() || "",
  };
}
