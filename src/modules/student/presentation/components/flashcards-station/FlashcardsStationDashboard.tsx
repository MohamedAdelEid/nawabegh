"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { FlashcardsStationHeader } from "./FlashcardsStationHeader";
import { FlashcardsStationIntro } from "./FlashcardsStationIntro";
import { FlashcardsStationPlay } from "./FlashcardsStationPlay";
import { FlashcardsStationResults } from "./FlashcardsStationResults";
import { FlashcardsStationReview } from "./FlashcardsStationReview";
import { FlashcardsStationSkeleton } from "./FlashcardsStationSkeleton";
import { useFlashcardsStation } from "@/modules/student/application/hooks/useFlashcardsStation";
import { ApiFailureAlert } from "@/shared/presentation/components/ui/ApiFailureAlert";
import { Button } from "@/shared/presentation/components/ui/button";

type FlashcardsStationDashboardProps = {
  stationId: string;
};

export function FlashcardsStationDashboard({
  stationId,
}: FlashcardsStationDashboardProps) {
  const t = useTranslations("student.dashboard.flashcardsStation");
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId");
  const pathId = searchParams.get("pathId");

  const station = useFlashcardsStation({ stationId, courseId, pathId });

  if (station.isLoadingIntro) {
    return <FlashcardsStationSkeleton />;
  }

  if (station.loadError && !station.introQuery.data) {
    return (
      <div className="space-y-4 p-6">
        <ApiFailureAlert
          message={station.loadError}
          fallbackMessage={t("errors.load")}
        />
        <Button type="button" variant="outline" onClick={() => void station.introQuery.refetch()}>
          {t("errors.retry")}
        </Button>
      </div>
    );
  }

  const introTitle =
    station.introQuery.data?.flashcardDeck?.title ||
    station.introQuery.data?.name ||
    "";

  return (
    <div className="flex min-h-screen flex-col bg-[#f6f7f7]">
      <FlashcardsStationHeader
        header={station.header}
        courseId={courseId}
        pathId={pathId || station.introQuery.data?.learningPathId}
      />

      {station.actionError ? (
        <div className="mx-auto w-full max-w-[672px] px-4 pt-4">
          <ApiFailureAlert
            message={station.actionError}
            fallbackMessage={t("errors.action")}
          />
        </div>
      ) : null}

      {station.phase === "locked" ? (
        <div className="mx-auto max-w-lg px-4 py-20 text-center">
          <p className="text-lg font-bold text-[#2b415e]">{t("errors.locked")}</p>
        </div>
      ) : null}

      {station.phase === "intro" ? (
        <FlashcardsStationIntro
          header={station.header}
          title={introTitle}
          cardCount={station.cardCount}
          estimatedMinutes={station.estimatedMinutes}
          isStarting={station.isStarting}
          onStart={() => void station.startSession()}
        />
      ) : null}

      {station.phase === "play" && station.currentCard ? (
        <FlashcardsStationPlay
          card={station.currentCard}
          index={station.index}
          total={station.cards.length}
          flipped={station.flipped}
          cardElapsedSeconds={station.cardElapsedSeconds}
          outcomes={station.outcomes}
          cardIds={station.cards.map((card) => card.id)}
          onFlip={station.flipCard}
          onMark={(outcome) => void station.markOutcome(outcome)}
        />
      ) : null}

      {station.phase === "results" ? (
        <FlashcardsStationResults
          header={station.header}
          stats={station.sessionStats}
          completion={station.completion}
          hasMistakes={station.wrongCards.length > 0}
          courseId={courseId}
          pathId={pathId || station.introQuery.data?.learningPathId}
          onReviewMistakes={station.startReview}
        />
      ) : null}

      {station.phase === "review" && station.currentReviewCard ? (
        <FlashcardsStationReview
          header={station.header}
          card={station.currentReviewCard}
          reviewIndex={station.reviewIndex}
          totalWrong={station.wrongCards.length}
          reviewProgressPercent={station.reviewProgressPercent}
          lastReviewPointsAwarded={station.lastReviewPointsAwarded}
          onSubmit={(outcome) => void station.submitReview(outcome)}
        />
      ) : null}
    </div>
  );
}
