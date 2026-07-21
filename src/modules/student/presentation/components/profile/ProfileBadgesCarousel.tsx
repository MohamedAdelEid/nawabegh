"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Award } from "lucide-react";
import type { StudentProfileBadge } from "@/modules/student/domain/profile/profile.types";
import { STUDENT_PROFILE_ASSETS } from "@/modules/student/presentation/components/profile/student-profile.assets";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { cn } from "@/shared/application/lib/cn";

type ProfileBadgesCarouselProps = {
  badges: StudentProfileBadge[];
};

const BADGE_BG = ["bg-[#fefce8]", "bg-[#eff6ff]", "bg-[#f0fdf4]", "bg-[#f4ecd8]"] as const;

export function ProfileBadgesCarousel({ badges }: ProfileBadgesCarouselProps) {
  const t = useTranslations("student.dashboard.profile.badges");
  const visible = badges.slice(0, 4);

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Link
          href={ROUTES.USER.STUDENT.CHALLENGE_HUB}
          className="text-sm font-bold text-[#2b415e] transition hover:opacity-80"
        >
          {t("viewAll")}
        </Link>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-[#2b415e]">{t("title")}</h2>
          <span className="relative inline-block h-[21px] w-4 overflow-hidden">
            <Image
              src={STUDENT_PROFILE_ASSETS.medals}
              alt=""
              fill
              unoptimized
              className="object-contain"
            />
          </span>
        </div>
      </div>

      {visible.length > 0 ? (
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {visible.map((badge, index) => (
            <article
              key={badge.badgeId}
              className="relative flex flex-col items-center gap-4 rounded-3xl border border-[#e2e8f0] bg-white p-6 shadow-[0px_8px_0px_rgba(0,0,0,0.05)]"
            >
              {badge.isNew ? (
                <span className="absolute -end-1 -top-1 rounded-full bg-[#2b415e] px-3 py-1 text-[10px] font-bold text-white">
                  {t("new")}
                </span>
              ) : null}
              <div
                className={cn(
                  "flex size-20 items-center justify-center rounded-full shadow-[inset_0px_2px_4px_rgba(0,0,0,0.05)]",
                  BADGE_BG[index % BADGE_BG.length],
                )}
              >
                {badge.iconUrl ? (
                  <span className="relative size-9 overflow-hidden">
                    <Image
                      src={badge.iconUrl}
                      alt=""
                      fill
                      unoptimized
                      className="object-contain"
                    />
                  </span>
                ) : (
                  <Award className="size-8 text-[#c7af6d]" aria-hidden />
                )}
              </div>
              <p className="text-center text-sm font-bold leading-5 text-[#2b415e]">
                {badge.name}
              </p>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-[#cbd5e1] bg-[#f8fafc] px-6 py-12 text-center text-sm text-[#64748b]">
          {t("empty")}
        </div>
      )}
    </section>
  );
}
