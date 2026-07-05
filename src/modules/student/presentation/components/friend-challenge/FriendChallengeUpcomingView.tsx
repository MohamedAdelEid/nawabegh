"use client";

import { useRouter } from "next/navigation";
import { Loader2, Zap } from "lucide-react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import {
  useFriendChallengeDetail,
  useFriendChallengeMutations,
} from "@/modules/student/application/hooks/useFriendChallengeHub";
import { sessionRouteForPhase } from "@/modules/student/domain/friend-challenge/friend-challenge.utils";
import { FriendChallengeCountdownPill } from "./FriendChallengeCountdownPill";
import { FriendChallengePlayerCard } from "./FriendChallengeCards";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { cn } from "@/shared/application/lib/cn";

type FriendChallengeUpcomingViewProps = {
  challengeId: string;
};

export function FriendChallengeUpcomingView({ challengeId }: FriendChallengeUpcomingViewProps) {
  const t = useTranslations("student.friendChallenge.upcoming");
  const tCommon = useTranslations("student.friendChallenge.common");
  const router = useRouter();
  const { data: session } = useSession();
  const detailQuery = useFriendChallengeDetail(challengeId);
  const { enterMutation } = useFriendChallengeMutations();
  const item = detailQuery.data;

  const selfName = session?.user?.name ?? t("you");
  const selfImage = session?.user?.image ?? null;

  if (detailQuery.isLoading || !item) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-[#2b415e]" />
      </div>
    );
  }

  const handleEnter = async () => {
    if (!item.canEnter) return;
    const result = await enterMutation.mutateAsync({ challengeId });
    router.push(sessionRouteForPhase(result.sessionId, result.phase));
  };

  const countdownSeconds =
    item.remainingSecondsUntilStart > 0
      ? item.remainingSecondsUntilStart
      : item.remainingSecondsUntilEnd;

  return (
    <div className="mx-auto max-w-5xl space-y-10 py-6">
      <FriendChallengeCountdownPill
        seconds={countdownSeconds}
        label={t("countdownLabel")}
        variant="danger"
      />

      <div className="text-center">
        <h1 className="text-3xl font-bold text-[#2b415e]">{t("title")}</h1>
      </div>

      <div className="flex flex-col items-center justify-center gap-8 lg:flex-row">
        <FriendChallengePlayerCard
          name={item.opponent.fullName}
          profileImageUrl={item.opponent.profileImageUrl}
          level={item.opponent.level}
          rank={item.opponent.schoolRank}
          badge={t("opponent")}
          variant="opponent"
        />

        <div className="flex flex-col items-center gap-4">
          <span className="text-7xl font-extrabold text-[#c7af6d] drop-shadow-sm">
            {tCommon("vs")}
          </span>
        </div>

        <FriendChallengePlayerCard
          name={selfName}
          profileImageUrl={selfImage}
          badge={t("you")}
          variant="self"
        />
      </div>

      <div className="flex flex-col items-center gap-4 text-center">
        <p className="text-lg font-medium text-[#64748b]">{t("hint")}</p>
        <p className="text-sm text-[#94a3b8]">{t("tip")}</p>

        <button
          type="button"
          disabled={!item.canEnter || enterMutation.isPending}
          onClick={() => void handleEnter()}
          className={cn(
            "inline-flex items-center gap-2 rounded-2xl px-12 py-5 text-xl font-bold text-white shadow-[0_4px_0_#1e2e42]",
            item.canEnter ? "bg-[#2b415e]" : "cursor-not-allowed bg-[#2b415e]/40",
          )}
        >
          <Zap className="size-5" />
          {t("enterNow")}
        </button>

        {!item.canEnter ? (
          <p className="text-sm text-[#94a3b8]">{t("enterDisabledHint")}</p>
        ) : null}
      </div>
    </div>
  );
}
