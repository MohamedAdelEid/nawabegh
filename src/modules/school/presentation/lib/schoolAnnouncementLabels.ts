import type { useTranslations } from "next-intl";
import type { DashboardBadgeTone } from "@/shared/presentation/components/dashboard/DashboardBadge";
import type {
  SchoolAnnouncementAudience,
  SchoolAnnouncementStatusTone,
} from "@/modules/school/domain/types/schoolAnnouncements.types";

type Translate = ReturnType<typeof useTranslations>;

const STATUS_BADGE_TONE: Record<SchoolAnnouncementStatusTone, DashboardBadgeTone> = {
  published: "success",
  urgent: "danger",
  scheduled: "gold",
  draft: "neutral",
  sending: "info",
  success: "success",
  failed: "danger",
};

export function statusBadgeTone(tone: SchoolAnnouncementStatusTone): DashboardBadgeTone {
  return STATUS_BADGE_TONE[tone];
}

/** Prefer the localized i18n label, falling back to the API-provided label. */
export function statusText(
  t: Translate,
  tone: SchoolAnnouncementStatusTone,
  apiLabel?: string,
): string {
  const key = `status.${tone}`;
  const translated = t(key);
  if (translated && translated !== key) return translated;
  return apiLabel || translated;
}

export function audienceText(
  t: Translate,
  audience: SchoolAnnouncementAudience,
  apiLabel?: string,
): string {
  const key = `audience.${audience}`;
  const translated = t(key);
  if (translated && translated !== key) return translated;
  return apiLabel || translated;
}
