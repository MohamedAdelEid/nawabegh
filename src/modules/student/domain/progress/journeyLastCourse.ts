const LAST_JOURNEY_COURSE_KEY = "nawabegh:last-journey-course";

export function readLastJourneyCourseId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(LAST_JOURNEY_COURSE_KEY);
    return value?.trim() || null;
  } catch {
    return null;
  }
}

export function writeLastJourneyCourseId(courseId: string) {
  if (typeof window === "undefined") return;
  const trimmed = courseId.trim();
  if (!trimmed) return;
  try {
    window.localStorage.setItem(LAST_JOURNEY_COURSE_KEY, trimmed);
  } catch {
    // ignore quota / private mode
  }
}
