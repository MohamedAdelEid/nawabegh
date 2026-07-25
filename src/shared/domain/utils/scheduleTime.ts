/**
 * Live-session schedule helpers.
 *
 * Backend often serializes the wall-clock time the admin picked (e.g. 21:50 Egypt)
 * with a trailing `Z` or with no offset. Trusting that as real UTC makes countdowns
 * look ~timezone-offset hours off. We parse the date/time components as local time.
 */

const SCHEDULE_PARTS =
  /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?/;

export function parseScheduleDateMs(
  value: string | null | undefined,
): number | null {
  if (!value?.trim()) return null;
  const raw = value.trim();
  const match = raw.match(SCHEDULE_PARTS);
  if (match) {
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const hour = Number(match[4]);
    const minute = Number(match[5]);
    const second = Number(match[6] ?? 0);
    const ms = new Date(year, month - 1, day, hour, minute, second).getTime();
    return Number.isNaN(ms) ? null : ms;
  }

  const fallback = Date.parse(raw);
  return Number.isNaN(fallback) ? null : fallback;
}

/** Whole seconds remaining until the schedule instant (0 if past / invalid). */
export function secondsUntilSchedule(
  value: string | null | undefined,
  now = Date.now(),
): number {
  const target = parseScheduleDateMs(value);
  if (target == null) return 0;
  return Math.max(0, Math.floor((target - now) / 1000));
}

/** Minutes remaining until the schedule instant (0 if past / invalid). */
export function minutesUntilSchedule(
  value: string | null | undefined,
  now = Date.now(),
): number {
  const seconds = secondsUntilSchedule(value, now);
  if (seconds <= 0) return 0;
  return Math.max(1, Math.ceil(seconds / 60));
}
