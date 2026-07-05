"use client";

import { useTranslations } from "next-intl";
import { JOURNEY_ASSETS } from "./journey.assets";

type ProgressPathBannerProps = {
  pathTitle: string;
  pathIndex: number | null;
  progress: number;
  subjectLabel?: string;
};

export function ProgressPathBanner({
  pathTitle,
  pathIndex,
  progress,
  subjectLabel,
}: ProgressPathBannerProps) {
  const t = useTranslations("student.dashboard.progressPath.banner");
  const clampedProgress = Math.min(100, Math.max(0, Math.round(progress)));

  return (
    <div className="mx-4 overflow-hidden rounded-[25px] bg-[#2b415e] shadow-[0px_21px_26px_-5px_rgba(0,0,0,0.1),0px_8px_10px_-6px_rgba(0,0,0,0.1)] md:mx-6">
      <div className="flex items-start gap-4 p-5 md:p-6">
        <div className="flex min-w-0 flex-1 flex-col items-start gap-2">
          {pathIndex !== null ? (
            <span className="rounded-full border border-[#c7af6d]/50 bg-[#c7af6d]/25 px-3 py-1 text-xs font-bold text-[#c7af6d]">
              {t("unit", { index: pathIndex })}
            </span>
          ) : subjectLabel ? (
            <span className="rounded-full border border-[#c7af6d]/50 bg-[#c7af6d]/25 px-3 py-1 text-xs font-bold text-[#c7af6d]">
              {subjectLabel}
            </span>
          ) : null}
          <h2 className="text-start text-lg font-bold leading-tight text-white md:text-2xl">
            {pathTitle}
          </h2>
        </div>

        <div className="flex size-14 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={JOURNEY_ASSETS.stations.iconPath}
            alt=""
            className="size-7 object-contain"
            aria-hidden
          />
        </div>
      </div>

      <div className="flex items-center gap-4 px-5 pb-5 md:px-6 md:pb-6">
        <span className="shrink-0 text-sm font-bold text-white">
          {t("progress", { value: clampedProgress })}
        </span>
        <div className="h-3 flex-1 overflow-hidden rounded-full bg-white/20">
          <div
            className="h-full rounded-full bg-[#c7af6d] transition-all duration-700 ease-out"
            style={{ width: `${clampedProgress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
