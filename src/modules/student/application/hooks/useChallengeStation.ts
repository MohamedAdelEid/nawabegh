"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { challengeStationQueryKeys } from "@/modules/student/application/constants/challengeStationQueryKeys";
import { progressQueryKeys } from "@/modules/student/application/constants/progressQueryKeys";
import { ChallengeType } from "@/modules/student/domain/challenge-station/challenge-station.enums";
import type { ChallengeStationPhase } from "@/modules/student/domain/challenge-station/challenge-station.enums";
import type {
  ChallengeMatchFoundEvent,
  ChallengeQueueResultDto,
  ChallengeSessionEndedEvent,
  ChallengeSessionParticipantDto,
} from "@/modules/student/domain/challenge-station/challenge-station.types";
import {
  getLevelProgressPercent,
  getSpeedMultiplier,
} from "@/modules/student/domain/challenge-station/challenge-station.utils";
import {
  cancelChallengeQueue,
  enterChallengeStationQueue,
  finishChallengeSession,
  forfeitChallengeSession,
  getAchievementAudit,
  getChallengeOverview,
  getChallengeSession,
  getChallengeSessionQuestions,
  getChallengeStationIntro,
  getStudentPointsSummary,
  reconnectChallengeSession,
  startChallengePractice,
  submitChallengeAnswer,
} from "@/modules/student/infrastructure/api/challengeStation.api";
import { getLeaderboardWidget } from "@/modules/student/infrastructure/api/studentHomeApi";
import { ChallengeHubClient } from "@/modules/student/infrastructure/realtime/challengeHub";
import { getCourseProgress } from "@/modules/student/infrastructure/api/progress.api";

type UseChallengeStationOptions = {
  stationId: string;
  courseId?: string | null;
  pathId?: string | null;
};

