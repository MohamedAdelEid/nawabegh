/** Real API event ids are numeric; reject legacy mock slugs like `evt-heritage-fest`. */
export function isValidStudentSchoolEventId(eventId: string): boolean {
  return /^\d+$/.test(eventId.trim());
}
