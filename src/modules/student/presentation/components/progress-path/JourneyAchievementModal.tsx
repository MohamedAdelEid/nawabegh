"use client";

import { Star } from "lucide-react";
import { useTranslations } from "next-intl";
import type { JourneyCompletionNotice } from "@/modules/student/domain/progress/progress.types";
import {
  ModalDescription,
  ModalShell,
  ModalTitle,
} from "@/shared/presentation/components/ui/modal-shell";
import { JOURNEY_ASSETS } from "./journey.assets";

type JourneyAchievementModalProps = {
  open: boolean;
  notice: JourneyCompletionNotice | null;
  onOpenChange: (open: boolean) => void;
  onPrimary: () => void;
  onSecondary: () => void;
};

export function JourneyAchievementModal({
  open,
  notice,
  onOpenChange,
  onPrimary,
  onSecondary,
}: JourneyAchievementModalProps) {
  const t = useTranslations("student.dashboard.progressPath.achievement");
  if (!notice) return null;

  const isPath = notice.variant === "path";
  const progressPercent = Math.round(notice.levelProgress * 100);

  return (
    <ModalShell
      open={open}
      onOpenChange={onOpenChange}
      overlayClassName="bg-[rgba(44,66,96,0.6)] backdrop-blur-[2px]"
      panelClassName="max-w-[512px] overflow-hidden rounded-[40px] border-0 p-8 shadow-[0px_20px_0px_0px_rgba(43,65,94,0.05)]"
    >
      <div className="relative flex flex-col items-center">
        <div className="pointer-events-none absolute inset-0 opacity-20" aria-hidden />

        <div className="relative mb-6 flex flex-col items-center pb-2">
          <div className="absolute -inset-10 rounded-full bg-[#c7af6d]/20 blur-[20px]" aria-hidden />
          <div className="relative flex size-40 items-center justify-center rounded-full border-4 border-white bg-[#f4ecd8] shadow-[0px_8px_0px_#a38f5a]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={JOURNEY_ASSETS.trophy}
              alt=""
              className="size-[85px] object-contain"
              aria-hidden
            />
          </div>
          <span className="absolute -bottom-1 -end-1 flex items-center gap-1 rounded-full bg-[#58cc02] px-3 py-1 shadow-lg">
            <Star className="size-3 fill-white text-white" aria-hidden />
            <span className="text-xs font-bold text-white">{t("newLevel")}</span>
          </span>
        </div>

        <ModalTitle className="mb-2 text-center text-[28px] font-bold leading-tight text-[#2b415e] md:text-[30px]">
          {isPath ? t("pathTitle") : t("title")}
        </ModalTitle>
        <ModalDescription className="mb-8 text-center text-base font-medium text-[#64748b]">
          {t("subtitle")}
        </ModalDescription>

        <div className="mb-8 flex w-full items-center justify-between rounded-2xl border-2 border-[#c7af6d]/20 bg-[rgba(244,236,216,0.5)] p-[22px]">
          <div className="flex flex-1 items-center gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#c7af6d] shadow-[0px_4px_0px_#a38f5a]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={JOURNEY_ASSETS.coin}
                alt=""
                className="size-6 object-contain"
                aria-hidden
              />
            </div>
            <div className="min-w-0 text-start">
              <p className="text-sm font-semibold text-[#a38f5a]">{t("rewardLabel")}</p>
              <p className="text-2xl font-bold text-[#2b415e]">
                {t("pointsEarned", { points: notice.pointsEarned })}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-10 w-full space-y-3">
          <div className="flex items-end justify-between gap-3">
            <p className="text-sm font-bold text-[#2b415e]">
              {t("level", { level: notice.currentLevel })}
            </p>
            <p className="text-xs text-[#94a3b8]">
              {t("pointsToNext", { points: notice.pointsToNextLevel })}
            </p>
          </div>
          <div className="h-4 overflow-hidden rounded-full bg-[#f1f5f9]">
            <div
              className="relative h-full rounded-full bg-[#58cc02] transition-all duration-700"
              style={{ width: `${progressPercent}%` }}
            >
              <div className="absolute inset-x-0 top-0.5 mx-auto h-1 w-[90%] rounded-full bg-white/30" />
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col gap-4">
          <button
            type="button"
            onClick={onPrimary}
            className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[#c7af6d] py-4 text-lg font-bold text-white shadow-[0px_4px_0px_#8a733c] transition hover:brightness-105 active:translate-y-0.5 active:shadow-none"
          >
            {isPath ? t("pathPrimary") : t("primary")}
          </button>
          <button
            type="button"
            onClick={onSecondary}
            className="w-full rounded-2xl border-2 border-[#e2e8f0] bg-transparent py-[18px] text-base font-bold text-[#2b415e] shadow-[0px_4px_0px_0px_#cbd5e1] transition hover:bg-[#f8fafc] active:translate-y-0.5 active:shadow-none"
          >
            {isPath ? t("pathSecondary") : t("secondary")}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}
