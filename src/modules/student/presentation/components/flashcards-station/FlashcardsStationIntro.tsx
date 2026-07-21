"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { FLASHCARDS_STATION_ASSETS } from "./flashcards-station.assets";
import type { FlashcardsStationHeaderContext } from "@/modules/student/domain/flashcards-station/flashcards-station.types";
import { Button } from "@/shared/presentation/components/ui/button";

type FlashcardsStationIntroProps = {
  header: FlashcardsStationHeaderContext;
  title: string;
  cardCount: number;
  estimatedMinutes: number;
  isStarting: boolean;
  onStart: () => void;
};

export function FlashcardsStationIntro({
  header,
  title,
  cardCount,
  estimatedMinutes,
  isStarting,
  onStart,
}: FlashcardsStationIntroProps) {
  const t = useTranslations("student.dashboard.flashcardsStation");

  return (
    <div className="mx-auto flex w-full max-w-[672px] flex-col items-center px-4 py-10 md:py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative w-full overflow-hidden rounded-[20px] bg-white shadow-[0px_8px_0px_0px_rgba(0,0,0,0.05)]"
      >
        <div className="absolute inset-x-0 top-0 h-2 bg-[#c7af6d]" />

        <div className="flex flex-col items-center px-6 pb-8 pt-12 md:px-12">
          <div className="relative mb-8 size-24">
            <Image
              src={FLASHCARDS_STATION_ASSETS.ring}
              alt=""
              width={96}
              height={96}
              className="size-full -rotate-90 opacity-90"
              unoptimized
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative size-[74px] overflow-hidden rounded-full border-4 border-white bg-[#e2e8f0]">
                {header.avatarUrl ? (
                  <Image
                    src={header.avatarUrl}
                    alt=""
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : null}
              </div>
            </div>
            <span className="absolute -bottom-1 -end-1 rounded-full border-2 border-white bg-[#c7af6d] px-2.5 py-0.5 text-[10px] font-bold text-[#271900]">
              {t("header.levelShort", { level: header.currentLevel })}
            </span>
          </div>

          <h1 className="mb-3 text-center text-2xl font-bold text-[#2b415e] md:text-[30px] md:leading-9">
            {t("intro.title", { name: title })}
          </h1>
          <p className="mb-6 max-w-[480px] text-center text-base text-[#64748b] md:text-lg">
            {t("intro.description")}
          </p>

          <div className="mb-6 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#e2e8f0] bg-[#f8f9fa] px-4 py-4">
            <Image
              src={FLASHCARDS_STATION_ASSETS.info}
              alt=""
              width={20}
              height={20}
              className="size-5 shrink-0"
              unoptimized
            />
            <p className="text-center text-sm font-medium text-[#2b415e] md:text-base">
              {t("intro.swipeHint")}
            </p>
          </div>

          <div className="mb-8 grid w-full grid-cols-2 gap-4">
            <div className="flex flex-col items-center rounded-2xl bg-[#f1f5f9] p-4">
              <Image
                src={FLASHCARDS_STATION_ASSETS.timer}
                alt=""
                width={18}
                height={21}
                className="mb-1 h-[21px] w-[18px]"
                unoptimized
              />
              <p className="text-xs text-[#64748b]">{t("intro.estimatedTime")}</p>
              <p className="text-xl font-bold text-[#2b415e]">
                {t("intro.minutes", { count: estimatedMinutes })}
              </p>
            </div>
            <div className="flex flex-col items-center rounded-2xl bg-[#f1f5f9] p-4">
              <Image
                src={FLASHCARDS_STATION_ASSETS.cards}
                alt=""
                width={20}
                height={19}
                className="mb-1 h-[19px] w-5"
                unoptimized
              />
              <p className="text-xs text-[#64748b]">{t("intro.cardCount")}</p>
              <p className="text-xl font-bold text-[#2b415e]">{cardCount}</p>
            </div>
          </div>

          <Button
            type="button"
            onClick={onStart}
            disabled={isStarting || cardCount <= 0}
            className="flex h-auto w-full items-center justify-center gap-3 rounded-2xl bg-[#2c4260] py-5 text-xl font-bold text-white shadow-[0px_4px_0px_#c7af6d] hover:bg-[#243650] disabled:opacity-60"
          >
            <Image
              src={FLASHCARDS_STATION_ASSETS.play}
              alt=""
              width={11}
              height={14}
              className="h-[14px] w-[11px]"
              unoptimized
            />
            {isStarting ? t("intro.starting") : t("intro.start")}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
