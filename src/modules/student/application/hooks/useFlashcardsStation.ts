"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { flashcardsStationQueryKeys } from "@/modules/student/application/constants/flashcardsStationQueryKeys";
import { progressQueryKeys } from "@/modules/student/application/constants/progressQueryKeys";
import {
  FlashcardCardOutcome,
  FlashcardReviewOutcome,
  type FlashcardsStationPhase,
} from "@/modules/student/domain/flashcards-station/flashcards-station.enums";
import type {
  FlashcardsStationCompletionResultDto,
  FlashcardsStationHeaderContext,
} from "@/modules/student/domain/flashcards-station/flashcards-station.types";
import {
  cardCountFromIntro,
  computeSessionStats,
  estimatedMinutesFromIntro,
  getWrongCards,
  isOutcomeReviewed,
} from "@/modules/student/domain/flashcards-station/flashcards-station.utils";
import { StudentStationProgressStatus } from "@/modules/student/domain/progress/progress.enums";
import {
  completeFlashcardsStation,
  getFlashcardsStationDeck,
  getFlashcardsStationIntro,
  submitFlashcardOutcome,
  submitFlashcardReviewOutcome,
} from "@/modules/student/infrastructure/api/flashcardsStation.api";
import {
  getCourseProgress,
  getLearningPathStationsProgress,
} from "@/modules/student/infrastructure/api/progress.api";

type UseFlashcardsStationOptions = {
  stationId: string;
  courseId?: string | null;
  pathId?: string | null;
};

