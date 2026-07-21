import type { CourseCardModel } from "@/shared/domain/types/course.types";
import type {
  Teacher,
  TeacherCertificate,
  TeacherPublicProfile,
} from "@/shared/domain/types/teacher.types";

export type TeacherBadgeVariant = "expert" | "pioneer" | null;

type TeacherBadgeSource = {
  isExpert: boolean;
  expertBadgeLabel: string;
};

export function getTeacherBadgeVariant(teacher: TeacherBadgeSource): TeacherBadgeVariant {
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

type TeacherPublicProfileApiRow = Partial<TeacherPublicProfile> & {
  teacherId?: string;
  profileImageUrl?: string | null;
  certificates?: Array<Partial<TeacherCertificate>>;
  subjectsTaught?: string[];
  publishedCourses?: Array<Record<string, unknown>>;
};

function mapTeacherCertificate(item: unknown): TeacherCertificate | null {
  if (!item || typeof item !== "object") return null;
  const row = item as Partial<TeacherCertificate>;
  const title = row.title?.trim();
  if (!title) return null;

  return {
    title,
    description: row.description?.trim() || "",
    year: row.year != null && Number.isFinite(Number(row.year)) ? Number(row.year) : null,
  };
}

function mapTeacherPublishedCourse(item: unknown) {
  if (!item || typeof item !== "object") return null;
  const row = item as Record<string, unknown>;
  const courseId = String(row.courseId ?? "").trim();
  if (!courseId) return null;

  return {
    courseId,
    title: String(row.title ?? "").trim(),
    coverImageUrl: String(row.coverImageUrl ?? "").trim() || null,
    subjectNameAr: String(row.subjectNameAr ?? "").trim(),
    gradeId: Number(row.gradeId ?? 0),
    gradeNameAr: String(row.gradeNameAr ?? "").trim(),
    gradeNameEn: String(row.gradeNameEn ?? "").trim(),
    discountedPrice: Number(row.discountedPrice ?? 0),
    originalPrice: Number(row.originalPrice ?? 0),
  };
}

/** Normalizes a raw API row into a typed public teacher profile. */
export function mapTeacherPublicProfileDto(item: unknown): TeacherPublicProfile | null {
  if (!item || typeof item !== "object") return null;

  const row = item as TeacherPublicProfileApiRow;
  const teacherId = row.teacherId?.trim();
  if (!teacherId) return null;

  return {
    teacherId,
    fullName: row.fullName?.trim() || "",
    profileImageUrl: row.profileImageUrl?.trim() || null,
    jobTitle: row.jobTitle?.trim() || "",
    rating: Number(row.rating ?? 0),
    yearsOfExperience: Number(row.yearsOfExperience ?? 0),
    studentCount: Number(row.studentCount ?? 0),
    location: row.location?.trim() || "",
    isExpert: Boolean(row.isExpert),
    expertBadgeLabel: row.expertBadgeLabel?.trim() || "",
    about: row.about?.trim() || "",
    certificates: Array.isArray(row.certificates)
      ? row.certificates
          .map(mapTeacherCertificate)
          .filter((certificate): certificate is TeacherCertificate => certificate != null)
      : [],
    subjectsTaught: Array.isArray(row.subjectsTaught)
      ? row.subjectsTaught
          .map((subject) => (typeof subject === "string" ? subject.trim() : ""))
          .filter(Boolean)
      : [],
    publishedCourses: Array.isArray(row.publishedCourses)
      ? row.publishedCourses
          .map(mapTeacherPublishedCourse)
          .filter((course): course is NonNullable<typeof course> => course != null)
      : [],
  };
}

export type TeacherCertificateGroups = {
  education: TeacherCertificate[];
  achievements: TeacherCertificate[];
};

const UNIVERSITY_PATTERN = /جامعة|university/i;

export function splitTeacherCertificates(
  certificates: TeacherCertificate[],
): TeacherCertificateGroups {
  const education: TeacherCertificate[] = [];
  const achievements: TeacherCertificate[] = [];

  for (const certificate of certificates) {
    if (UNIVERSITY_PATTERN.test(certificate.description)) {
      education.push(certificate);
    } else {
      achievements.push(certificate);
    }
  }

  return { education, achievements };
}

export function formatYearsOfExperience(years: number, locale: string): string {
  const formatter = new Intl.NumberFormat(locale.startsWith("ar") ? "ar" : "en");
  const value = years >= 10 ? `${formatter.format(years)}+` : formatter.format(years);
  return value;
}

export function pickTeacherProfileHeroCourse(
  courses: CourseCardModel[],
): { hero: CourseCardModel | null; regular: CourseCardModel[] } {
  if (courses.length === 0) {
    return { hero: null, regular: [] };
  }

  const enrolledWithProgress = courses.find(
    (course) => course.isEnrolled && (course.progressPercentage ?? 0) > 0,
  );
  const hero =
    enrolledWithProgress ??
    courses.find((course) => course.isBestSeller) ??
    courses[0] ??
    null;

  if (!hero) {
    return { hero: null, regular: courses };
  }

  return {
    hero,
    regular: courses.filter((course) => course.id !== hero.id),
  };
}
