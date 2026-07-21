"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useChallengeStation } from "@/modules/student/application/hooks/useChallengeStation";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { ChallengeDuelView } from "./ChallengeDuelView";
import { ChallengeLobbyView } from "./ChallengeLobbyView";
import { ChallengeMatchmakingView } from "./ChallengeMatchmakingView";
import { ChallengeModesView } from "./ChallengeModesView";
import { ChallengeResultsView } from "./ChallengeResultsView";
import { ChallengeStationSkeleton } from "./ChallengeStationSkeleton";

type ChallengeStationDashboardProps = {
  stationId: string;
};

export function ChallengeStationDashboard({
  stationId,
}: ChallengeStationDashboardProps) {
  const t = useTranslations("student.dashboard.challengeStation");
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId");
  const pathId = searchParams.get("pathId");

  const station = useChallengeStation({ stationId, courseId, pathId });

  const goBack = () => {
    const params = new URLSearchParams();
    if (courseId) params.set("courseId", courseId);
    if (pathId || station.pathId) params.set("pathId", pathId || station.pathId || "");
    const qs = params.toString();
    router.push(qs ? `${ROUTES.USER.STUDENT.JOURNEY}?${qs}` : ROUTES.USER.STUDENT.JOURNEY);
  };

  if (station.isLoading) {
    return <ChallengeStationSkeleton variant="modes" />;
  }

  if (station.isError || !station.overview) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#f6f7f7] px-4">
        <p className="text-center text-[#64748b]">
          {station.errorMessage || t("errors.load")}
        </p>
        <button
          type="button"
          onClick={goBack}
          className="rounded-2xl bg-[#2b415e] px-6 py-3 font-bold text-white"
        >
          {t("modes.backToJourney")}
        </button>
      </div>
    );
  }

  if (station.phase === "matchmaking") {
    return (
      <ChallengeMatchmakingView
        challengeType={station.challengeType}
        level={station.points?.currentLevel ?? 1}
        waitSeconds={station.waitSeconds}
        courseTitle={station.courseTitle}
        busy={station.busy}
        warmupAnswer={station.warmupAnswer}
        onWarmupSelect={station.setWarmupAnswer}
        onCancel={() => void station.cancelQueue()}
      />
    );
  }

  if (station.phase === "lobby") {
    return (
      <ChallengeLobbyView
        opponentName={station.opponentName}
        questionCount={station.questionCount}
        remainingSeconds={station.durationMinutes * 60}
        countdown={station.countdown}
        currentLevel={station.points?.currentLevel ?? 1}
        totalPoints={station.points?.totalPoints ?? 0}
        leaderboard={station.leaderboard}
        onSkip={station.skipCountdown}
        onClose={goBack}
      />
    );
  }

  if (station.phase === "duel" && station.currentQuestion) {
    return (
      <ChallengeDuelView
        question={station.currentQuestion}
        questionIndex={station.questionIndex}
        questionCount={station.questionCount || station.questions.length}
        remainingSeconds={station.remainingSeconds}
        myScore={station.myScore}
        opponentScore={station.opponentScore}
        opponentName={station.opponentName}
        myLevel={station.points?.currentLevel ?? 1}
        speedMultiplier={station.speedMultiplier}
        consecutiveBonus={station.consecutiveBonus}
        streak={station.streak}
        selectedOptionId={station.selectedOptionId}
        isSubmitting={station.isSubmitting}
        onSelect={(optionId) => void station.selectOption(optionId)}
        onClose={() => void station.forfeit()}
      />
    );
  }

  if (station.phase === "duel") {
    return <ChallengeStationSkeleton variant="arena" />;
  }

  if (station.phase === "results") {
    const xp =
      station.meFromEnded?.totalScore ||
      station.points?.recentTransactions?.[0]?.amount ||
      0;
    const canRetry =
      Boolean(station.overview.canEnter) ||
      Boolean(station.overview.canTrainAgain) ||
      Boolean(station.overview.canReplay);

    return (
      <ChallengeResultsView
        isWin={station.isWin}
        isTie={station.isTie}
        correctAnswers={station.meFromEnded?.correctAnswers ?? station.myCorrect}
        questionCount={station.questionCount || station.questions.length}
        xpEarned={xp}
        currentLevel={station.points?.currentLevel ?? 1}
        pointsToNextLevel={station.points?.pointsToNextLevel ?? 0}
        levelProgress={station.levelProgress}
        rank={station.leaderboard?.currentUser?.rank ?? null}
        achievements={station.achievements}
        canRetry={canRetry}
        courseTitle={station.courseTitle}
        pathId={station.pathId}
        courseId={courseId}
        onRetry={station.resetToModes}
        onNewChallenge={station.resetToModes}
      />
    );
  }

  return (
    <ChallengeModesView
      overview={station.overview}
      courseTitle={station.courseTitle}
      busy={station.busy}
      errorMessage={station.actionError}
      onStartQuickOrRanked={() => void station.startQueue()}
      onStartPractice={() => void station.startPractice()}
      pathId={station.pathId}
      courseId={courseId}
    />
  );
}
