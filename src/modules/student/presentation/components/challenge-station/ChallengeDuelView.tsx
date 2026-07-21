"use client";

import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import type { ChallengeQuestionDto } from "@/modules/student/domain/challenge-station/challenge-station.types";
import { getOptionLetter } from "@/modules/student/domain/challenge-station/challenge-station.utils";
import { cn } from "@/shared/application/lib/cn";
import { ChallengeArenaHeader } from "./ChallengeArenaHeader";

type ChallengeDuelViewProps = {
  question: ChallengeQuestionDto;
  questionIndex: number;
  questionCount: number;
  remainingSeconds: number;
  myScore: number;
  opponentScore: number;
  opponentName: string | null;
  myLevel: number;
  speedMultiplier: number;
  consecutiveBonus: number;
  streak: number;
  selectedOptionId: string | null;
  isSubmitting: boolean;
  onSelect: (optionId: string) => void;
  onClose: () => void;
};

export function ChallengeDuelView({
  question,
  questionIndex,
  questionCount,
  remainingSeconds,
  myScore,
  opponentScore,
  opponentName,
  myLevel,
  speedMultiplier,
  consecutiveBonus,
  streak,
  selectedOptionId,
  isSubmitting,
  onSelect,
  onClose,
}: ChallengeDuelViewProps) {
  const t = useTranslations("student.dashboard.challengeStation");
  const { data: session } = useSession();
  const myName = session?.user?.name?.split(" ")[0] || t("duel.youShort");
  const oppName = opponentName?.split(" ")[0] || t("duel.opponentShort");
  const maxScore = Math.max(myScore, opponentScore, 1);
  const myPct = Math.round((myScore / maxScore) * 100);
  const oppPct = Math.round((opponentScore / maxScore) * 100);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <ChallengeArenaHeader
        questionLabel={t("arena.question", {
          current: questionIndex + 1,
          total: questionCount || questionIndex + 1,
        })}
        remainingSeconds={remainingSeconds}
        onClose={onClose}
      />

      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-6 sm:px-8">
        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          <div className="flex items-center justify-between rounded-2xl bg-[#f4ecd8] px-5 py-4">
            <div className="text-start">
              <p className="text-sm font-bold text-[#a38f5a]">{t("duel.streakBonus")}</p>
              <p className="text-2xl font-extrabold text-[#2b415e]">
                +{consecutiveBonus || 0}
              </p>
            </div>
            <span className="flex size-12 items-center justify-center rounded-full bg-white text-xl">
              ★
            </span>
          </div>
          <div className="flex items-center justify-between rounded-2xl bg-[#dcf4cb] px-5 py-4">
            <div className="text-start">
              <p className="text-sm font-bold text-[#46a302]">{t("duel.speedBonus")}</p>
              <p className="text-2xl font-extrabold text-[#2b415e]">×{speedMultiplier}</p>
            </div>
            <span className="flex size-12 items-center justify-center rounded-full bg-white text-xl">
              ⚡
            </span>
          </div>
        </div>

        {question.category ? (
          <span className="mx-auto mb-4 rounded-full bg-[#dbe3f3] px-4 py-1 text-sm font-semibold text-[#2b415e]">
            {question.category}
          </span>
        ) : null}

        <h2 className="mb-10 text-center text-2xl font-bold leading-relaxed text-[#2b415e] sm:text-3xl">
          {question.text}
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          {question.options.map((option, index) => {
            const selected = selectedOptionId === option.optionId;
            return (
              <button
                key={option.optionId}
                type="button"
                disabled={isSubmitting || Boolean(selectedOptionId)}
                onClick={() => onSelect(option.optionId)}
                className={cn(
                  "flex items-center gap-3 rounded-2xl border-2 bg-white px-4 py-5 text-start shadow-[0_8px_0_rgba(0,0,0,0.05)] transition",
                  selected
                    ? "border-[#c7af6d] bg-[#f4ecd8]"
                    : "border-[#f1f5f9] hover:border-[#c7af6d]",
                  "disabled:cursor-not-allowed",
                )}
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#f1f5f9] text-sm font-bold text-[#64748b]">
                  {getOptionLetter(index)}
                </span>
                <span className="text-base font-semibold text-[#2b415e]">{option.text}</span>
              </button>
            );
          })}
        </div>
      </div>

      <footer className="border-t border-[#f1f5f9] bg-[#f8fafc] px-4 py-5 sm:px-8">
        <div className="mx-auto flex max-w-5xl items-center gap-4">
          <PlayerSide
            name={oppName}
            level={myLevel + 2}
            score={opponentScore}
            percent={oppPct}
            tone="red"
            badge={t("duel.streak")}
          />
          <div className="flex shrink-0 flex-col items-center px-2">
            <div className="flex size-12 items-center justify-center rounded-full bg-[#2b415e] text-sm font-extrabold text-white">
              VS
            </div>
            <p className="mt-2 text-center text-xs font-semibold text-[#58cc02]">
              {t("duel.opponentAnswering")}
            </p>
          </div>
          <PlayerSide
            name={`${t("duel.youShort")} (${myName})`}
            level={myLevel}
            score={myScore}
            percent={myPct}
            tone="green"
            badge={streak >= 2 ? t("duel.combo", { count: streak }) : t("duel.ready")}
            alignEnd
          />
        </div>
      </footer>
    </div>
  );
}

function PlayerSide({
  name,
  level,
  score,
  percent,
  tone,
  badge,
  alignEnd,
}: {
  name: string;
  level: number;
  score: number;
  percent: number;
  tone: "red" | "green";
  badge: string;
  alignEnd?: boolean;
}) {
  const t = useTranslations("student.dashboard.challengeStation.duel");
  const barColor = tone === "red" ? "bg-[#ff4b4b]" : "bg-[#58cc02]";

  return (
    <div className={cn("min-w-0 flex-1", alignEnd && "text-end")}>
      <div className={cn("mb-2 flex items-center gap-2", alignEnd && "flex-row-reverse")}>
        <div className="flex size-10 items-center justify-center rounded-full bg-[#e2e8f0] text-sm font-bold text-[#2b415e]">
          {name.slice(0, 1)}
        </div>
        <div>
          <p className="text-sm font-bold text-[#2b415e]">{name}</p>
          <p className="text-xs text-[#94a3b8]">{t("level", { level })}</p>
        </div>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[#e2e8f0]">
        <div
          className={cn("h-full rounded-full transition-all", barColor)}
          style={{ width: `${Math.max(8, percent)}%` }}
        />
      </div>
      <div className={cn("mt-2 flex items-center gap-2", alignEnd && "justify-end")}>
        <span className="text-lg font-extrabold text-[#2b415e]">
          {score.toLocaleString()}
        </span>
        <span className="text-[10px] font-bold uppercase text-[#94a3b8]">{badge}</span>
      </div>
    </div>
  );
}
