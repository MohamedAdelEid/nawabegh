"use client";

import Image from "next/image";
import { useCallback, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Share2, UserRound } from "lucide-react";
import type { StudentMyProfile } from "@/modules/student/domain/types/student-home.types";
import {
  formatProfileJoinDate,
  formatProfilePoints,
} from "@/modules/student/domain/profile/profile.utils";
import { STUDENT_PROFILE_ASSETS } from "@/modules/student/presentation/components/profile/student-profile.assets";
import { ROUTES } from "@/shared/infrastructure/config/routes";

type ProfileHeroProps = {
  profile: StudentMyProfile;
  totalPoints: number;
  badgeCount: number;
};

export function ProfileHero({ profile, totalPoints, badgeCount }: ProfileHeroProps) {
  const t = useTranslations("student.dashboard.profile");
  const locale = useLocale();
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  const gradeSchoolLine = [profile.gradeName, profile.schoolName]
    .filter(Boolean)
    .join(" - ");

  const handleShare = useCallback(async () => {
    const shareUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}${ROUTES.USER.STUDENT.PROFILE}`
        : ROUTES.USER.STUDENT.PROFILE;

    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: profile.fullName, url: shareUrl });
        return;
      }
      await navigator.clipboard.writeText(shareUrl);
      setShareFeedback(t("share.copied"));
      window.setTimeout(() => setShareFeedback(null), 2500);
    } catch {
      setShareFeedback(t("share.failed"));
      window.setTimeout(() => setShareFeedback(null), 2500);
    }
  }, [profile.fullName, t]);

  return (
    <section className="grid gap-8 lg:grid-cols-3">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center justify-center rounded-3xl bg-[#2b415e] p-6 shadow-[0px_8px_0px_rgba(0,0,0,0.05)]">
          <div className="relative mb-2 size-[33px] overflow-hidden">
            <Image
              src={STUDENT_PROFILE_ASSETS.points}
              alt=""
              fill
              unoptimized
              className="object-contain"
            />
          </div>
          <p className="text-[30px] font-bold leading-9 text-white">
            {formatProfilePoints(totalPoints, locale)}
          </p>
          <p className="mt-1 text-xs font-bold uppercase tracking-[1.2px] text-white/70">
            {t("hero.totalPoints")}
          </p>
        </div>

        <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-[#e2e8f0] bg-white p-6 shadow-[0px_8px_0px_rgba(0,0,0,0.05)]">
          <div className="relative mb-2 h-[30px] w-[15px] overflow-hidden">
            <Image
              src={STUDENT_PROFILE_ASSETS.badgeCup}
              alt=""
              fill
              unoptimized
              className="object-contain"
            />
          </div>
          <p className="text-[30px] font-bold leading-9 text-[#2b415e]">{badgeCount}</p>
          <p className="mt-1 text-xs font-bold uppercase tracking-[1.2px] text-[#64748b]">
            {t("hero.earnedBadges")}
          </p>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-3xl bg-white p-8 shadow-[0px_8px_0px_rgba(0,0,0,0.05)] lg:col-span-2">
        <div className="pointer-events-none absolute -inset-e-10 -top-10 size-32 rounded-es-full bg-[rgba(43,65,94,0.05)]" />
        <div className="relative flex flex-col-reverse items-center gap-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-col items-center gap-3 text-center sm:items-end sm:text-end">
            <h1 className="text-[30px] font-bold leading-9 text-[#2b415e]">
              {profile.fullName || t("fallbackName")}
            </h1>

            {gradeSchoolLine ? (
              <div className="flex items-center gap-2 text-base text-[#64748b]">
                <span>{gradeSchoolLine}</span>
                <span className="relative inline-block size-3 overflow-hidden">
                  <Image
                    src={STUDENT_PROFILE_ASSETS.location}
                    alt=""
                    fill
                    unoptimized
                    className="object-contain"
                  />
                </span>
              </div>
            ) : null}

            <div className="flex flex-wrap items-center justify-center gap-4 sm:justify-end">
              <span className="rounded-lg bg-[#f4ecd8] px-4 py-1.5 text-xs font-bold text-[#a38f5a] shadow-sm">
                {t("hero.platinum")}
              </span>
              <span className="rounded-lg border border-[#e2e8f0] bg-[#f1f3f5] px-4 py-1.5 text-xs text-[#64748b]">
                {t("hero.memberSince", {
                  date: formatProfileJoinDate(profile.createdAt, locale),
                })}
              </span>
              <button
                type="button"
                onClick={() => void handleShare()}
                className="inline-flex items-center gap-2 rounded-lg border border-[#e2e8f0] bg-white px-3 py-1.5 text-xs font-bold text-[#2b415e] transition hover:bg-[#f8fafc]"
              >
                <Share2 className="size-3.5" aria-hidden />
                {t("share.action")}
              </button>
            </div>
            {shareFeedback ? (
              <p className="text-xs text-[#64748b]" role="status">
                {shareFeedback}
              </p>
            ) : null}
          </div>

          <div className="relative shrink-0">
            <div className="flex size-40 items-center justify-center rounded-3xl border-4 border-[#c7af6d] p-2">
              <div className="relative size-full overflow-hidden rounded-[20px] bg-[#dbe3f3]">
                {profile.profileImageUrl ? (
                  <Image
                    src={profile.profileImageUrl}
                    alt=""
                    fill
                    unoptimized
                    className="object-cover"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center">
                    <UserRound className="size-16 text-[#94a3b8]" aria-hidden />
                  </div>
                )}
              </div>
            </div>
            <span className="absolute -bottom-2 -inset-e-2 rounded-full bg-[#58cc02] px-4 py-1 text-xs font-bold text-white shadow-lg">
              {t("hero.activeNow")}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
