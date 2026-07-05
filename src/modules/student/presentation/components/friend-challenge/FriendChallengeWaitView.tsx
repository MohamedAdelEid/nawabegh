"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useFriendChallengeSession } from "@/modules/student/application/hooks/useFriendChallengeDuel";
import { sessionRouteForPhase } from "@/modules/student/domain/friend-challenge/friend-challenge.utils";
import { FriendChallengeAvatar } from "./FriendChallengeAvatar";

type FriendChallengeWaitViewProps = {
  sessionId: string;
  mode: "opponent" | "finish";
};

export function FriendChallengeWaitView({ sessionId, mode }: FriendChallengeWaitViewProps) {
  const t = useTranslations("student.friendChallenge.wait");
  const router = useRouter();
  const sessionQuery = useFriendChallengeSession(sessionId);
  const phase = sessionQuery.data?.phase;

  useEffect(() => {
    if (!phase) return;
    if (phase === "InProgress") {
      router.replace(`/student/friend-challenges/sessions/${sessionId}`);
    } else if (phase === "WaitingForOpponentToFinish" && mode === "opponent") {
      router.replace(`/student/friend-challenges/sessions/${sessionId}/waiting-finish`);
    } else if (phase === "Ended") {
      router.replace(`/student/friend-challenges/sessions/${sessionId}/result`);
    }
  }, [mode, phase, router, sessionId]);

  const opponent = sessionQuery.data?.participants[1];

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <Loader2 className="size-12 animate-spin text-[#c7af6d]" aria-hidden />
      <div>
        <h1 className="text-2xl font-bold text-[#2b415e]">
          {mode === "opponent" ? t("opponentTitle") : t("finishTitle")}
        </h1>
        <p className="mt-2 text-[#64748b]">
          {mode === "opponent" ? t("opponentSubtitle") : t("finishSubtitle")}
        </p>
      </div>
      {opponent ? (
        <FriendChallengeAvatar
          opponent={{ fullName: "Opponent", profileImageUrl: null }}
          size="md"
        />
      ) : null}
    </div>
  );
}
