import { StudentStationProgressStatus } from "@/modules/student/domain/progress/progress.enums";
import {
  FlashcardCardOutcome,
  FlashcardReviewOutcome,
} from "./flashcards-station.enums";
import type {
  FlashcardAttachmentDto,
  FlashcardCardDto,
  FlashcardDeckDto,
  FlashcardDeckMetaDto,
  FlashcardReviewOutcomeResultDto,
  FlashcardsStationCompletionResultDto,
  FlashcardsStationDeckDto,
  FlashcardsStationIntroDto,
  FlashcardSessionStats,
  ParsedFlashcardBack,
} from "./flashcards-station.types";

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as UnknownRecord)
    : null;
}

function readString(record: UnknownRecord | null, keys: string[], fallback = ""): string {
  if (!record) return fallback;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string") return value;
  }
  return fallback;
}

function readNumber(record: UnknownRecord | null, keys: string[], fallback = 0): number {
  if (!record) return fallback;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() !== "" && !Number.isNaN(Number(value))) {
      return Number(value);
    }
  }
  return fallback;
}

function readNullableNumber(record: UnknownRecord | null, keys: string[]): number | null {
  if (!record) return null;
  for (const key of keys) {
    const value = record[key];
    if (value == null) return null;
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() !== "" && !Number.isNaN(Number(value))) {
      return Number(value);
    }
  }
  return null;
}

function readNullableString(record: UnknownRecord | null, keys: string[]): string | null {
  if (!record) return null;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string") {
      const trimmed = value.trim();
      return trimmed || null;
    }
    if (value === null) return null;
  }
  return null;
}

function readArray(record: UnknownRecord | null, keys: string[]): unknown[] {
  if (!record) return [];
  for (const key of keys) {
    const value = record[key];
    if (Array.isArray(value)) return value;
  }
  return [];
}

function mapAttachment(row: unknown): FlashcardAttachmentDto | null {
  const record = asRecord(row);
  if (!record) return null;
  const id = readString(record, ["id"], "").trim();
  const fileUrl = readString(record, ["fileUrl", "url"], "").trim();
  if (!id && !fileUrl) return null;
  return {
    id: id || fileUrl,
    fileUrl,
    fileName: readString(record, ["fileName", "name"], ""),
    fileExtension: readString(record, ["fileExtension", "extension"], ""),
    fileSizeBytes: readNumber(record, ["fileSizeBytes", "fileSize", "size"]),
    order: readNumber(record, ["order"]),
  };
}

function mapCard(row: unknown): FlashcardCardDto | null {
  const record = asRecord(row);
  if (!record) return null;
  const id = readString(record, ["id", "flashcardId"], "").trim();
  if (!id) return null;
  return {
    id,
    front: readString(record, ["front", "question"]),
    back: readString(record, ["back", "answer"]),
    imageUrl: readNullableString(record, ["imageUrl", "image"]),
    order: readNumber(record, ["order"]),
    reviewSeconds: readNumber(record, ["reviewSeconds"], 15),
    attachments: readArray(record, ["attachments"])
      .map(mapAttachment)
      .filter((item): item is FlashcardAttachmentDto => item != null),
  };
}

function mapDeckMeta(row: unknown): FlashcardDeckMetaDto | null {
  const record = asRecord(row);
  if (!record) return null;
  const cards = readArray(record, ["cards"]);
  return {
    id: readString(record, ["id", "deckId"], ""),
    title: readString(record, ["title", "name"], ""),
    averageDifficulty: readString(record, ["averageDifficulty", "difficulty"], ""),
    cardCount: cards.length || readNumber(record, ["totalCards", "cardCount"]),
  };
}

export function mapFlashcardsStationIntroDto(
  value: unknown,
): FlashcardsStationIntroDto | null {
  const record = asRecord(value);
  if (!record) return null;
  const id = readString(record, ["id", "stationId"], "").trim();
  if (!id) return null;

  const deckRaw = record.flashcardDeck ?? record.deck;
  return {
    id,
    learningPathId: readString(record, ["learningPathId"], ""),
    learningPathTitle: readString(record, ["learningPathTitle"], ""),
    name: readString(record, ["name", "stationName", "title"], ""),
    stationType: readNumber(record, ["stationType"], 1),
    type: readString(record, ["type"], "Flashcards"),
    completionThreshold: readNumber(record, ["completionThreshold"], 70),
    flashcardDeck: deckRaw != null ? mapDeckMeta(deckRaw) : null,
  };
}

function mapDeck(row: unknown): FlashcardDeckDto | null {
  const record = asRecord(row);
  if (!record) return null;
  const cards = readArray(record, ["cards"])
    .map(mapCard)
    .filter((item): item is FlashcardCardDto => item != null)
    .sort((a, b) => a.order - b.order);

  return {
    deckId: readString(record, ["deckId", "id"], ""),
    title: readString(record, ["title", "name"], ""),
    totalCards: readNumber(record, ["totalCards"], cards.length),
    estimatedMinutes: readNumber(record, ["estimatedMinutes"]),
    totalReviewSeconds: readNumber(record, ["totalReviewSeconds"]),
    cards,
  };
}

