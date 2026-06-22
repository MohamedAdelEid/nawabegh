/** How long a student keeps access after enrollment or renewal. `null` = lifetime. */
export type AccessDurationDays = number | null;

export const ACCESS_DURATION_MIN_DAYS = 1;
export const ACCESS_DURATION_MAX_DAYS = 3650;
export const ACCESS_DURATION_PRESETS = [30, 90, 180, 365] as const;

export function isValidAccessDurationDays(days: number | null): boolean {
  if (days === null) return true;
  return Number.isInteger(days) && days >= ACCESS_DURATION_MIN_DAYS && days <= ACCESS_DURATION_MAX_DAYS;
}
