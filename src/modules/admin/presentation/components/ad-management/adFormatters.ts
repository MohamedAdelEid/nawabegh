import type { AdDisplayType, AdLifecycleStatus, AdTargetAudience } from "@/modules/admin/domain/types/adManagement.types";

export function adStatusTone(status: AdLifecycleStatus) {
  switch (status) {
    case "active":
      return "success" as const;
    case "scheduled":
      return "info" as const;
    case "expired":
      return "neutral" as const;
    case "paused":
      return "warning" as const;
    default:
      return "neutral" as const;
  }
}

export function formatCompactNumber(value: number, locale: string): string {
  if (value >= 1000) {
    return new Intl.NumberFormat(locale, {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  }
  return new Intl.NumberFormat(locale).format(value);
}

export function audienceLabelKey(audience: AdTargetAudience): string {
  return `adManagement.audiences.${audience}`;
}

export function typeLabelKey(type: AdDisplayType): string {
  return `adManagement.types.${type}`;
}

export function statusLabelKey(status: AdLifecycleStatus): string {
  return `adManagement.statuses.${status}`;
}
