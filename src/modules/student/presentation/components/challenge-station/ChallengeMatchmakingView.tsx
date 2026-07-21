"use client";

import Image from "next/image";
import { Loader2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { ChallengeType } from "@/modules/student/domain/challenge-station/challenge-station.enums";
import { cn } from "@/shared/application/lib/cn";
import { CHALLENGE_STATION_ASSETS } from "./challenge-station.assets";

type ChallengeMatchmakingViewProps = {
  challengeType: ChallengeType;
  level: number;
  waitSeconds: number;
  courseTitle: string | null;
  busy: boolean;
  warmupAnswer: string | null;
  onWarmupSelect: (answer: string) => void;
  onCancel: () => void;
};

const WARMUP_OPTIONS = ["49", "54", "56", "64"];

export function ChallengeMatchmakingView({
  challengeType,
  level,
  waitSeconds,
  courseTitle,
  busy,
  warmupAnswer,
  onWarmupSelect,
  onCancel,
}: ChallengeMatchmakingViewProps) {
  const t = useTranslations("student.dashboard.challengeStation.matchmaking");

  const typeLabel =
    challengeType === ChallengeType.RankedMatch
      ? t("type.ranked")
      : challengeType === ChallengeType.Practice
        ? t("type.practice")
        : t("type.quick");

  return (
    <div className="min-h-screen bg-[#f6f7f7] px-4 py-8 sm:px-8">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <article className="rounded-[24px] bg-white p-8 text-center shadow-[0_8px_0_rgba(0,0,0,0.05)]">
          <div className="relative mx-auto mb-6 size-36">
            <div className="absolute inset-0 animate-spin rounded-full border-4 border-[#f4ecd8] border-t-[#c7af6d]" />
            <div className="absolute inset-4 overflow-hidden rounded-full bg-[#f8fafc]">
              <Image
                src={CHALLENGE_STATION_ASSETS.searchPerson}
                alt=""
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-[#2b415e] sm:text-3xl">
            {t("title")}
          </h1>
          <p className="mt-2 text-[#64748b]">{t("subtitle")}</p>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MetaChip label={t("meta.type")} value={typeLabel} />
            <MetaChip label={t("meta.level")} value={String(level)} />
            <MetaChip
              label={t("meta.wait")}
              value={t("meta.waitValue", { seconds: waitSeconds })}
              accent
            />
            <MetaChip
              label={t("meta.subject")}
              value={courseTitle || t("meta.subjectFallback")}
            />
          </div>
        </article>

        <article className="rounded-[24px] border-2 border-[#dcf4cb] bg-white p-6 shadow-[0_8px_0_rgba(0,0,0,0.05)]">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-bold text-[#46a302]">
              <span className="relative size-5 overflow-hidden">
                <Image
                  src={CHALLENGE_STATION_ASSETS.bolt}
                  alt=""
                  fill
                  className="object-contain"
                  unoptimized
                />
              </span>
              {t("warmup.bonus")}
            </div>
            <span className="flex items-center gap-2 text-xs font-semibold text-[#58cc02]">
              <span className="size-2 rounded-full bg-[#58cc02]" />
              {t("warmup.active")}
            </span>
          </div>
          <p className="mb-4 text-start text-lg font-bold text-[#2b415e]">
            {t("warmup.question")}
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {WARMUP_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => onWarmupSelect(option)}
                className={cn(
                  "rounded-2xl border-2 px-4 py-3 text-base font-bold transition",
                  warmupAnswer === option
                    ? "border-[#58cc02] bg-[#dcf4cb] text-[#46a302]"
                    : "border-[#dbe3f3] bg-white text-[#2b415e] hover:border-[#c7af6d]",
                )}
              >
                {option}
              </button>
            ))}
          </div>
        </article>

        <button
          type="button"
          disabled={busy}
          onClick={onCancel}
          className="mx-auto flex items-center gap-2 text-sm font-semibold text-[#64748b] transition hover:text-[#ff4b4b]"
        >
          {busy ? <Loader2 className="size-4 animate-spin" /> : <X className="size-4" />}
          {t("cancel")}
        </button>
      </div>
    </div>
  );
}

function MetaChip({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-2xl bg-[#f6f7f7] px-3 py-3 text-center">
      <p className="text-[10px] font-bold uppercase text-[#94a3b8]">{label}</p>
      <p
        className={cn(
          "mt-1 text-sm font-bold",
          accent ? "text-[#c7af6d]" : "text-[#2b415e]",
        )}
      >
        {value}
      </p>
    </div>
  );
}
