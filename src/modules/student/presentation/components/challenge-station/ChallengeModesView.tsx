"use client";

import Image from "next/image";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { ChallengeType } from "@/modules/student/domain/challenge-station/challenge-station.enums";
import type { ChallengeOverviewDto } from "@/modules/student/domain/challenge-station/challenge-station.types";
import { cn } from "@/shared/application/lib/cn";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { CHALLENGE_STATION_ASSETS } from "./challenge-station.assets";

type ChallengeModesViewProps = {
  overview: ChallengeOverviewDto;
  courseTitle: string | null;
  busy: boolean;
  errorMessage: string | null;
  onStartQuickOrRanked: () => void;
  onStartPractice: () => void;
  pathId?: string | null;
  courseId?: string | null;
};

export function ChallengeModesView({
  overview,
  busy,
  errorMessage,
  onStartQuickOrRanked,
  onStartPractice,
  pathId,
  courseId,
}: ChallengeModesViewProps) {
  const t = useTranslations("student.dashboard.challengeStation");
  const canEnter = overview.canEnter;
  const points = overview.pointsReward;
  const duration = overview.durationMinutes;

  const journeyHref = (() => {
    const params = new URLSearchParams();
    if (courseId) params.set("courseId", courseId);
    if (pathId) params.set("pathId", pathId);
    const qs = params.toString();
    return qs ? `${ROUTES.USER.STUDENT.JOURNEY}?${qs}` : ROUTES.USER.STUDENT.JOURNEY;
  })();

  return (
    <div className="min-h-screen bg-[#f6f7f7] px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="space-y-2 text-start">
          <nav className="text-sm text-[#94a3b8]">
            <Link href={ROUTES.USER.STUDENT.HOME} className="hover:text-[#2b415e]">
              {t("breadcrumb.home")}
            </Link>
            <span className="mx-2">›</span>
            <span className="text-[#2b415e]">{t("breadcrumb.challenge")}</span>
          </nav>
          <h1 className="text-3xl font-bold text-[#2b415e] sm:text-4xl">
            {overview.title || t("modes.titleFallback")}
          </h1>
          <p className="max-w-2xl text-base text-[#64748b]">{t("modes.subtitle")}</p>
          {overview.blockReason ? (
            <p className="rounded-xl bg-[#ffe4e4] px-4 py-2 text-sm text-[#ff4b4b]">
              {overview.blockReason}
            </p>
          ) : null}
          {errorMessage ? (
            <p className="rounded-xl bg-[#ffe4e4] px-4 py-2 text-sm text-[#ff4b4b]">
              {errorMessage}
            </p>
          ) : null}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <ModeCard
            highlighted
            badge={t("modes.quick.difficulty")}
            title={t("modes.quick.title")}
            description={t("modes.quick.description")}
            durationLabel={
              duration <= 1
                ? t("modes.duration.oneMinute")
                : t("modes.duration.minutes", { minutes: duration })
            }
            pointsLabel={`+${points}`}
            ctaLabel={t("modes.quick.cta")}
            ctaVariant="gold"
            disabled={!canEnter || busy || overview.type === ChallengeType.Practice}
            loading={busy}
            iconSrc={CHALLENGE_STATION_ASSETS.quickIcon}
            onClick={onStartQuickOrRanked}
          />

          <ModeCard
            badge={t("modes.ranked.difficulty")}
            badgeTone="danger"
            title={t("modes.ranked.title")}
            description={t("modes.ranked.description")}
            durationLabel={t("modes.duration.minutes", {
              minutes: Math.max(duration, 10),
            })}
            pointsLabel={`+${points}`}
            ctaLabel={t("modes.ranked.cta")}
            ctaVariant="muted"
            disabled={!canEnter || busy}
            loading={busy}
            iconSrc={CHALLENGE_STATION_ASSETS.rankedIcon}
            onClick={onStartQuickOrRanked}
            showTrophy
          />
        </div>

        <ModeCard
          wide
          badge={t("modes.practice.difficulty")}
          badgeTone="info"
          title={t("modes.practice.title")}
          description={t("modes.practice.description")}
          durationLabel={t("modes.duration.unlimited")}
          pointsLabel="+0"
          ctaLabel={t("modes.practice.cta")}
          ctaVariant="muted"
          disabled={busy}
          loading={busy}
          iconSrc={CHALLENGE_STATION_ASSETS.practiceIcon}
          onClick={onStartPractice}
        />

        <div className="flex justify-center pt-2">
          <Link
            href={journeyHref}
            className="text-sm font-semibold text-[#64748b] underline-offset-4 hover:text-[#2b415e] hover:underline"
          >
            {t("modes.backToJourney")}
          </Link>
        </div>
      </div>
    </div>
  );
}

