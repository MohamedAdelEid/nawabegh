"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { FLASHCARDS_STATION_ASSETS } from "./flashcards-station.assets";
import type {
  FlashcardsStationCompletionResultDto,
  FlashcardsStationHeaderContext,
  FlashcardSessionStats,
} from "@/modules/student/domain/flashcards-station/flashcards-station.types";
import { formatFlashcardTimer } from "@/modules/student/domain/flashcards-station/flashcards-station.utils";
import { ROUTES } from "@/shared/infrastructure/config/routes";

type FlashcardsStationResultsProps = {
  header: FlashcardsStationHeaderContext;
  stats: FlashcardSessionStats;
  completion: FlashcardsStationCompletionResultDto | null;
  hasMistakes: boolean;
  courseId?: string | null;
  pathId?: string | null;
  onReviewMistakes: () => void;
};

export function FlashcardsStationResults({
  header,
  stats,
  completion,
  hasMistakes,
  courseId,
  pathId,
  onReviewMistakes,
}: FlashcardsStationResultsProps) {
  const t = useTranslations("student.dashboard.flashcardsStation");
  const router = useRouter();

  const points = completion?.pointsAwarded ?? 0;
  const accuracy = completion?.accuracyPercent ?? stats.accuracyPercent;
  const elapsed = completion?.elapsedSeconds ?? stats.elapsedSeconds;
  const stagePercent =
    completion?.percentageCompleted ?? stats.percentageCompleted;

  const goToJourney = () => {
    const params = new URLSearchParams();
    if (courseId) params.set("courseId", courseId);
    if (pathId) params.set("pathId", pathId);
    const qs = params.toString();
    router.push(
      qs ? `${ROUTES.USER.STUDENT.JOURNEY}?${qs}` : ROUTES.USER.STUDENT.JOURNEY,
    );
  };

  return (
    <div className="mx-auto flex w-full max-w-[768px] flex-col items-center px-4 py-10 md:py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full rounded-[32px] border border-[#dcdcdc]/80 bg-white/70 p-6 backdrop-blur-md md:rounded-[48px] md:p-14"
      >
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="relative mb-6 flex size-40 items-center justify-center md:size-56">
            <div className="absolute inset-6 rounded-full border border-[#e0e0e0]" />
            <Image
              src={FLASHCARDS_STATION_ASSETS.medal}
              alt=""
              width={80}
              height={105}
              className="relative z-10 h-[105px] w-20"
              unoptimized
            />
            <div className="absolute bottom-4 start-4 flex size-10 items-center justify-center rounded-xl bg-[#c7a55b] shadow-lg">
              <Image
                src={FLASHCARDS_STATION_ASSETS.confetti}
                alt=""
                width={22}
                height={21}
                className="size-5"
                unoptimized
              />
            </div>
          </div>

          <h1 className="mb-3 text-3xl font-bold tracking-tight text-[#2c4260] md:text-5xl">
            {t("results.title")}
          </h1>
          <p className="max-w-[480px] text-base text-[#64748b] md:text-xl">
            {t("results.subtitle")}
          </p>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6">
          <StatCard
            icon={FLASHCARDS_STATION_ASSETS.accuracy}
            label={t("results.accuracy")}
            value={`${accuracy}%`}
            accent="navy"
          />
          <StatCard
            icon={FLASHCARDS_STATION_ASSETS.timerStat}
            label={t("results.timeSpent")}
            value={formatFlashcardTimer(elapsed)}
            accent="gold"
          />
          <StatCard
            icon={FLASHCARDS_STATION_ASSETS.trophy}
            label={t("results.points")}
            value={`+${points || 0}`}
            accent="navy"
          />
        </div>

        <div className="mb-8 space-y-3">
          <div className="flex items-end justify-between px-2">
            <span className="rounded-full bg-[rgba(199,165,91,0.2)] px-2 py-0.5 text-xs font-bold text-[#c7a55b]">
              {stagePercent}%
            </span>
            <span className="text-sm font-bold text-[#2c4260]">
              {t("results.stageComplete")}
            </span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-[#f1f5f9] p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-l from-[#2c4260] to-[rgba(44,66,96,0.8)] shadow-[0px_0px_12px_0px_rgba(44,66,96,0.4)] transition-all"
              style={{ width: `${Math.min(100, stagePercent)}%` }}
            />
          </div>
        </div>

        <div className="flex flex-col items-stretch justify-center gap-4 sm:flex-row">
          {hasMistakes ? (
            <button
              type="button"
              onClick={onReviewMistakes}
              className="inline-flex items-center justify-center gap-3 rounded-2xl border-2 border-[rgba(44,66,96,0.1)] bg-white px-6 py-5 text-lg font-bold text-[#2c4260] transition hover:bg-[#f8fafc]"
            >
              <Image
                src={FLASHCARDS_STATION_ASSETS.reviewErrors}
                alt=""
                width={20}
                height={16}
                className="h-4 w-5"
                unoptimized
              />
              {t("results.reviewMistakes")}
            </button>
          ) : null}
          <button
            type="button"
            onClick={goToJourney}
            className="inline-flex flex-1 items-center justify-center gap-3 rounded-2xl bg-[#2c4260] px-8 py-5 text-lg font-bold text-white transition hover:bg-[#243650]"
          >
            <Image
              src={FLASHCARDS_STATION_ASSETS.rocket}
              alt=""
              width={20}
              height={20}
              className="size-5"
              unoptimized
            />
            {t("results.backToJourney")}
          </button>
        </div>
      </motion.div>

      {header.completedStations != null && header.totalStations != null ? (
        <p className="mt-8 text-sm font-medium text-[#94a3b8]">
          {t("results.stationsFooter", {
            completed: header.completedStations,
            total: header.totalStations,
          })}
        </p>
      ) : null}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: string;
  label: string;
  value: string;
  accent: "navy" | "gold";
}) {
  return (
    <div
      className={
        accent === "gold"
          ? "flex flex-col items-center rounded-[32px] border border-[rgba(199,165,91,0.3)] bg-white/70 p-6 backdrop-blur-sm"
          : "flex flex-col items-center rounded-[32px] border border-white/30 bg-white/70 p-6 backdrop-blur-sm"
      }
    >
      <div
        className={
          accent === "gold"
            ? "mb-4 flex size-14 items-center justify-center rounded-2xl bg-[rgba(199,165,91,0.1)]"
            : "mb-4 flex size-14 items-center justify-center rounded-2xl bg-[rgba(44,66,96,0.1)]"
        }
      >
        <Image src={icon} alt="" width={22} height={24} className="h-6 w-5" unoptimized />
      </div>
      <p className="mb-1 text-sm font-medium text-[#64748b]">{label}</p>
      <p
        className={
          accent === "gold"
            ? "text-3xl font-bold text-[#c7a55b]"
            : "text-3xl font-bold text-[#2c4260]"
        }
      >
        {value}
      </p>
    </div>
  );
}
