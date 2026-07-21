"use client";

import Image from "next/image";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatChallengeTimer } from "@/modules/student/domain/challenge-station/challenge-station.utils";
import { CHALLENGE_STATION_ASSETS } from "./challenge-station.assets";

type ChallengeArenaHeaderProps = {
  questionLabel: string;
  remainingSeconds: number;
  onClose: () => void;
};

export function ChallengeArenaHeader({
  questionLabel,
  remainingSeconds,
  onClose,
}: ChallengeArenaHeaderProps) {
  const t = useTranslations("student.dashboard.challengeStation.arena");

  return (
    <header className="flex items-center justify-between border-b-4 border-[#f1f5f9] bg-white/80 px-6 py-4 backdrop-blur-sm">
      <div className="flex items-center gap-4">
        <div className="rounded-full bg-[#dbe3f3] px-4 py-2 text-sm font-semibold text-[#2b415e] shadow-[0_4px_0_#1e2e42]">
          {questionLabel}
        </div>
        <div className="flex items-center gap-2 rounded-full bg-[#f4ecd8] px-4 py-2 text-sm font-semibold text-[#a38f5a] shadow-[0_4px_0_#a38f5a]">
          <span>{formatChallengeTimer(remainingSeconds)}</span>
          <span className="relative size-4 overflow-hidden">
            <Image
              src={CHALLENGE_STATION_ASSETS.clock}
              alt=""
              fill
              className="object-contain"
              unoptimized
            />
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-start">
          <h1 className="text-lg font-bold tracking-tight text-[#2b415e]">
            {t("title")}
          </h1>
          <p className="text-[10px] text-[#64748b]">{t("subtitle")}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex size-10 items-center justify-center rounded-xl bg-[#e9ecef] text-[#64748b] transition hover:bg-[#dee2e6]"
          aria-label={t("close")}
        >
          <X className="size-4" />
        </button>
      </div>
    </header>
  );
}
