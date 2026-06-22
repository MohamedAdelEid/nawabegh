import type { AccessDurationDays } from "@/shared/domain/types/accessDuration.types";

export type AccessDurationFormatter = {
  lifetime: () => string;
  oneYear: () => string;
  years: (count: number) => string;
  thirtyDays: () => string;
  days: (count: number) => string;
};

export function formatAccessDuration(
  days: AccessDurationDays | undefined,
  format: AccessDurationFormatter,
): string {
  if (days == null) return format.lifetime();
  if (days === 365) return format.oneYear();
  if (days % 365 === 0) {
    const count = days / 365;
    return format.years(count);
  }
  if (days === 30) return format.thirtyDays();
  return format.days(days);
}
