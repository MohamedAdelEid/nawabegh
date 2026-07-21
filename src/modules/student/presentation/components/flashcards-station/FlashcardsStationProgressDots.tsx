"use client";

import { FlashcardCardOutcome } from "@/modules/student/domain/flashcards-station/flashcards-station.enums";
import { cn } from "@/shared/application/lib/cn";

type FlashcardsStationProgressDotsProps = {
  total: number;
  currentIndex: number;
  outcomes: Record<string, FlashcardCardOutcome>;
  cardIds: string[];
};

export function FlashcardsStationProgressDots({
  total,
  currentIndex,
  outcomes,
  cardIds,
}: FlashcardsStationProgressDotsProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {Array.from({ length: total }).map((_, i) => {
        const cardId = cardIds[i];
        const outcome = cardId ? outcomes[cardId] : undefined;
        const isCurrent = i === currentIndex;

        return (
          <span
            key={cardId ?? i}
            className={cn(
              "size-3 rounded-full transition-colors",
              outcome === FlashcardCardOutcome.Correct && "bg-[#58cc02]",
              outcome === FlashcardCardOutcome.Wrong && "bg-[#ff4b4b]",
              outcome === FlashcardCardOutcome.Skipped && "bg-[#c7af6d]",
              !outcome && isCurrent && "border-2 border-[rgba(43,65,94,0.2)] bg-[#c7af6d]",
              !outcome && !isCurrent && "bg-[#e2e8f0]",
            )}
            aria-hidden
          />
        );
      })}
    </div>
  );
}
