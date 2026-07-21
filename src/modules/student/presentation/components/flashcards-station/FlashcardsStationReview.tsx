"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { CircleHelp, ThumbsUp } from "lucide-react";
import { FLASHCARDS_STATION_ASSETS } from "./flashcards-station.assets";
import { FlashcardReviewOutcome } from "@/modules/student/domain/flashcards-station/flashcards-station.enums";
import type {
  FlashcardCardDto,
  FlashcardsStationHeaderContext,
} from "@/modules/student/domain/flashcards-station/flashcards-station.types";
import { parseFlashcardBack } from "@/modules/student/domain/flashcards-station/flashcards-station.utils";

type FlashcardsStationReviewProps = {
  header: FlashcardsStationHeaderContext;
  card: FlashcardCardDto;
  reviewIndex: number;
  totalWrong: number;
  reviewProgressPercent: number;
  lastReviewPointsAwarded: number;
  onSubmit: (outcome: FlashcardReviewOutcome) => void;
};

export function FlashcardsStationReview({
  header,
  card,
  reviewIndex,
  totalWrong,
  reviewProgressPercent,
  lastReviewPointsAwarded,
  onSubmit,
}: FlashcardsStationReviewProps) {
  const t = useTranslations("student.dashboard.flashcardsStation");
  const { shortAnswer, explanation } = parseFlashcardBack(card.back);
  const xpNote = lastReviewPointsAwarded || 15;

  return (
    <div className="relative mx-auto flex min-h-[calc(100vh-88px)] w-full max-w-[672px] flex-col px-4 pb-36 pt-10">
      <div className="mb-8 space-y-3">
        <div className="flex items-end justify-between gap-3">
          <p className="text-xs font-bold text-[#64748b]">
            {t("review.progress", { percent: reviewProgressPercent })}
          </p>
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-[#2b415e]">
              {t("review.cardOf", {
                current: reviewIndex + 1,
                total: totalWrong,
              })}
            </p>
            <span className="inline-flex size-5 items-center justify-center rounded-full bg-[#ff4b4b] text-[10px] font-bold text-white">
              !
            </span>
          </div>
        </div>
        <div className="h-4 overflow-hidden rounded-full border-2 border-[#e9ecef] bg-[#dee2e6]">
          <div
            className="ms-auto h-full rounded-full bg-[#ff4b4b] transition-all"
            style={{
              width: `${Math.max(8, 100 - reviewProgressPercent)}%`,
            }}
          />
        </div>
      </div>

      <motion.div
        key={card.id}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex min-h-[400px] w-full flex-col items-center rounded-[40px] border-2 border-[#e9ecef] bg-white p-8 shadow-[0px_8px_0px_rgba(0,0,0,0.05)] md:p-12"
      >
        <div className="mb-8 flex size-16 items-center justify-center rounded-2xl bg-[rgba(219,227,243,0.3)]">
          <Image
            src={FLASHCARDS_STATION_ASSETS.questionDoc}
            alt=""
            width={30}
            height={30}
            className="size-[30px]"
            unoptimized
          />
        </div>

        <h2 className="mb-8 max-w-[532px] text-center text-2xl font-bold leading-9 text-[#0f172a] md:text-[30px]">
          {card.front}
        </h2>

        <div className="mb-8 h-1 w-16 rounded-full bg-[#dee2e6]" />

        <div className="w-full rounded-3xl border-2 border-[rgba(220,244,203,0.5)] bg-[rgba(220,244,203,0.3)] p-6">
          <div className="mb-3 flex items-center justify-end gap-2">
            <p className="text-base font-bold text-[#46a302]">
              {t("review.correctAnswer")}
            </p>
            <span className="inline-flex size-5 items-center justify-center rounded-full bg-[#58cc02] text-xs font-bold text-white">
              ✓
            </span>
          </div>
          <p className="mb-3 text-end text-2xl font-bold text-[#2b415e]">
            {shortAnswer || card.back}
          </p>
          {explanation ? (
            <p className="text-end text-sm leading-relaxed text-[#64748b]">
              {explanation}
            </p>
          ) : null}
        </div>
      </motion.div>

      <div className="mt-8 flex justify-center">
        <div className="inline-flex items-center gap-3 rounded-2xl bg-[rgba(244,236,216,0.3)] px-6 py-3">
          <Image
            src={FLASHCARDS_STATION_ASSETS.trophy}
            alt=""
            width={18}
            height={18}
            className="size-[18px]"
            unoptimized
          />
          <p className="text-sm font-semibold text-[#a38f5a]">
            {t("review.xpNote", { points: xpNote })}
          </p>
        </div>
      </div>

      {header.completedStations != null && header.totalStations != null ? (
        <p className="mt-6 text-center text-sm font-medium text-[#94a3b8]">
          {t("results.stationsFooter", {
            completed: header.completedStations,
            total: header.totalStations,
          })}
        </p>
      ) : null}

      <div className="fixed inset-x-0 bottom-0 z-20 border-t-2 border-[#e9ecef] bg-white/80 px-4 py-6 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-[672px] gap-4">
          <button
            type="button"
            onClick={() => onSubmit(FlashcardReviewOutcome.NeedsHelp)}
            className="flex flex-1 items-center justify-center gap-3 rounded-2xl bg-[#ff4b4b] py-5 text-lg font-bold text-white shadow-[0px_4px_0px_#d33131] transition hover:brightness-105"
          >
            <CircleHelp className="size-5" />
            {t("review.needHelp")}
          </button>
          <button
            type="button"
            onClick={() => onSubmit(FlashcardReviewOutcome.Understood)}
            className="flex flex-1 items-center justify-center gap-3 rounded-2xl bg-[#58cc02] py-5 text-lg font-bold text-white shadow-[0px_4px_0px_#46a302] transition hover:brightness-105"
          >
            <ThumbsUp className="size-5" />
            {t("review.understood")}
          </button>
        </div>
      </div>
    </div>
  );
}
