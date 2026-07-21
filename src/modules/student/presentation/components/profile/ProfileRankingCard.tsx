"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import type { StudentSchoolRankDto } from "@/modules/student/domain/profile/profile.types";
import { STUDENT_PROFILE_ASSETS } from "@/modules/student/presentation/components/profile/student-profile.assets";

type ProfileRankingCardProps = {
  schoolRank: StudentSchoolRankDto | null | undefined;
  platformRank: number | null;
  schoolNameFallback: string;
};

function RankRow({
  title,
  subtitle,
  rankLabel,
  rankClass,
  trendSrc,
}: {
  title: string;
  subtitle: string;
  rankLabel: string;
  rankClass: string;
  trendSrc: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-6 py-6">
      <span className="relative inline-block h-[8px] w-3 overflow-hidden">
        <Image src={trendSrc} alt="" fill unoptimized className="object-contain" />
      </span>
      <div className="flex items-center gap-4">
        <div className="text-end">
          <p className="text-base font-bold text-[#2b415e]">{title}</p>
          <p className="text-xs text-[#64748b]">{subtitle}</p>
        </div>
        <span
          className={`flex size-12 items-center justify-center rounded-full text-lg font-bold ${rankClass}`}
        >
          {rankLabel}
        </span>
      </div>
    </div>
  );
}

export function ProfileRankingCard({
  schoolRank,
  platformRank,
  schoolNameFallback,
}: ProfileRankingCardProps) {
  const t = useTranslations("student.dashboard.profile.ranking");

  const schoolRankLabel =
    schoolRank?.rank != null ? `#${schoolRank.rank}` : "—";
  const platformRankLabel = platformRank != null ? `#${platformRank}` : "—";

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-bold text-[#2b415e]">{t("title")}</h2>
        <span className="relative inline-block h-[18px] w-5 overflow-hidden">
          <Image
            src={STUDENT_PROFILE_ASSETS.ranking}
            alt=""
            fill
            unoptimized
            className="object-contain"
          />
        </span>
      </div>

      <div className="overflow-hidden rounded-3xl bg-white shadow-[0px_8px_0px_rgba(0,0,0,0.05)]">
        <RankRow
          title={t("school")}
          subtitle={schoolRank?.schoolName || schoolNameFallback || t("schoolFallback")}
          rankLabel={schoolRankLabel}
          rankClass="bg-[#f4ecd8] text-[#a38f5a]"
          trendSrc={STUDENT_PROFILE_ASSETS.rankUp}
        />
        <div className="border-t-2 border-[#f6f7f7]">
          <RankRow
            title={t("platform")}
            subtitle={t("platformSubtitle")}
            rankLabel={platformRankLabel}
            rankClass="bg-[#dbe3f3] text-[#1e2e42]"
            trendSrc={STUDENT_PROFILE_ASSETS.rankDown}
          />
        </div>
      </div>
    </section>
  );
}