export function mapFlashcardsStationDeckDto(
  value: unknown,
): FlashcardsStationDeckDto | null {
  const record = asRecord(value);
  if (!record) return null;
  const stationId = readString(record, ["stationId", "id"], "").trim();
  const deck = mapDeck(record.deck);
  if (!stationId || !deck) return null;

  return {
    stationId,
    stationName: readString(record, ["stationName", "name"], ""),
    stationType: readNumber(record, ["stationType"], 1),
    status: readNumber(
      record,
      ["status"],
      StudentStationProgressStatus.Available,
    ) as StudentStationProgressStatus,
    completionThreshold: readNumber(record, ["completionThreshold"], 70),
    pointsReward: readNullableNumber(record, ["pointsReward"]),
    deck,
  };
}

export function mapFlashcardsStationCompletionResultDto(
  value: unknown,
): FlashcardsStationCompletionResultDto | null {
  const record = asRecord(value);
  if (!record) return null;
  return {
    pathCompleted: Boolean(record.pathCompleted),
    pathId: readNullableString(record, ["pathId"]),
    pathPointsEarned: readNullableNumber(record, ["pathPointsEarned"]),
    totalPoints: readNumber(record, ["totalPoints"]),
    currentLevel: readNumber(record, ["currentLevel"], 1),
    pointsToNextLevel: readNumber(record, ["pointsToNextLevel"]),
    pointsAwarded: readNullableNumber(record, ["pointsAwarded"]),
    accuracyPercent: readNullableNumber(record, [
      "accuracyPercent",
      "accuracy",
    ]),
    elapsedSeconds: readNullableNumber(record, [
      "elapsedSeconds",
      "timeSpentSeconds",
    ]),
    percentageCompleted: readNullableNumber(record, ["percentageCompleted"]),
  };
}

export function mapFlashcardReviewOutcomeResultDto(
  value: unknown,
): FlashcardReviewOutcomeResultDto | null {
  const record = asRecord(value);
  if (!record) return null;
  return {
    reviewPointsAwarded: readNumber(record, [
      "reviewPointsAwarded",
      "pointsAwarded",
    ]),
    flashcardId: readString(record, ["flashcardId", "cardId", "id"], ""),
  };
}

export function parseFlashcardBack(back: string): ParsedFlashcardBack {
  const lines = back.split("\n");
  const shortAnswer = (lines[0] ?? "").trim();
  const explanation = lines.slice(1).join("\n").trim();
  return { shortAnswer, explanation };
}

export function isOutcomeReviewed(outcome: FlashcardCardOutcome | undefined): boolean {
  return (
    outcome === FlashcardCardOutcome.Correct ||
    outcome === FlashcardCardOutcome.Wrong ||
    outcome === FlashcardCardOutcome.Skipped
  );
}

export function computeSessionStats(input: {
  cards: FlashcardCardDto[];
  outcomes: Record<string, FlashcardCardOutcome>;
  sessionStartedAt: number | null;
  now?: number;
}): FlashcardSessionStats {
  const { cards, outcomes, sessionStartedAt } = input;
  const now = input.now ?? Date.now();

  let correctCount = 0;
  let wrongCount = 0;
  let skippedCount = 0;

  for (const card of cards) {
    const outcome = outcomes[card.id];
    if (outcome === FlashcardCardOutcome.Correct) correctCount += 1;
    else if (outcome === FlashcardCardOutcome.Wrong) wrongCount += 1;
    else if (outcome === FlashcardCardOutcome.Skipped) skippedCount += 1;
  }

  const reviewedCount = correctCount + wrongCount + skippedCount;
  const totalCards = Math.max(cards.length, 1);
  const percentageCompleted = Math.round((reviewedCount / totalCards) * 100);
  const accuracyPercent =
    reviewedCount > 0 ? Math.round((correctCount / reviewedCount) * 100) : 0;
  const elapsedSeconds =
    sessionStartedAt != null
      ? Math.max(0, Math.floor((now - sessionStartedAt) / 1000))
      : 0;

  return {
    reviewedCount,
    correctCount,
    wrongCount,
    skippedCount,
    percentageCompleted,
    accuracyPercent,
    elapsedSeconds,
  };
}

export function getWrongCards(
  cards: FlashcardCardDto[],
  outcomes: Record<string, FlashcardCardOutcome>,
): FlashcardCardDto[] {
  return cards.filter(
    (card) =>
      outcomes[card.id] === FlashcardCardOutcome.Wrong ||
      outcomes[card.id] === FlashcardCardOutcome.Skipped,
  );
}

export function formatFlashcardTimer(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function estimatedMinutesFromIntro(
  intro: FlashcardsStationIntroDto | null,
  deck: FlashcardsStationDeckDto | null,
): number {
  if (deck?.deck.estimatedMinutes) return deck.deck.estimatedMinutes;
  const count = intro?.flashcardDeck?.cardCount ?? deck?.deck.totalCards ?? 0;
  if (count <= 0) return 5;
  return Math.max(1, Math.ceil((count * 15) / 60));
}

export function cardCountFromIntro(
  intro: FlashcardsStationIntroDto | null,
  deck: FlashcardsStationDeckDto | null,
): number {
  return (
    deck?.deck.totalCards ||
    intro?.flashcardDeck?.cardCount ||
    deck?.deck.cards.length ||
    0
  );
}

export { FlashcardReviewOutcome };
