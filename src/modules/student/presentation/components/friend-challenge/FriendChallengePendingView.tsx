"use client";

import { useRouter } from "next/navigation";
import { Loader2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  useFriendChallengeDetail,
  useFriendChallengeMutations,
} from "@/modules/student/application/hooks/useFriendChallengeHub";
import { sessionRouteForPhase } from "@/modules/student/domain/friend-challenge/friend-challenge.utils";
import { FriendChallengeAvatar } from "./FriendChallengeAvatar";
import { ROUTES } from "@/shared/infrastructure/config/routes";

type FriendChallengePendingViewProps = {
  challengeId: string;
};

export function FriendChallengePendingView({ challengeId }: FriendChallengePendingViewProps) {
  const t = useTranslations("student.friendChallenge.pending");
  const router = useRouter();
  const detailQuery = useFriendChallengeDetail(challengeId);
  const { cancelMutation } = useFriendChallengeMutations();
  const item = detailQuery.data;

  if (detailQuery.isLoading || !item) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-[#2b415e]" />
      </div>
    );
  }

  const handleCancel = async () => {
    await cancelMutation.mutateAsync(challengeId);
    router.push(ROUTES.USER.STUDENT.FRIEND_CHALLENGES.HUB);
  };

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-6 rounded-[20px] bg-white p-8 shadow-[0_8px_0_rgba(0,0,0,0.05)]">
      <FriendChallengeAvatar opponent={item.opponent} size="lg" />

      <div className="text-center">
        <h1 className="text-2xl font-bold text-[#2b415e]">
          {t("waitingTitle", { name: item.opponent.fullName })}
        </h1>
        <p className="mt-2 text-sm text-[#64748b]">{t("waitingSubtitle")}</p>
      </div>

      <div className="grid w-full grid-cols-2 gap-4 text-start">
        <InfoBox label={t("fields.subject")} value={item.subjectName} />
        <InfoBox label={t("fields.level")} value={item.difficulty} highlight />
      </div>

      {item.canCancel ? (
        <button
          type="button"
          disabled={cancelMutation.isPending}
          onClick={() => void handleCancel()}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#ff4b4b] py-4 text-base font-bold text-white shadow-[0_4px_0_#d33131]"
        >
          <X className="size-4" />
          {t("cancelInvitation")}
        </button>
      ) : null}

      <button
        type="button"
        onClick={() => router.push(ROUTES.USER.STUDENT.FRIEND_CHALLENGES.HUB)}
        className="text-sm text-[#64748b]"
      >
        {t("cancelSearch")}
      </button>
    </div>
  );
}

function InfoBox({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-xl border border-[#f1f5f9] bg-[#f8fafc] p-4">
      <p className="text-xs text-[#94a3b8]">{label}</p>
      <p className={`mt-1 font-bold ${highlight ? "text-[#ff4b4b]" : "text-[#2b415e]"}`}>
        {value}
      </p>
    </div>
  );
}

export function FriendChallengeInviterWaitingView({ challengeId }: { challengeId: string }) {
  const t = useTranslations("student.friendChallenge.pending");
  const detailQuery = useFriendChallengeDetail(challengeId);
  const item = detailQuery.data;

  if (detailQuery.isLoading || !item) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-[#2b415e]" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 rounded-[20px] bg-white p-8 text-center shadow-[0_8px_0_rgba(0,0,0,0.05)]">
      <FriendChallengeAvatar opponent={item.opponent} size="md" />
      <div>
        <h1 className="text-2xl font-bold text-[#2b415e]">{t("inviterTitle")}</h1>
        <p className="mt-2 text-[#64748b]">{t("inviterSubtitle")}</p>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <InfoBox label={t("fields.type")} value={t("fields.typeValue")} />
        <InfoBox label={t("fields.subject")} value={item.subjectName} />
        <InfoBox label={t("fields.level")} value={item.difficulty} />
        <InfoBox
          label={t("fields.waitingTime")}
          value={`${item.remainingSecondsUntilStart}s`}
          highlight
        />
      </div>
    </div>
  );
}
