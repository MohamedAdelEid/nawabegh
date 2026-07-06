"use client";

import Link from "next/link";
import { Radio } from "lucide-react";
import { useTranslations } from "next-intl";
import type { CurrentStationsDto } from "@/modules/student/domain/types/student-home.types";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { ChallengeCard, LiveSessionCard } from "./LiveSessionCard";
import { HomeSectionHeader } from "./HomeSectionHeader";

type LiveSessionsSectionProps = {
  data?: CurrentStationsDto;
  isLoading?: boolean;
};

export function LiveSessionsSection({ data, isLoading }: LiveSessionsSectionProps) {
  const t = useTranslations("student.dashboard.home.liveSessions");

  const items = [
    ...(data?.liveSessions ?? []).map((session) => ({
      key: session.liveSessionId,
      type: "live" as const,
      session,
    })),
    ...(data?.challenges ?? []).map((challenge) => ({
      key: challenge.challengeId,
      type: "challenge" as const,
      challenge,
    })),
  ];

  if (isLoading) {
    return (
      <section className="space-y-6">
        <HomeSectionHeader title={t("title")} icon={<Radio className="size-5 text-[#ff4b4b]" />} />
        <div className="grid gap-6 md:grid-cols-2">
          <div className="h-[148px] animate-pulse rounded-2xl bg-white/70" />
          <div className="h-[148px] animate-pulse rounded-2xl bg-white/70" />
        </div>
      </section>
    );
  }

  if (!items.length) {
    return (
      <section className="space-y-6">
        <HomeSectionHeader
          title={t("title")}
          icon={<Radio className="size-5 text-[#ff4b4b]" />}
          viewAllHref={ROUTES.USER.STUDENT.COURSES}
          viewAllLabel={t("viewAll")}
        />
        <div className="rounded-2xl border-2 border-dashed border-[#e2e8f0] bg-white p-8 text-center">
          <p className="text-sm text-[#64748b]">{t("empty")}</p>
          <Link
            href={ROUTES.USER.STUDENT.COURSES}
            className="mt-4 inline-flex rounded-lg bg-[#2b415e] px-4 py-2 text-sm font-bold text-white"
          >
            {t("exploreCourses")}
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <HomeSectionHeader
        title={t("title")}
        icon={<Radio className="size-5 text-[#ff4b4b]" />}
        viewAllHref={ROUTES.USER.STUDENT.JOURNEY}
        viewAllLabel={t("viewAll")}
      />
      <div className="grid gap-6 md:grid-cols-2">
        {items.map((item) =>
          item.type === "live" ? (
            <LiveSessionCard key={item.key} session={item.session} />
          ) : (
            <ChallengeCard key={item.key} challenge={item.challenge} />
          ),
        )}
      </div>
    </section>
  );
}
