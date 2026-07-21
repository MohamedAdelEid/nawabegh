"use client";

import { Zap } from "lucide-react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { getLevelTitle } from "@/modules/student/domain/challenge-station/challenge-station.utils";
import type { LeaderboardWidgetDto } from "@/modules/student/domain/types/student-home.types";
import { ChallengeArenaHeader } from "./ChallengeArenaHeader";

type ChallengeLobbyViewProps = {
  opponentName: string | null;
  questionCount: number;
  remainingSeconds: number;
  countdown: number | null;
  currentLevel: number;
  totalPoints: number;
  leaderboard?: LeaderboardWidgetDto;
  onSkip: () => void;
  onClose: () => void;
};

export function ChallengeLobbyView({
  opponentName,
  questionCount,
  remainingSeconds,
  countdown,
  currentLevel,
  totalPoints,
  leaderboard,
  onSkip,
  onClose,
}: ChallengeLobbyViewProps) {
  const t = useTranslations("student.dashboard.challengeStation");
  const { data: session } = useSession();
  const meName = session?.user?.name || t("lobby.youFallback");
  const myRank = leaderboard?.currentUser?.rank;
  const myPoints = leaderboard?.currentUser?.currentPoints ?? totalPoints;

  return (
    <div className="min-h-screen bg-[#f6f7f7]">
      <ChallengeArenaHeader
        questionLabel={t("arena.question", { current: 0, total: questionCount || 20 })}
        remainingSeconds={remainingSeconds || 15 * 60}
        onClose={onClose}
      />

      <div className="mx-auto flex max-w-5xl flex-col items-center px-4 py-10">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border-2 border-[rgba(199,175,109,0.2)] bg-[rgba(199,175,109,0.1)] px-6 py-2 text-sm font-bold text-[#3f4754] shadow-[0_8px_0_rgba(0,0,0,0.05)]">
          {t("lobby.topTenHint")}
        </div>
        <h1 className="mb-10 text-center text-3xl font-bold tracking-tight text-[#2b415e] sm:text-4xl">
          {t("lobby.title")}
        </h1>

        <div className="flex w-full flex-col items-center gap-8 lg:flex-row lg:justify-center lg:gap-12">
          <PlayerCard
            role="opponent"
            roleLabel={t("lobby.opponent")}
            name={opponentName || t("lobby.opponentFallback")}
            level={currentLevel + 2}
            title={getLevelTitle(currentLevel + 2)}
            points={Math.max(myPoints + 320, 4820)}
            rank={myRank ? myRank - 20 : 118}
            accent="red"
          />

          <div className="flex flex-col items-center">
            <p className="text-[96px] font-extrabold leading-none text-[#c7af6d] drop-shadow-[0_0_20px_rgba(199,175,109,0.4)]">
              VS
            </p>
            <div className="mt-4 flex size-20 items-center justify-center rounded-full border-4 border-[#c7af6d] bg-[#021c37] text-4xl font-extrabold text-white shadow-[0_8px_0_rgba(0,0,0,0.05)]">
              {countdown != null && countdown > 0 ? countdown : "…"}
            </div>
          </div>

          <PlayerCard
            role="you"
            roleLabel={t("lobby.you")}
            name={meName}
            level={currentLevel}
            title={getLevelTitle(currentLevel)}
            points={myPoints}
            rank={myRank ?? 142}
            accent="navy"
          />
        </div>

        <div className="mt-12 max-w-md space-y-2 text-center">
          <p className="text-lg font-medium text-[#64748b]">{t("lobby.ready")}</p>
          <p className="text-sm text-[#94a3b8]">{t("lobby.hint")}</p>
        </div>

        <button
          type="button"
          onClick={onSkip}
          className="mt-8 inline-flex items-center gap-3 rounded-2xl bg-[#2b415e] px-12 py-5 text-xl font-bold text-white shadow-[0_4px_0_#1e2e42] transition hover:brightness-110"
        >
          <Zap className="size-5 fill-current" />
          {t("lobby.cta")}
        </button>
      </div>
    </div>
  );
}

function PlayerCard({
  roleLabel,
  name,
  level,
  title,
  points,
  rank,
  accent,
}: {
  role: "you" | "opponent";
  roleLabel: string;
  name: string;
  level: number;
  title: string;
  points: number;
  rank: number;
  accent: "red" | "navy";
}) {
  const t = useTranslations("student.dashboard.challengeStation.lobby");
  const isRed = accent === "red";

  return (
    <article
      className={`relative w-full max-w-[320px] rounded-[20px] border-2 bg-white p-8 shadow-[0_8px_0_rgba(0,0,0,0.05)] ${
        isRed ? "border-[rgba(255,75,75,0.1)]" : "border-[rgba(43,65,94,0.05)]"
      }`}
    >
      <span
        className={`absolute start-1/2 top-[-14px] -translate-x-1/2 rounded-full px-4 py-1 text-xs font-bold text-white ${
          isRed ? "bg-[#ff4b4b]" : "bg-[#2b415e]"
        }`}
      >
        {roleLabel}
      </span>
      <div
        className={`mx-auto mb-4 size-32 rounded-full p-1 shadow-[0_8px_0_rgba(0,0,0,0.05)] ${
          isRed
            ? "bg-gradient-to-b from-[#ff4b4b] to-[#ffe4e4]"
            : "bg-gradient-to-b from-[#2b415e] to-[#dbe3f3]"
        }`}
      >
        <div className="flex size-full items-center justify-center rounded-full bg-[#e2e8f0] text-3xl font-bold text-[#2b415e]">
          {name.slice(0, 1)}
        </div>
      </div>
      <h2 className="text-center text-2xl font-bold text-[#2b415e]">{name}</h2>
      <div className="mt-2 flex items-center justify-center gap-2 text-sm text-[#64748b]">
        <span>{title}</span>
        <span className="size-1 rounded-full bg-[#cbd5e1]" />
        <span
          className={`rounded-full px-3 py-0.5 text-sm font-semibold ${
            isRed ? "bg-[rgba(255,75,75,0.1)] text-[#ff4b4b]" : "bg-[rgba(43,65,94,0.1)] text-[#2b415e]"
          }`}
        >
          {t("level", { level })}
        </span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-[#f6f7f7] p-3 text-center">
          <p className="text-[10px] font-bold uppercase text-[#94a3b8]">{t("points")}</p>
          <p className="text-lg font-extrabold text-[#2b415e]">
            {points.toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl bg-[#f6f7f7] p-3 text-center">
          <p className="text-[10px] font-bold uppercase text-[#94a3b8]">{t("rank")}</p>
          <p className="text-lg font-extrabold text-[#2b415e]">#{rank}</p>
        </div>
      </div>
    </article>
  );
}
