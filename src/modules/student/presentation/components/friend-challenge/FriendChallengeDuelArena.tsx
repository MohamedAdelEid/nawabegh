"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { getOptionLetter } from "@/modules/student/application/lib/onboardingQuiz.utils";
import { useFriendChallengeDuel } from "@/modules/student/application/hooks/useFriendChallengeDuel";
import { FriendChallengeForfeitModal } from "./FriendChallengeForfeitModal";
import { cn } from "@/shared/application/lib/cn";
import { ROUTES } from "@/shared/infrastructure/config/routes";

type FriendChallengeDuelArenaProps = {
  sessionId: string;
};

export function FriendChallengeDuelArena({ sessionId }: FriendChallengeDuelArenaProps) {
  const t = useTranslations("student.friendChallenge.duel");
  const router = useRouter();
  const { data: session } = useSession();
  const [forfeitOpen, setForfeitOpen] = useState(false);

  const {
    sessionQuery,
    questionsQuery,
    currentQuestion,
    currentIndex,
    totalQuestions,
    selectOption,
    isSubmittingAnswer,
    forfeitMutation,
    displayMyScore,
    displayOpponentScore,
    phase,
  } = useFriendChallengeDuel(sessionId, session?.user?.id);

  useEffect(() => {
    if (phase === "WaitingForOpponent") {
      router.replace(`/student/friend-challenges/sessions/${sessionId}/waiting-opponent`);
    } else if (phase === "WaitingForOpponentToFinish") {
      router.replace(`/student/friend-challenges/sessions/${sessionId}/waiting-finish`);
    } else if (phase === "Ended") {
      router.replace(`/student/friend-challenges/sessions/${sessionId}/result`);
    }
  }, [phase, router, sessionId]);

  if (sessionQuery.isLoading || questionsQuery.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f7f7]">
        <Loader2 className="size-10 animate-spin text-[#2b415e]" />
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f7f7]">
        <p className="text-[#64748b]">No questions available</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f7f7]">
      <header className="flex items-center justify-between border-b-4 border-[#f1f5f9] bg-white/80 px-6 py-4">
        <div className="rounded-full bg-[#dbe3f3] px-4 py-2 text-sm font-semibold text-[#2b415e]">
          {t("question", { current: currentIndex + 1, total: totalQuestions })}
        </div>

        <div className="text-start">
          <h1 className="text-lg font-bold text-[#2b415e]">{t("arenaTitle")}</h1>
          <p className="text-xs text-[#64748b]">{t("arenaSubtitle")}</p>
        </div>

        <button
          type="button"
          onClick={() => router.push(ROUTES.USER.STUDENT.FRIEND_CHALLENGES.HUB)}
          className="flex size-10 items-center justify-center rounded-xl bg-[#e9ecef] text-[#64748b]"
        >
          <X className="size-4" />
        </button>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6 text-center">
          <span className="rounded-full bg-[#dbe3f3] px-4 py-1 text-xs font-semibold text-[#2b415e]">
            {currentQuestion.category || t("category")}
          </span>
          <h2 className="mt-6 text-2xl font-bold leading-relaxed text-[#2b415e] sm:text-3xl">
            {currentQuestion.text}
          </h2>
        </div>

        <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {currentQuestion.options.map((option, index) => (
            <button
              key={option.optionId}
              type="button"
              disabled={isSubmittingAnswer}
              onClick={() => void selectOption(option.optionId)}
              className={cn(
                "flex items-center gap-4 rounded-2xl border-2 bg-white px-5 py-5 text-start shadow-[0_4px_0_#e2e8f0] transition hover:border-[#c7af6d]",
                "border-[#e2e8f0] disabled:cursor-not-allowed disabled:opacity-60",
              )}
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#f1f5f9] text-base font-bold text-[#64748b]">
                {getOptionLetter(index)}
              </span>
              <span className="flex-1 text-lg font-bold text-[#2b415e]">{option.text}</span>
            </button>
          ))}
        </div>

        <div className="sticky bottom-0 rounded-[20px] border border-[#e2e8f0] bg-white p-4 shadow-lg">
          <div className="flex items-center justify-between gap-4">
            <div className="text-start">
              <p className="text-xs text-[#64748b]">{session?.user?.name}</p>
              <p className="text-xl font-extrabold text-[#58cc02]">{displayMyScore}</p>
            </div>
            <p className="text-sm text-[#64748b]">{t("opponentAnswering")}</p>
            <div className="text-start">
              <p className="text-xs text-[#64748b]">{t("opponentAnswering")}</p>
              <p className="text-xl font-extrabold text-[#ff4b4b]">{displayOpponentScore}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setForfeitOpen(true)}
            className="mt-4 w-full rounded-xl border border-[#ff4b4b]/30 py-2 text-sm font-bold text-[#ff4b4b]"
          >
            {t("forfeit")}
          </button>
        </div>
      </main>

      <FriendChallengeForfeitModal
        open={forfeitOpen}
        onOpenChange={setForfeitOpen}
        isPending={forfeitMutation.isPending}
        onConfirm={async () => {
          await forfeitMutation.mutateAsync();
          router.replace(`/student/friend-challenges/sessions/${sessionId}/result`);
        }}
      />
    </div>
  );
}