type ModeCardProps = {
  highlighted?: boolean;
  wide?: boolean;
  badge: string;
  badgeTone?: "default" | "danger" | "info";
  title: string;
  description: string;
  durationLabel: string;
  pointsLabel: string;
  ctaLabel: string;
  ctaVariant: "gold" | "muted";
  disabled?: boolean;
  loading?: boolean;
  iconSrc: string;
  showTrophy?: boolean;
  onClick: () => void;
};

function ModeCard({
  highlighted,
  wide,
  badge,
  badgeTone = "default",
  title,
  description,
  durationLabel,
  pointsLabel,
  ctaLabel,
  ctaVariant,
  disabled,
  loading,
  iconSrc,
  showTrophy,
  onClick,
}: ModeCardProps) {
  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-[24px] border-2 p-6 shadow-[0_8px_0_rgba(0,0,0,0.05)]",
        highlighted
          ? "border-transparent bg-[#c7af6d] text-[#271900]"
          : "border-[#f1f5f9] bg-white text-[#2b415e]",
        wide && "md:col-span-2",
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <span
          className={cn(
            "rounded-full px-3 py-1 text-xs font-bold",
            badgeTone === "danger" && "bg-[#ffe4e4] text-[#ff4b4b]",
            badgeTone === "info" && "bg-[#dbe3f3] text-[#2b415e]",
            badgeTone === "default" &&
              (highlighted
                ? "bg-white/30 text-[#271900]"
                : "bg-[#f4ecd8] text-[#a38f5a]"),
          )}
        >
          {badge}
        </span>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "rounded-full px-3 py-1 text-xs font-bold",
              highlighted ? "bg-[#271900]/20" : "bg-[#f4ecd8] text-[#a38f5a]",
            )}
          >
            {pointsLabel}
          </span>
          {showTrophy ? (
            <span className="relative size-8 overflow-hidden">
              <Image
                src={CHALLENGE_STATION_ASSETS.trophy}
                alt=""
                fill
                className="object-contain"
                unoptimized
              />
            </span>
          ) : null}
        </div>
      </div>

      <div className={cn("mb-4", wide ? "flex items-center gap-4" : "text-center")}>
        <div
          className={cn(
            "relative mx-auto mb-3 size-14 overflow-hidden",
            wide && "mx-0 mb-0 shrink-0 rounded-full bg-[#dbe3f3] p-3",
          )}
        >
          <Image src={iconSrc} alt="" fill className="object-contain" unoptimized />
        </div>
        <div className={cn(!wide && "space-y-2", wide && "space-y-1 text-start")}>
          <h2 className="text-2xl font-bold">{title}</h2>
          <p
            className={cn(
              "text-sm leading-relaxed",
              highlighted ? "text-[#271900]/80" : "text-[#64748b]",
            )}
          >
            {description}
          </p>
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 pt-2">
        <div
          className={cn(
            "flex items-center gap-2 text-sm font-semibold",
            highlighted ? "text-[#271900]/80" : "text-[#64748b]",
          )}
        >
          <span className="relative size-4 overflow-hidden">
            <Image
              src={CHALLENGE_STATION_ASSETS.clock}
              alt=""
              fill
              className="object-contain"
              unoptimized
            />
          </span>
          {durationLabel}
        </div>
        <button
          type="button"
          disabled={disabled}
          onClick={onClick}
          className={cn(
            "inline-flex min-w-[140px] items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50",
            ctaVariant === "gold" &&
              "bg-white text-[#2b415e] shadow-[0_4px_0_rgba(0,0,0,0.08)]",
            ctaVariant === "muted" &&
              "bg-[#e9ecef] text-[#2b415e] shadow-[0_4px_0_#cbd5e1]",
          )}
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : null}
          {ctaLabel}
        </button>
      </div>
    </article>
  );
}
