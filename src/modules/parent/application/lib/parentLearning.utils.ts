import type { ParentChildCourseItem } from "@/modules/parent/domain/types/parentLearning.types";

export type CourseFilterTab = "all" | "active" | "completed" | "needsFollowUp";

export function classifyCourseTab(
  course: ParentChildCourseItem,
): Exclude<CourseFilterTab, "all"> {
  const status = course.status?.toLowerCase() ?? "";
  const isCompleted = status.includes("complet") || course.progressPercent >= 100;
  if (isCompleted) return "completed";

  const attendance = course.attendancePercent ?? null;
  const quizAverage = course.quizAverageScorePercent ?? null;
  const needsFollowUp =
    status.includes("expired") ||
    status.includes("paused") ||
    (attendance != null && attendance < 50) ||
    (quizAverage != null && quizAverage < 50) ||
    (course.progressPercent < 25 && (course.completedLessonsCount ?? 0) === 0);

  return needsFollowUp ? "needsFollowUp" : "active";
}

export type CourseActionKey =
  | "start"
  | "continue"
  | "renew"
  | "view";

export function resolveCourseActionKey(course: ParentChildCourseItem): CourseActionKey {
  const status = course.status?.toLowerCase() ?? "";
  if (status.includes("expired")) return "renew";
  if (status.includes("active")) {
    return course.progressPercent > 0 ? "continue" : "start";
  }
  return "view";
}

export type ResourceViewerKind = "video" | "pdf" | "image" | "presentation" | "other";

export function resolveResourceViewerKind(mediaKind: string | null | undefined): ResourceViewerKind {
  const normalized = (mediaKind ?? "").toLowerCase();
  if (normalized === "video") return "video";
  if (normalized === "pdf") return "pdf";
  if (normalized === "image") return "image";
  if (normalized === "presentation" || normalized === "word") return "presentation";
  return "other";
}

export const RESOURCE_MEDIA_KIND_OPTIONS = [
  "all",
  "Video",
  "Pdf",
  "Image",
  "Presentation",
  "Word",
  "Other",
] as const;

export type ResourceMediaKindOption = (typeof RESOURCE_MEDIA_KIND_OPTIONS)[number];

export function resourceFilterLabelKey(option: ResourceMediaKindOption): string {
  switch (option) {
    case "all":
      return "resourceFilterAll";
    case "Video":
      return "resourceFilterVideo";
    case "Pdf":
      return "resourceFilterPdf";
    case "Image":
      return "resourceFilterImage";
    case "Presentation":
      return "resourceFilterPresentation";
    case "Word":
      return "resourceFilterWord";
    default:
      return "resourceFilterOther";
  }
}