export function useFlashcardsStation({
  stationId,
  courseId,
  pathId,
}: UseFlashcardsStationOptions) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const [phase, setPhase] = useState<FlashcardsStationPhase>("intro");
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [outcomes, setOutcomes] = useState<Record<string, FlashcardCardOutcome>>({});
  const [reviewIndex, setReviewIndex] = useState(0);
  const [reviewUnderstoodIds, setReviewUnderstoodIds] = useState<string[]>([]);
  const [sessionStartedAt, setSessionStartedAt] = useState<number | null>(null);
  const [cardStartedAt, setCardStartedAt] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [cardElapsedSeconds, setCardElapsedSeconds] = useState(0);
  const [completion, setCompletion] =
    useState<FlashcardsStationCompletionResultDto | null>(null);
  const [lastReviewPointsAwarded, setLastReviewPointsAwarded] = useState(0);
  const [actionError, setActionError] = useState<string | null>(null);
  const completingRef = useRef(false);

  const introQuery = useQuery({
    queryKey: flashcardsStationQueryKeys.intro(stationId),
    queryFn: () => getFlashcardsStationIntro(stationId),
    enabled: Boolean(stationId),
    staleTime: 60_000,
  });

  const resolvedPathId = pathId || introQuery.data?.learningPathId || null;

  const courseProgressQuery = useQuery({
    queryKey: progressQueryKeys.courseProgress(courseId ?? ""),
    queryFn: () => getCourseProgress(courseId!),
    enabled: Boolean(courseId),
    staleTime: 60_000,
  });

  const pathStationsQuery = useQuery({
    queryKey: progressQueryKeys.pathStations(resolvedPathId ?? ""),
    queryFn: () => getLearningPathStationsProgress(resolvedPathId!),
    enabled: Boolean(resolvedPathId),
    staleTime: 60_000,
  });

  const deckQuery = useQuery({
    queryKey: flashcardsStationQueryKeys.deck(stationId),
    queryFn: () => getFlashcardsStationDeck(stationId),
    enabled: false,
    staleTime: 0,
  });

  const cards = deckQuery.data?.deck.cards ?? [];
  const currentCard = cards[index] ?? null;
  const wrongCards = useMemo(
    () => getWrongCards(cards, outcomes),
    [cards, outcomes],
  );
  const currentReviewCard = wrongCards[reviewIndex] ?? null;

  const sessionStats = useMemo(
    () =>
      computeSessionStats({
        cards,
        outcomes,
        sessionStartedAt,
      }),
    [cards, outcomes, sessionStartedAt, elapsedSeconds],
  );

  useEffect(() => {
    if (phase !== "play" || sessionStartedAt == null) return;
    const timer = window.setInterval(() => {
      const now = Date.now();
      setElapsedSeconds(Math.max(0, Math.floor((now - sessionStartedAt) / 1000)));
      if (cardStartedAt != null) {
        setCardElapsedSeconds(Math.max(0, Math.floor((now - cardStartedAt) / 1000)));
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [phase, sessionStartedAt, cardStartedAt]);

  const header: FlashcardsStationHeaderContext = useMemo(() => {
    const pathProgress = courseProgressQuery.data?.paths.find(
      (path) => path.pathId === resolvedPathId,
    );
    const activePathProgress =
      pathProgress ??
      courseProgressQuery.data?.paths.find((path) => path.pathId === pathId) ??
      null;

    return {
      stationTitle:
        deckQuery.data?.stationName ||
        introQuery.data?.name ||
        "",
      learningPathTitle:
        introQuery.data?.learningPathTitle ||
        pathStationsQuery.data?.learningPathTitle ||
        "",
      pathProgressPercent:
        activePathProgress?.stationProgressPercent ??
        courseProgressQuery.data?.courseProgressPercent ??
        0,
      currentLevel: completion?.currentLevel ?? 1,
      avatarUrl: session?.user?.image ?? null,
      completedStations: activePathProgress?.completedStations ?? null,
      totalStations: activePathProgress?.totalStations ?? null,
    };
  }, [
    completion?.currentLevel,
    courseProgressQuery.data,
    deckQuery.data?.stationName,
    introQuery.data,
    pathId,
    pathStationsQuery.data?.learningPathTitle,
    resolvedPathId,
    session?.user?.image,
  ]);

  const startSession = useCallback(async () => {
    setActionError(null);
    try {
      const deck = await deckQuery.refetch();
      if (deck.error) throw deck.error;
      if (!deck.data) throw new Error("Failed to load flashcard deck");

      if (deck.data.status === StudentStationProgressStatus.Locked) {
        setPhase("locked");
        return;
      }

      const now = Date.now();
      setSessionStartedAt(now);
      setCardStartedAt(now);
      setElapsedSeconds(0);
      setCardElapsedSeconds(0);
      setIndex(0);
      setFlipped(false);
      setOutcomes({});
      setCompletion(null);
      setPhase("play");
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Failed to start flashcards",
      );
      setPhase("error");
    }
  }, [deckQuery]);

  const flipCard = useCallback(() => {
    setFlipped(true);
  }, []);

  const finishStation = useCallback(
    async (nextOutcomes: Record<string, FlashcardCardOutcome>) => {
      if (completingRef.current) return;
      completingRef.current = true;
      setActionError(null);

      try {
        const stats = computeSessionStats({
          cards,
          outcomes: nextOutcomes,
          sessionStartedAt,
        });
        const threshold =
          deckQuery.data?.completionThreshold ??
          introQuery.data?.completionThreshold ??
          70;

        if (stats.percentageCompleted < threshold) {
          setActionError(
            `Must review at least ${threshold}% of cards to complete`,
          );
          completingRef.current = false;
          return;
        }

        const result = await completeFlashcardsStation({
          stationId,
          percentageCompleted: stats.percentageCompleted,
        });

        setCompletion({
          ...result,
          accuracyPercent: result.accuracyPercent ?? stats.accuracyPercent,
          elapsedSeconds: result.elapsedSeconds ?? stats.elapsedSeconds,
          percentageCompleted:
            result.percentageCompleted ?? stats.percentageCompleted,
          pointsAwarded:
            result.pointsAwarded ??
            deckQuery.data?.pointsReward ??
            null,
        });
        setPhase("results");

        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: progressQueryKeys.dashboard(),
          }),
          courseId
            ? queryClient.invalidateQueries({
                queryKey: progressQueryKeys.courseProgress(courseId),
              })
            : Promise.resolve(),
          resolvedPathId
            ? queryClient.invalidateQueries({
                queryKey: progressQueryKeys.pathStations(resolvedPathId),
              })
            : Promise.resolve(),
        ]);
      } catch (error) {
        setActionError(
          error instanceof Error ? error.message : "Failed to complete station",
        );
      } finally {
        completingRef.current = false;
      }
    },
    [
      cards,
      courseId,
      deckQuery.data?.completionThreshold,
      deckQuery.data?.pointsReward,
      introQuery.data?.completionThreshold,
      queryClient,
      resolvedPathId,
      sessionStartedAt,
      stationId,
    ],
  );

  const markOutcome = useCallback(
    async (outcome: FlashcardCardOutcome) => {
      if (!currentCard || phase !== "play") return;
      setActionError(null);

      const nextOutcomes = { ...outcomes, [currentCard.id]: outcome };
      setOutcomes(nextOutcomes);

      try {
        await submitFlashcardOutcome({
          stationId,
          flashcardId: currentCard.id,
          outcome,
        });
      } catch {
        // Keep local progress even if outcome persistence fails transiently.
      }

      const nextIndex = index + 1;
      if (nextIndex >= cards.length) {
        await finishStation(nextOutcomes);
        return;
      }

      setIndex(nextIndex);
      setFlipped(false);
      setCardStartedAt(Date.now());
      setCardElapsedSeconds(0);
    },
    [
      cards.length,
      currentCard,
      finishStation,
      index,
      outcomes,
      phase,
      stationId,
    ],
  );

  const startReview = useCallback(() => {
    if (wrongCards.length === 0) return;
    setReviewIndex(0);
    setReviewUnderstoodIds([]);
    setLastReviewPointsAwarded(0);
    setPhase("review");
  }, [wrongCards.length]);

  const submitReview = useCallback(
    async (outcome: FlashcardReviewOutcome) => {
      if (!currentReviewCard) return;
      setActionError(null);

      try {
        if (outcome === FlashcardReviewOutcome.Understood) {
          const result = await submitFlashcardReviewOutcome({
            stationId,
            flashcardId: currentReviewCard.id,
            outcome,
          });
          setLastReviewPointsAwarded(result.reviewPointsAwarded || 15);
          setReviewUnderstoodIds((prev) =>
            prev.includes(currentReviewCard.id)
              ? prev
              : [...prev, currentReviewCard.id],
          );
        }

        const nextReviewIndex = reviewIndex + 1;
        if (nextReviewIndex >= wrongCards.length) {
          setPhase("results");
          return;
        }
        setReviewIndex(nextReviewIndex);
      } catch (error) {
        setActionError(
          error instanceof Error ? error.message : "Failed to submit review",
        );
      }
    },
    [currentReviewCard, reviewIndex, stationId, wrongCards.length],
  );

  const reviewedInReviewMode = reviewUnderstoodIds.length;
  const reviewProgressPercent =
    wrongCards.length > 0
      ? Math.round((reviewedInReviewMode / wrongCards.length) * 100)
      : 0;

  return {
    phase,
    setPhase,
    introQuery,
    deckQuery,
    courseProgressQuery,
    pathStationsQuery,
    header,
    cards,
    currentCard,
    index,
    flipped,
    flipCard,
    outcomes,
    isOutcomeReviewed,
    sessionStats,
    elapsedSeconds,
    cardElapsedSeconds,
    completion,
    wrongCards,
    currentReviewCard,
    reviewIndex,
    reviewProgressPercent,
    lastReviewPointsAwarded,
    startSession,
    markOutcome,
    startReview,
    submitReview,
    cardCount: cardCountFromIntro(introQuery.data ?? null, deckQuery.data ?? null),
    estimatedMinutes: estimatedMinutesFromIntro(
      introQuery.data ?? null,
      deckQuery.data ?? null,
    ),
    isStarting: deckQuery.isFetching,
    isLoadingIntro: introQuery.isLoading,
    actionError,
    loadError:
      (introQuery.error instanceof Error ? introQuery.error.message : null) ||
      actionError,
  };
}
