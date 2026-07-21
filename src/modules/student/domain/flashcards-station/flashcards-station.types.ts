import type { StudentStationProgressStatus } from "@/modules/student/domain/progress/progress.enums";
import type {
  FlashcardCardOutcome,
  FlashcardsStationPhase,
} from "./flashcards-station.enums";

export type FlashcardAttachmentDto = {
  id: string;
  fileUrl: string;
  fileName: string;
  fileExtension: string;
  fileSizeBytes: number;
  order: number;
};

export type FlashcardCardDto = {
  id: string;
  front: string;
  back: string;
  imageUrl: string | null;
  order: number;
  reviewSeconds: number;
  attachments: FlashcardAttachmentDto[];
};

export type FlashcardDeckMetaDto = {
  id: string;
  title: string;
  averageDifficulty: string;
  cardCount: number;
};

export type FlashcardsStationIntroDto = {
  id: string;
  learningPathId: string;
  learningPathTitle: string;
  name: string;
  stationType: number;
  type: string;
  completionThreshold: number;
  flashcardDeck: FlashcardDeckMetaDto | null;
};

export type FlashcardDeckDto = {
  deckId: string;
  title: string;
  totalCards: number;
  estimatedMinutes: number;
  totalReviewSeconds: number;
  cards: FlashcardCardDto[];
};

export type FlashcardsStationDeckDto = {
  stationId: string;
  stationName: string;
  stationType: number;
  status: StudentStationProgressStatus;
  completionThreshold: number;
  pointsReward: number | null;
  deck: FlashcardDeckDto;
};

export type FlashcardsStationCompletionResultDto = {
  pathCompleted: boolean;
  pathId: string | null;
  pathPointsEarned: number | null;
  totalPoints: number;
  currentLevel: number;
  pointsToNextLevel: number;
  pointsAwarded: number | null;
  accuracyPercent: number | null;
  elapsedSeconds: number | null;
  percentageCompleted: number | null;
};

export type FlashcardReviewOutcomeResultDto = {
  reviewPointsAwarded: number;
  flashcardId: string;
};

export type ParsedFlashcardBack = {
  shortAnswer: string;
  explanation: string;
};

export type FlashcardSessionStats = {
  reviewedCount: number;
  correctCount: number;
  wrongCount: number;
  skippedCount: number;
  percentageCompleted: number;
  accuracyPercent: number;
  elapsedSeconds: number;
};

export type FlashcardsStationHeaderContext = {
  stationTitle: string;
  learningPathTitle: string;
  pathProgressPercent: number;
  currentLevel: number;
  avatarUrl: string | null;
  completedStations: number | null;
  totalStations: number | null;
};

export type FlashcardsStationViewState = {
  phase: FlashcardsStationPhase;
  index: number;
  flipped: boolean;
  outcomes: Record<string, FlashcardCardOutcome>;
  reviewIndex: number;
  reviewUnderstoodIds: string[];
  sessionStartedAt: number | null;
  cardStartedAt: number | null;
  elapsedSeconds: number;
  cardElapsedSeconds: number;
  completion: FlashcardsStationCompletionResultDto | null;
  lastReviewPointsAwarded: number;
};
