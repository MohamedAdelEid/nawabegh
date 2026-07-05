"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useDailyTasks } from "@/modules/student/application/hooks/useDailyTasks";
import { DailyTasksChallengeCard } from "./DailyTasksChallengeCard";
import { DailyTasksHeroCard, DailyTasksWelcomeHeader } from "./DailyTasksHeroCard";
import { DailyTasksLiveCard } from "./DailyTasksLiveCard";
import { DailyTasksSkeleton } from "./DailyTasksSkeleton";
import { ApiFailureAlert } from "@/shared/presentation/components/ui/ApiFailureAlert";
import { Button } from "@/shared/presentation/components/ui/button";
import { ROUTES } from "@/shared/infrastructure/config/routes";

export function DailyTasksDashboard() {
  const t = useTranslations("student.dashboard.dailyTasks");
  const router = useRouter();

  const {
    dashboardQuery,
    dailyTasksQuery,
    heroMission,
    featuredLiveSession,
    featuredChallenge,
    isLoading,
    errorMessage,
    refreshAll,
    handleJoinLive,
    handleEnterChallenge,
    joiningStationId,
    enteringChallengeId,
    joinError,
    challengeError,
  } = useDailyTasks();

  const studentName = dashboardQuery.data?.studentName ?? t("header.fallbackName");
  const peerPercentile = dashboardQuery.data?.stats.betterThanPeersPercentile ?? null;

  const navigateToJourney = (params: { courseId: string; pathId?: string; stationId?: string }) => {
    const search = new URLSearchParams({ courseId: params.courseId });
    if (params.pathId) search.set("pathId", params.pathId);
    if (params.stationId) search.set("stationId", params.stationId);
    router.push(`${ROUTES.USER.STUDENT.JOURNEY}?${search.toString()}`);
  };

  const hasAnyContent =
    Boolean(heroMission) || Boolean(featuredLiveSession) || Boolean(featuredChallenge);

  if (isLoading && !dailyTasksQuery.data) {
    return <DailyTasksSkeleton />;
  }

  if (errorMessage && !dailyTasksQuery.data) {
    return (
      <div className="space-y-4">
        <ApiFailureAlert message={errorMessage} fallbackMessage={t("errors.load")} />
        <Button type="button" variant="outline" onClick={() => void refreshAll()}>
          {t("errors.retry")}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <DailyTasksWelcomeHeader
        studentName={studentName}
        streakDays={null}
        peerPercentile={peerPercentile}
      />

      {joinError ? (
        <ApiFailureAlert message={joinError} fallbackMessage={t("errors.joinLive")} />
      ) : null}
      {challengeError ? (
        <ApiFailureAlert message={challengeError} fallbackMessage={t("errors.enterChallenge")} />
      ) : null}

      {heroMission ? (
        <DailyTasksHeroCard
          mission={heroMission}
          onStart={() =>
            navigateToJourney({
              courseId: heroMission.courseId,
              pathId: heroMission.pathId,
              stationId: heroMission.stationId,
            })
          }
        />
      ) : null}

      {featuredChallenge || featuredLiveSession ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {featuredLiveSession ? (
            <DailyTasksLiveCard
              session={featuredLiveSession}
              isJoining={joiningStationId === featuredLiveSession.stationId}
              onJoin={async () => {
                try {
                  await handleJoinLive(featuredLiveSession.stationId);
                  navigateToJourney({
                    courseId: featuredLiveSession.courseId,
                    stationId: featuredLiveSession.stationId,
                  });
                } catch {
                  /* surfaced via joinError */
                }
              }}
            />
          ) : (
            <DailyTasksPlaceholderCard message={t("empty.noLive")} variant="navy" />
          )}

          {featuredChallenge ? (
            <DailyTasksChallengeCard
              challenge={featuredChallenge}
              isEntering={enteringChallengeId === featuredChallenge.challengeId}
              onEnter={async () => {
                if (!featuredChallenge.canEnter) return;
                try {
                  await handleEnterChallenge(featuredChallenge.challengeId);
                  navigateToJourney({
                    courseId: featuredChallenge.courseId,
                    stationId: featuredChallenge.stationId,
                  });
                } catch {
                  /* surfaced via challengeError */
                }
              }}
            />
          ) : (
            <DailyTasksPlaceholderCard message={t("empty.noChallenge")} variant="gold" />
          )}
        </div>
      ) : null}

      {!hasAnyContent ? (
        <div className="rounded-2xl border border-dashed border-[#cbd5e1] bg-[#f8fafc] px-6 py-12 text-center">
          <p className="mb-6 text-[#64748b]">{t("empty.noTasks")}</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button asChild variant="outline">
              <Link href={ROUTES.USER.STUDENT.COURSES}>{t("empty.exploreCourses")}</Link>
            </Button>
            <Button asChild>
              <Link href={ROUTES.USER.STUDENT.JOURNEY}>{t("empty.viewJourney")}</Link>
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function DailyTasksPlaceholderCard({
  message,
  variant,
}: {
  message: string;
  variant: "gold" | "navy";
}) {
  return (
    <div
      className={
        variant === "gold"
          ? "flex min-h-[385px] items-center justify-center rounded-2xl border border-dashed border-[rgba(255,255,255,0.35)] bg-[#c7af6d]/60 p-8 text-center text-sm font-medium text-white/90"
          : "flex min-h-[385px] items-center justify-center rounded-[32px] border border-dashed border-[#475569] bg-[#2c4260]/60 p-8 text-center text-sm font-medium text-white/80"
      }
    >
      {message}
    </div>
  );
}
