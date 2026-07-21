"use client";

import { useRef } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { motion, useMotionValue, useTransform, type PanInfo } from "framer-motion";
import { Check, ChevronLeft, ChevronRight, ChevronsUp, X } from "lucide-react";
import { FlashcardsStationProgressDots } from "./FlashcardsStationProgressDots";
import { FLASHCARDS_STATION_ASSETS } from "./flashcards-station.assets";
import { FlashcardCardOutcome } from "@/modules/student/domain/flashcards-station/flashcards-station.enums";
import type { FlashcardCardDto } from "@/modules/student/domain/flashcards-station/flashcards-station.types";
import {
  formatFlashcardTimer,
  parseFlashcardBack,
} from "@/modules/student/domain/flashcards-station/flashcards-station.utils";
import { cn } from "@/shared/application/lib/cn";

const SWIPE_THRESHOLD = 120;

type FlashcardsStationPlayProps = {
  card: FlashcardCardDto;
  index: number;
  total: number;
  flipped: boolean;
  cardElapsedSeconds: number;
  outcomes: Record<string, FlashcardCardOutcome>;
  cardIds: string[];
  onFlip: () => void;
  onMark: (outcome: FlashcardCardOutcome) => void;
};

export function FlashcardsStationPlay({
  card,
  index,
  total,
  flipped,
  cardElapsedSeconds,
  outcomes,
  cardIds,
  onFlip,
  onMark,
}: FlashcardsStationPlayProps) {
  const t = useTranslations("student.dashboard.flashcardsStation");
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-8, 8]);
  const correctOpacity = useTransform(x, [40, 140], [0, 1]);
  const wrongOpacity = useTransform(x, [-140, -40], [1, 0]);
  const skipOpacity = useTransform(y, [-140, -40], [1, 0]);
  const dragLocked = useRef(false);

  const { shortAnswer } = parseFlashcardBack(card.back);
  const frontLines = card.front.split("\n").filter(Boolean);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (dragLocked.current || !flipped) return;
    const { offset } = info;

    if (offset.y < -SWIPE_THRESHOLD) {
      dragLocked.current = true;
      onMark(FlashcardCardOutcome.Skipped);
      return;
    }
    if (offset.x > SWIPE_THRESHOLD) {
      dragLocked.current = true;
      onMark(FlashcardCardOutcome.Correct);
      return;
    }
    if (offset.x < -SWIPE_THRESHOLD) {
      dragLocked.current = true;
      onMark(FlashcardCardOutcome.Wrong);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-[512px] flex-1 flex-col items-center px-4 py-8 md:py-16">
      <motion.div
        key={`${card.id}-${flipped ? "back" : "front"}`}
        style={{ x, y, rotate }}
        drag={flipped}
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0.7}
        onDragEnd={handleDragEnd}
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25 }}
        className="relative flex min-h-[350px] w-full cursor-grab flex-col items-center justify-center rounded-[20px] border-2 border-[#e2e8f0] bg-white px-8 py-16 shadow-[0px_8px_0px_rgba(0,0,0,0.05)] active:cursor-grabbing"
      >
        <div className="absolute start-6 top-4 flex items-center gap-1">
          <span className="text-xs font-bold text-[#94a3b8]">
            {formatFlashcardTimer(cardElapsedSeconds)}
          </span>
          <Image
            src={FLASHCARDS_STATION_ASSETS.timer}
            alt=""
            width={15}
            height={18}
            className="h-[18px] w-[15px] opacity-70"
            unoptimized
          />
        </div>

        <p className="absolute end-6 top-5 text-sm font-bold tracking-[1.4px] text-[#94a3b8]">
          {index + 1} / {total}
        </p>

        {flipped ? (
          <>
            <motion.div
              style={{ opacity: correctOpacity }}
              className="pointer-events-none absolute start-4 top-1/2 flex -translate-y-1/2 flex-col items-center gap-1"
            >
              <ChevronRight className="size-5 text-[#58cc02]" />
              <span className="text-xs font-bold text-[#58cc02]">{t("play.correct")}</span>
            </motion.div>
            <motion.div
              style={{ opacity: wrongOpacity }}
              className="pointer-events-none absolute end-4 top-1/2 flex -translate-y-1/2 flex-col items-center gap-1"
            >
              <ChevronLeft className="size-5 text-[#ff4b4b]" />
              <span className="text-xs font-bold text-[#ff4b4b]">{t("play.wrong")}</span>
            </motion.div>
            <motion.div
              style={{ opacity: skipOpacity }}
              className="pointer-events-none absolute inset-x-0 top-4 flex flex-col items-center"
            >
              <ChevronsUp className="size-5 text-[#64748b]" />
              <span className="text-xs font-bold text-[#64748b]">{t("play.skip")}</span>
            </motion.div>
          </>
        ) : null}

        <div className="flex w-full flex-col items-center gap-6 text-center">
          <p className="text-sm font-medium uppercase tracking-[0.35px] text-[#94a3b8]">
            {flipped ? t("play.answerLabel") : t("play.questionLabel")}
          </p>

          {flipped ? (
            <div className="flex flex-col items-center">
              <p className="text-3xl font-bold text-[#2b415e] md:text-4xl">
                {t("play.answerIs")}
              </p>
              <div className="mt-1 border-b-4 border-[#58cc02] pb-2">
                <p className="text-3xl font-bold text-[#58cc02] md:text-4xl">
                  {shortAnswer || card.back}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              {frontLines.map((line, lineIndex) => {
                const isLast = lineIndex === frontLines.length - 1;
                return (
                  <p
                    key={`${card.id}-line-${lineIndex}`}
                    className={cn(
                      "text-3xl font-bold text-[#2b415e] md:text-4xl md:leading-10",
                      isLast && "border-b-4 border-[#c7af6d] pb-2",
                    )}
                  >
                    {line}
                  </p>
                );
              })}
              {card.imageUrl ? (
                <div className="relative mt-4 h-40 w-full max-w-xs overflow-hidden rounded-xl">
                  <Image
                    src={card.imageUrl}
                    alt=""
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
              ) : null}
            </div>
          )}
        </div>
      </motion.div>

      <div className="mt-10 w-full">
        {flipped ? (
          <div className="grid grid-cols-3 gap-3 md:gap-4">
            <button
              type="button"
              onClick={() => onMark(FlashcardCardOutcome.Correct)}
              className="flex flex-col items-center justify-center gap-1 rounded-[20px] bg-[#58cc02] py-3 text-white shadow-[0px_4px_0px_#46a302] transition hover:brightness-105"
            >
              <Check className="size-4" strokeWidth={3} />
              <span className="text-xs font-bold">{t("play.correct")}</span>
            </button>
            <button
              type="button"
              onClick={() => onMark(FlashcardCardOutcome.Skipped)}
              className="flex flex-col items-center justify-center gap-1 rounded-[20px] bg-[#c7af6d] py-3 text-white shadow-[0px_4px_0px_#a38f5a] transition hover:brightness-105"
            >
              <ChevronsUp className="size-4" />
              <span className="text-xs font-bold">{t("play.skip")}</span>
            </button>
            <button
              type="button"
              onClick={() => onMark(FlashcardCardOutcome.Wrong)}
              className="flex flex-col items-center justify-center gap-1 rounded-[20px] bg-[#ff4b4b] py-3 text-white shadow-[0px_4px_0px_#d33131] transition hover:brightness-105"
            >
              <X className="size-4" strokeWidth={3} />
              <span className="text-xs font-bold">{t("play.wrong")}</span>
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onFlip}
            className="flex w-full items-center justify-center rounded-[20px] border-2 border-[#e2e8f0] bg-white py-4 text-base font-bold uppercase tracking-[0.4px] text-[#2b415e] shadow-[0px_8px_0px_rgba(0,0,0,0.05)] transition hover:bg-[#f8fafc]"
          >
            {t("play.showAnswer")}
          </button>
        )}
      </div>

      <div className="mt-8">
        <FlashcardsStationProgressDots
          total={total}
          currentIndex={index}
          outcomes={outcomes}
          cardIds={cardIds}
        />
      </div>

      <p className="mt-auto pt-8 text-center text-sm text-[#94a3b8]">
        {t("play.tip")}
      </p>
    </div>
  );
}
