"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import type { StudentProfileKpis } from "@/modules/student/domain/profile/profile.types";
import { STUDENT_PROFILE_ASSETS } from "@/modules/student/presentation/components/profile/student-profile.assets";
import { cn } from "@/shared/application/lib/cn";

type ProfileKpiRowProps = {
  kpis: StudentProfileKpis;
};

type KpiCardProps = {
  value: string;
  label: string;
  borderClass: string;
  iconSrc: string;
  iconWrapClass: string;
  badge?: string;
  badgeClass?: string;
};

function KpiCard({
  value,
  label,
  borderClass,
  iconSrc,
  iconWrapClass,
  badge,
  badgeClass,
}: KpiCardProps) {
  return (
    <article
      className={cn(
        "flex flex-col gap-1 rounded-3xl border-b-8 bg-white px-6 pb-8 pt-6 shadow-[0px_8px_0px_rgba(0,0,0,0.05)]",
        borderClass,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        {badge ? (
          <span className={cn("rounded-lg px-2 py-1 text-xs font-bold", badgeClass)}>
            {badge}
          </span>
        ) : (
          <span />
        )}
        <span
          className={cn(
            "flex size-12 shrink-0 items-center justify-center rounded-2xl",
            iconWrapClass,
          )}
        >
          <span className="relative size-5 overflow-hidden">
            <Image src={iconSrc} alt="" fill unoptimized className="object-contain" />
          </span>
        </span>
      </div>
      <p className="pt-5 text-end text-4xl font-bold leading-10 text-[#2b415e]">{value}</p>
      <p className="text-end text-sm font-medium text-[#64748b]">{label}</p>
    </article>
  );
}

export function ProfileKpiRow({ kpis }: ProfileKpiRowProps) {
  const t = useTranslations("student.dashboard.profile.kpis");
  const progressLabel =
    kpis.overallProgressPercentage >= 70
      ? t("excellent")
      : kpis.overallProgressPercentage >= 40
        ? t("good")
        : t("keepGoing");

  return (
    <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        value={
          kpis.completedStations == null ? "—" : String(kpis.completedStations)
        }
        label={t("completedStations")}
        borderClass="border-[#2b415e]"
        iconSrc={STUDENT_PROFILE_ASSETS.stations}
        iconWrapClass="bg-[rgba(43,65,94,0.1)]"
      />
      <KpiCard
        value={`${kpis.overallProgressPercentage}%`}
        label={t("progressRate")}
        borderClass="border-[#58cc02]"
        iconSrc={STUDENT_PROFILE_ASSETS.progress}
        iconWrapClass="bg-[rgba(88,204,2,0.1)]"
        badge={progressLabel}
        badgeClass="bg-[rgba(88,204,2,0.1)] text-[#58cc02]"
      />
      <KpiCard
        value={String(kpis.liveSessionsAttended)}
        label={t("liveSessions")}
        borderClass="border-[#c7af6d]"
        iconSrc={STUDENT_PROFILE_ASSETS.live}
        iconWrapClass="bg-[rgba(199,175,109,0.1)]"
      />
      <KpiCard
        value={String(kpis.quizzesCompleted)}
        label={t("completedQuizzes")}
        borderClass="border-[#ff4b4b]"
        iconSrc={STUDENT_PROFILE_ASSETS.quiz}
        iconWrapClass="bg-[rgba(255,75,75,0.1)]"
      />
    </section>
  );
}
