import type { Teacher } from "@/shared/domain/types/teacher.types";

export type TeacherBadgeVariant = "expert" | "pioneer" | null;

export function getTeacherBadgeVariant(teacher: Teacher): TeacherBadgeVariant {
  const label = teacher.expertBadgeLabel.trim();
  if (teacher.isExpert && label === "EXPERT") return "expert";
  if (label === "رائد") return "pioneer";
  return null;
}

export function formatTeacherStudentCount(count: number, locale: string): string {
  if (count >= 1000) {
    const value = count / 1000;
    const formatted =
      value >= 10
        ? String(Math.round(value))
        : value.toFixed(1).replace(/\.0$/, "");
    return locale.startsWith("ar") ? `+${formatted}ك` : `+${formatted}k`;
  }

  const formatter = new Intl.NumberFormat(locale.startsWith("ar") ? "ar" : "en");
  return `+${formatter.format(count)}`;
}

export function formatTeacherRating(rating: number, locale: string): string {
  return new Intl.NumberFormat(locale.startsWith("ar") ? "ar" : "en", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(rating);
}

export function buildTeacherSubtitle(teacher: Teacher): string {
  const parts = [teacher.jobTitle, teacher.primarySubjectNameAr].filter(Boolean);
  return parts.join(" • ");
}

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
