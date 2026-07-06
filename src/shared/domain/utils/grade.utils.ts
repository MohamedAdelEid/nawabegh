export type GradeNameFields = {
  gradeNameAr?: string | null;
  gradeNameEn?: string | null;
};

export function resolveGradeLabel(
  locale: string,
  names: GradeNameFields,
  fallback = "—",
): string {
  const ar = names.gradeNameAr?.trim();
  const en = names.gradeNameEn?.trim();

  if (locale.startsWith("ar")) {
    return ar || en || fallback;
  }

  return en || ar || fallback;
}

export function formatCourseContextLabel(
  locale: string,
  title: string,
  subject?: string | null,
  gradeNames?: GradeNameFields,
): string {
  const grade = gradeNames ? resolveGradeLabel(locale, gradeNames, "") : "";
  return [title, subject, grade].filter((part) => Boolean(part?.trim())).join(" · ");
}
