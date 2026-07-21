"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useChallengeHubDashboard } from "@/modules/student/application/hooks/useChallengeStation";
import { useDailyTasks } from "@/modules/student/application/hooks/useDailyTasks";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { CHALLENGE_STATION_ASSETS } from "./challenge-station.assets";
import { ChallengeStationSkeleton } from "./ChallengeStationSkeleton";

export function ChallengeHubDashboard() {
  const t = useTranslations("student.dashboard.challengeStation.hub");
  const { points, leaderboard, achievements, isLoading } = useChallengeHubDashboard();
  const dailyTasks = useDailyTasks();

  if (isLoading) {
    return <ChallengeStationSkeleton variant="hub" />;
  }

  const openChallenge =
    dailyTasks.featuredChallenge ??
    dailyTasks.dailyTasksQuery.data?.challenges?.find((c) => c.canEnter) ??
    null;
  const startHref = openChallenge?.stationId
    ? ROUTES.USER.STUDENT.CHALLENGE_STATION(openChallenge.stationId)
    : ROUTES.USER.STUDENT.JOURNEY;

  const practiceHref = startHref;

  return (
    <div className="min-h-[70vh] bg-[#f6f7f7] px-4 py-8 sm:px-6">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.45fr_1fr]">
        <section className="relative overflow-hidden rounded-[28px] bg-[#2b415e] p-8 text-white shadow-[0_8px_0_#1a2839]">
          <div className="absolute -start-8 bottom-0 size-48 opacity-30">
            <Image
              src={CHALLENGE_STATION_ASSETS.heroSword}
              alt=""
              fill
              className="object-contain"
              unoptimized
            />
          </div>
          <span className="relative z-10 inline-flex rounded-full bg-[#c7af6d] px-4 py-1 text-sm font-bold text-[#271900]">
            {t("badge")}
          </span>
          <h1 className="relative z-10 mt-4 text-3xl font-bold sm:text-4xl">{t("title")}</h1>
          <p className="relative z-10 mt-3 max-w-lg text-[#d3e3ff]">{t("subtitle")}</p>
          <div className="relative z-10 mt-8 flex flex-wrap gap-3">
            <Link
              href={startHref}
              className="rounded-2xl bg-[#c7af6d] px-6 py-3 text-sm font-bold text-[#271900] shadow-[0_4px_0_#a38f5a]"
            >
              {t("start")}
            </Link>
            <Link
              href={practiceHref}
              className="rounded-2xl border border-white/40 bg-[#1e2e42] px-6 py-3 text-sm font-bold text-white"
            >
              {t("practice")}
            </Link>
          </div>
        </section>

        <section className="rounded-[28px] bg-white p-6 shadow-[0_8px_0_rgba(0,0,0,0.05)]">
          <div className="mb-4 flex items-center gap-2">
            <span className="relative size-5 overflow-hidden">
              <Image
                src={CHALLENGE_STATION_ASSETS.chart}
                alt=""
                fill
                className="object-contain"
                unoptimized
              />
            </span>
            <h2 className="text-lg font-bold text-[#2b415e]">{t("statsTitle")}</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Stat label={t("points")} value={(points?.totalPoints ?? 0).toLocaleString()} />
            <Stat
              label={t("rank")}
              value={
                leaderboard?.currentUser?.rank
                  ? `#${leaderboard.currentUser.rank}`
                  : "—"
              }
            />
            <Stat label={t("level")} value={String(points?.currentLevel ?? 1)} />
            <Stat
              label={t("toNext")}
              value={(points?.pointsToNextLevel ?? 0).toLocaleString()}
            />
          </div>
        </section>

        <section className="rounded-[28px] bg-white p-6 shadow-[0_8px_0_rgba(0,0,0,0.05)]">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#2b415e]">{t("missionsTitle")}</h2>
          </div>
          <div className="space-y-4">
            {(achievements.length
              ? achievements
              : dailyTasks.dailyTasksQuery.data?.challenges?.slice(0, 2).map((c) => ({
                  key: c.challengeId,
                  title: c.title,
                  description: c.courseTitle,
                  targetCount: 1,
                  currentCount: c.canEnter ? 0 : 1,
                  rewardXp: c.pointsReward,
                  isCompleted: !c.canEnter,
                })) || []
            )
              .slice(0, 3)
              .map((item) => {
                const pct = Math.min(
                  100,
                  Math.round(
                    (item.currentCount / Math.max(1, item.targetCount)) * 100,
                  ),
                );
                return (
                  <div key={item.key} className="rounded-2xl bg-[#f8fafc] p-4">
                    <div className="mb-2 flex justify-between gap-2 text-sm">
                      <span className="font-bold text-[#2b415e]">{item.title}</span>
                      <span className="text-[#94a3b8]">
                        {item.currentCount}/{item.targetCount}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-[#e2e8f0]">
                      <div
                        className="h-full rounded-full bg-[#c7af6d]"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </section>

        <section className="space-y-4">
          <article className="rounded-[28px] bg-white p-6 shadow-[0_8px_0_rgba(0,0,0,0.05)]">
            <h2 className="mb-4 text-lg font-bold text-[#2b415e]">{t("rewardsTitle")}</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 rounded-2xl bg-[#f8fafc] p-4">
                <span className="relative size-6 overflow-hidden">
                  <Image
                    src={CHALLENGE_STATION_ASSETS.star}
                    alt=""
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </span>
                <p className="font-semibold text-[#2b415e]">
                  {t("winReward", {
                    points: openChallenge?.pointsReward ?? 120,
                  })}
                </p>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-[#f4ecd8] p-4">
                <span className="relative size-6 overflow-hidden">
                  <Image
                    src={CHALLENGE_STATION_ASSETS.bolt}
                    alt=""
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </span>
                <p className="font-semibold text-[#a38f5a]">{t("speedReward")}</p>
              </div>
            </div>
          </article>

          <article className="rounded-[28px] bg-white p-6 shadow-[0_8px_0_rgba(0,0,0,0.05)]">
            <h2 className="mb-4 text-lg font-bold text-[#2b415e]">{t("activityTitle")}</h2>
            <ul className="space-y-3">
              {(points?.recentTransactions ?? []).slice(0, 5).map((tx, index) => (
                <li
                  key={`${tx.reason}-${tx.createdAt}-${index}`}
                  className="flex items-center justify-between gap-3 rounded-2xl bg-[#f8fafc] px-4 py-3"
                >
                  <span className="text-sm font-semibold text-[#2b415e]">{tx.reason}</span>
                  <span className="text-sm font-bold text-[#58cc02]">
                    +{tx.amount}xp
                  </span>
                </li>
              ))}
              {(points?.recentTransactions?.length ?? 0) === 0 ? (
                <li className="text-sm text-[#94a3b8]">{t("activityEmpty")}</li>
              ) : null}
            </ul>
          </article>
        </section>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[#f8fafc] p-4 text-center">
      <p className="text-xs font-bold text-[#94a3b8]">{label}</p>
      <p className="mt-1 text-xl font-extrabold text-[#2b415e]">{value}</p>
    </div>
  );
}
