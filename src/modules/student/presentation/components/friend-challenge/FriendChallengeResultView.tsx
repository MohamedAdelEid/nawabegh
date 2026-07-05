"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Trophy } from "lucide-react";
import { useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { useFriendChallengeResult } from "@/modules/student/application/hooks/useFriendChallengeDuel";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { cn } from "@/shared/application/lib/cn";

type FriendChallengeResultViewProps = {
  sessionId: string;
};

export function FriendChallengeResultView({ sessionId }: FriendChallengeResultViewProps) {
  const t = useTranslations("student.friendChallenge.result");
  const locale = useLocale();
  const router = useRouter();
  const { data: authSession } = useSession();
  const resultQuery = useFriendChallengeResult(sessionId);
  const result = resultQuery.data;

  const formatNumber = (value: number) =>
    new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US").format(value);

  if (resultQuery.isLoading || !result) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-[#2b415e]" />
      </div>
    );
  }

  const myId = authSession?.user?.id;
  const myParticipant = result.participants.find((p) => p.studentId === myId);
  const opponentParticipant = result.participants.find((p) => p.studentId !== myId);
  const isWin = myParticipant?.isWinner === true;
  const isTie = result.isTie;

  const title = isTie ? t("tieTitle") : isWin ? t("winTitle") : t("lossTitle");

  return (
    <div className="mx-auto max-w-2xl space-y-8 py-10 text-center">
      <div
        className={cn(
          "mx-auto flex size-20 items-center justify-center rounded-full",
          isTie ? "bg-[#f1f5f9] text-[#64748b]" : isWin ? "bg-[#dcf4cb] text-[#58cc02]" : "bg-[#ffe4e4] text-[#ff4b4b]",
        )}
      >
        <Trophy className="size-10" />
      </div>

      <div>
        <h1 className="text-3xl font-bold text-[#2b415e]">{title}</h1>
        {isTie ? <p className="mt-2 text-[#64748b]">{t("tieBody")}</p> : null}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <ScoreCard
          label={t("myScore")}
          score={myParticipant?.totalScore ?? 0}
          correct={myParticipant?.correctAnswers ?? 0}
          formatNumber={formatNumber}
        />
        <ScoreCard
          label={t("opponentScore")}
          score={opponentParticipant?.totalScore ?? 0}
          correct={opponentParticipant?.correctAnswers ?? 0}
          formatNumber={formatNumber}
        />
      </div>

      {!isTie && result.wagerPoints > 0 ? (
        <p
          className={cn(
            "text-xl font-bold",
            isWin ? "text-[#58cc02]" : "text-[#ff4b4b]",
          )}
        >
          {isWin
            ? t("wagerWon", { points: formatNumber(result.wagerPoints) })
            : t("wagerLost", { points: formatNumber(result.wagerPoints) })}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          href={ROUTES.USER.STUDENT.FRIEND_CHALLENGES.HUB}
          className="rounded-2xl bg-[#2b415e] px-8 py-4 font-bold text-white shadow-[0_4px_0_#1e2e42]"
        >
          {t("backToHub")}
        </Link>
        <button
          type="button"
          onClick={() => router.push(ROUTES.USER.STUDENT.FRIEND_CHALLENGES.HUB)}
          className="rounded-2xl border-2 border-[#c7af6d] px-8 py-4 font-bold text-[#a38f5a]"
        >
          {t("newChallenge")}
        </button>
      </div>
    </div>
  );
}

function ScoreCard({
  label,
  score,
  correct,
  formatNumber,
}: {
  label: string;
  score: number;
  correct: number;
  formatNumber: (value: number) => string;
}) {
  const t = useTranslations("student.friendChallenge.result");
  return (
    <div className="rounded-2xl border border-[#e2e8f0] bg-white p-6 text-start shadow-sm">
      <p className="text-sm text-[#64748b]">{label}</p>
      <p className="mt-2 text-3xl font-extrabold text-[#2b415e]">{formatNumber(score)}</p>
      <p className="mt-1 text-xs text-[#94a3b8]">{t("correctAnswers", { count: correct })}</p>
    </div>
  );
}
