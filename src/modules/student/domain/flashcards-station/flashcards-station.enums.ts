/** Mirrors Nawabegh.API flashcard station enums — see STATION_FLASHCARDS.md */

export enum FlashcardCardOutcome {
  Correct = 1,
  Wrong = 2,
  Skipped = 3,
}

export enum FlashcardReviewOutcome {
  Understood = 1,
  NeedsHelp = 2,
}

export type FlashcardsStationPhase =
  | "intro"
  | "play"
  | "results"
  | "review"
  | "locked"
  | "error";