export function useChallengeStation({
  stationId,
  courseId,
  pathId,
}: UseChallengeStationOptions) {
  const { data: authSession } = useSession();
  const currentUserId = authSession?.user?.id ?? "";
  const queryClient = useQueryClient();
  const hubRef = useRef<ChallengeHubClient | null>(null);

  const [phase, setPhase] = useState<ChallengeStationPhase>("modes");
  const [actionError, setActionError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [opponentName, setOpponentName] = useState<string | null>(null);
  const [opponentId, setOpponentId] = useState<string | null>(null);
  const [waitStartedAt, setWaitStartedAt] = useState<number | null>(null);
  const [waitSeconds, setWaitSeconds] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [myScore, setMyScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [myCorrect, setMyCorrect] = useState(0);
  const [streak, setStreak] = useState(0);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [questionStartedAt, setQuestionStartedAt] = useState<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionEnded, setSessionEnded] = useState<ChallengeSessionEndedEvent | null>(
    null,
  );
  const [warmupAnswer, setWarmupAnswer] = useState<string | null>(null);
  const finishingRef = useRef(false);

  const introQuery = useQuery({
    queryKey: challengeStationQueryKeys.intro(stationId),
    queryFn: () => getChallengeStationIntro(stationId),
    enabled: Boolean(stationId),
    staleTime: 60_000,
  });

  const challengeId = introQuery.data?.challengeId ?? "";

  const overviewQuery = useQuery({
    queryKey: challengeStationQueryKeys.overview(challengeId),
    queryFn: () => getChallengeOverview(challengeId),
    enabled: Boolean(challengeId),
    staleTime: 30_000,
  });

  const courseProgressQuery = useQuery({
    queryKey: progressQueryKeys.courseProgress(courseId ?? ""),
    queryFn: () => getCourseProgress(courseId!),
    enabled: Boolean(courseId),
    staleTime: 60_000,
  });

  const pointsQuery = useQuery({
    queryKey: challengeStationQueryKeys.points(),
    queryFn: () => getStudentPointsSummary(20),
    staleTime: 30_000,
  });

  const leaderboardQuery = useQuery({
    queryKey: [...challengeStationQueryKeys.all, "leaderboard"],
    queryFn: getLeaderboardWidget,
    staleTime: 60_000,
  });

  const achievementsQuery = useQuery({
    queryKey: challengeStationQueryKeys.achievements(),
    queryFn: () => getAchievementAudit({ pageSize: 6 }),
    enabled: phase === "results" || phase === "modes",
    staleTime: 30_000,
  });

  const questionsQuery = useQuery({
    queryKey: challengeStationQueryKeys.questions(sessionId ?? ""),
    queryFn: () => getChallengeSessionQuestions(sessionId!),
    enabled: Boolean(sessionId) && (phase === "duel" || phase === "lobby"),
    staleTime: 0,
  });

  const questions = questionsQuery.data?.questions ?? [];
  const currentQuestion = questions[questionIndex] ?? null;
  const questionCount =
    overviewQuery.data?.questionCount || questions.length || 0;
  const durationMinutes = overviewQuery.data?.durationMinutes || 15;

  const ensureHub = useCallback(async () => {
    if (!hubRef.current) {
      hubRef.current = new ChallengeHubClient();
    }
    const hub = hubRef.current;
    await hub.connect();
    return hub;
  }, []);

  const applyMatch = useCallback(
    async (match: ChallengeQueueResultDto | ChallengeMatchFoundEvent) => {
      if (!match.sessionId) return;
      setSessionId(match.sessionId);
      setOpponentName(match.opponentDisplayName);
      setOpponentId(match.opponentStudentId);
      setPhase("lobby");
      setCountdown(3);
      setWaitStartedAt(null);

      const hub = await ensureHub();
      await hub.registerSession(match.sessionId);
      try {
        if (hub.connectionId) {
          await reconnectChallengeSession({
            sessionId: match.sessionId,
            signalRConnectionId: hub.connectionId,
          });
        }
      } catch {
        // reconnect is best-effort before questions load
      }
    },
    [ensureHub],
  );

  useEffect(() => {
    let unsubMatch: (() => void) | undefined;
    let unsubEnded: (() => void) | undefined;

    void (async () => {
      try {
        const hub = await ensureHub();
        unsubMatch = hub.onMatchFound((event) => {
          void applyMatch(event);
        });
        unsubEnded = hub.onSessionEnded((event) => {
          setSessionEnded(event);
          setPhase("results");
          void queryClient.invalidateQueries({
            queryKey: challengeStationQueryKeys.points(),
          });
          void queryClient.invalidateQueries({
            queryKey: challengeStationQueryKeys.achievements(),
          });
          void queryClient.invalidateQueries({
            queryKey: ["student-path-stations"],
          });
          void queryClient.invalidateQueries({
            queryKey: ["student-course-progress"],
          });
        });
      } catch {
        // hub connect deferred until queue
      }
    })();

    return () => {
      unsubMatch?.();
      unsubEnded?.();
    };
  }, [applyMatch, ensureHub, queryClient]);

  useEffect(() => {
    return () => {
      void hubRef.current?.disconnect();
    };
  }, []);

  useEffect(() => {
    if (phase !== "matchmaking" || waitStartedAt == null) return;
    const timer = window.setInterval(() => {
      setWaitSeconds(Math.max(0, Math.floor((Date.now() - waitStartedAt) / 1000)));
    }, 500);
    return () => window.clearInterval(timer);
  }, [phase, waitStartedAt]);

  useEffect(() => {
    if (phase !== "lobby" || countdown == null) return;
    if (countdown <= 0) {
      setPhase("duel");
      setQuestionIndex(0);
      setQuestionStartedAt(Date.now());
      setRemainingSeconds(durationMinutes * 60);
      return;
    }
    const timer = window.setTimeout(() => setCountdown((c) => (c == null ? null : c - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [phase, countdown, durationMinutes]);

  useEffect(() => {
    if (phase !== "duel") return;
    const timer = window.setInterval(() => {
      setRemainingSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== "duel" || !sessionId) return;
    const poll = window.setInterval(() => {
      void getChallengeSession(sessionId)
        .then((session) => {
          const me = session.participants.find((p) => p.studentId === currentUserId);
          const opp = session.participants.find((p) => p.studentId !== currentUserId);
          if (me) {
            setMyScore(me.totalScore);
            setMyCorrect(me.correctAnswers);
          }
          if (opp) setOpponentScore(opp.totalScore);
          if (session.winnerId != null || session.status === 2) {
            setSessionEnded({
              winnerId: session.winnerId,
              endReason: "Completed",
              participants: session.participants,
            });
            setPhase("results");
          }
        })
        .catch(() => undefined);
    }, 2500);
    return () => window.clearInterval(poll);
  }, [phase, sessionId, currentUserId]);

  const startQueue = useCallback(async () => {
    if (!challengeId) return;
    setActionError(null);
    setBusy(true);
    try {
      const hub = await ensureHub();
      const connectionId = hub.connectionId;
      if (!connectionId) throw new Error("SignalR connection unavailable");

      setPhase("matchmaking");
      setWaitStartedAt(Date.now());
      setWaitSeconds(0);
      setWarmupAnswer(null);

      const result = await enterChallengeStationQueue({
        challengeId,
        signalRConnectionId: connectionId,
      });

      if (result.matched && result.sessionId) {
        await applyMatch(result);
      }
    } catch (error) {
      setPhase("modes");
      setWaitStartedAt(null);
      setActionError(error instanceof Error ? error.message : "Queue failed");
    } finally {
      setBusy(false);
    }
  }, [applyMatch, challengeId, ensureHub]);

  const startPractice = useCallback(async () => {
    if (!challengeId) return;
    setActionError(null);
    setBusy(true);
    try {
      await ensureHub();
      const result = await startChallengePractice(challengeId);
      if (result.sessionId) {
        setOpponentName(null);
        setOpponentId(null);
        await applyMatch(result);
      } else {
        setActionError("Practice session unavailable");
      }
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Practice failed");
    } finally {
      setBusy(false);
    }
  }, [applyMatch, challengeId, ensureHub]);

  const cancelQueue = useCallback(async () => {
    if (!challengeId) return;
    setBusy(true);
    try {
      await cancelChallengeQueue(challengeId);
    } catch {
      // ignore
    } finally {
      setBusy(false);
      setPhase("modes");
      setWaitStartedAt(null);
    }
  }, [challengeId]);

  const skipCountdown = useCallback(() => {
    setCountdown(0);
  }, []);

  const selectOption = useCallback(
    async (optionId: string) => {
      if (!sessionId || !currentQuestion || isSubmitting || selectedOptionId) return;
      setSelectedOptionId(optionId);
      setIsSubmitting(true);
      setActionError(null);

      const elapsed = questionStartedAt ? Date.now() - questionStartedAt : 99999;
      const multiplier = getSpeedMultiplier(elapsed);
      setSpeedMultiplier(multiplier);

      try {
        const result = await submitChallengeAnswer({
          sessionId,
          questionId: currentQuestion.questionId,
          optionId,
        });
        setMyScore(result.totalScore);
        if (result.pointsEarned > 0) {
          setStreak((s) => s + 1);
          setMyCorrect((c) => c + 1);
        } else {
          setStreak(0);
        }

        if (result.allQuestionsAnswered) {
          if (!finishingRef.current) {
            finishingRef.current = true;
            try {
              await finishChallengeSession(sessionId);
            } catch {
              // SessionEnded hub may still fire
            }
          }
        } else {
          window.setTimeout(() => {
            setQuestionIndex((i) => i + 1);
            setSelectedOptionId(null);
            setQuestionStartedAt(Date.now());
            setIsSubmitting(false);
          }, 450);
          return;
        }
      } catch (error) {
        setSelectedOptionId(null);
        setActionError(error instanceof Error ? error.message : "Answer failed");
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      currentQuestion,
      isSubmitting,
      questionStartedAt,
      selectedOptionId,
      sessionId,
    ],
  );

  const forfeit = useCallback(async () => {
    if (!sessionId) return;
    setBusy(true);
    try {
      await forfeitChallengeSession(sessionId);
      setPhase("results");
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Forfeit failed");
    } finally {
      setBusy(false);
    }
  }, [sessionId]);

  const resetToModes = useCallback(() => {
    setPhase("modes");
    setSessionId(null);
    setOpponentName(null);
    setOpponentId(null);
    setCountdown(null);
    setQuestionIndex(0);
    setMyScore(0);
    setOpponentScore(0);
    setMyCorrect(0);
    setStreak(0);
    setSelectedOptionId(null);
    setSessionEnded(null);
    finishingRef.current = false;
    setActionError(null);
    void overviewQuery.refetch();
  }, [overviewQuery]);

  const isWin = useMemo(() => {
    if (!sessionEnded || !currentUserId) return false;
    return sessionEnded.winnerId === currentUserId;
  }, [sessionEnded, currentUserId]);

  const isTie = useMemo(() => {
    if (!sessionEnded) return false;
    return sessionEnded.winnerId == null;
  }, [sessionEnded]);

  const meFromEnded: ChallengeSessionParticipantDto | null = useMemo(() => {
    if (!sessionEnded) return null;
    return (
      sessionEnded.participants.find((p) => p.studentId === currentUserId) ?? null
    );
  }, [sessionEnded, currentUserId]);

  const levelProgress = getLevelProgressPercent(
    pointsQuery.data?.currentLevel ?? 1,
    pointsQuery.data?.pointsToNextLevel ?? 0,
  );

  const courseTitle =
    courseProgressQuery.data?.courseTitle ||
    introQuery.data?.courseTitle ||
    null;

  return {
    phase,
    busy,
    actionError,
    intro: introQuery.data,
    overview: overviewQuery.data,
    isLoading: introQuery.isLoading || overviewQuery.isLoading,
    isError: introQuery.isError || overviewQuery.isError,
    errorMessage:
      (introQuery.error instanceof Error && introQuery.error.message) ||
      (overviewQuery.error instanceof Error && overviewQuery.error.message) ||
      actionError,
    challengeType: overviewQuery.data?.type ?? ChallengeType.QuickChallenge,
    pathId: pathId || introQuery.data?.learningPathId || null,
    courseId,
    courseTitle,
    pathTitle: introQuery.data?.learningPathTitle ?? null,
    stationName: introQuery.data?.stationName ?? overviewQuery.data?.title ?? "",
    points: pointsQuery.data,
    leaderboard: leaderboardQuery.data,
    achievements: achievementsQuery.data ?? [],
    sessionId,
    opponentName,
    opponentId,
    waitSeconds,
    countdown,
    questions,
    currentQuestion,
    questionIndex,
    questionCount,
    myScore,
    opponentScore,
    myCorrect,
    streak,
    speedMultiplier,
    consecutiveBonus: streak >= 2 ? streak * 100 : 0,
    remainingSeconds,
    durationMinutes,
    selectedOptionId,
    isSubmitting,
    sessionEnded,
    isWin,
    isTie,
    meFromEnded,
    levelProgress,
    warmupAnswer,
    setWarmupAnswer,
    startQueue,
    startPractice,
    cancelQueue,
    skipCountdown,
    selectOption,
    forfeit,
    resetToModes,
    refetchOverview: () => overviewQuery.refetch(),
  };
}

export function useChallengeHubDashboard() {
  const pointsQuery = useQuery({
    queryKey: challengeStationQueryKeys.points(),
    queryFn: () => getStudentPointsSummary(20),
    staleTime: 30_000,
  });

  const leaderboardQuery = useQuery({
    queryKey: [...challengeStationQueryKeys.all, "leaderboard-hub"],
    queryFn: getLeaderboardWidget,
    staleTime: 60_000,
  });

  const achievementsQuery = useQuery({
    queryKey: [...challengeStationQueryKeys.achievements(), "hub"],
    queryFn: () => getAchievementAudit({ pageSize: 6 }),
    staleTime: 30_000,
  });

  return {
    points: pointsQuery.data,
    leaderboard: leaderboardQuery.data,
    achievements: achievementsQuery.data ?? [],
    isLoading:
      pointsQuery.isLoading ||
      leaderboardQuery.isLoading ||
      achievementsQuery.isLoading,
    isError: pointsQuery.isError || leaderboardQuery.isError,
  };
}
