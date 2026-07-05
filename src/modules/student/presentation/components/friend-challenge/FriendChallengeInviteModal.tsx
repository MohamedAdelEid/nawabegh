"use client";

import { Loader2, Swords, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import {
  useFriendChallengeDetail,
  useFriendChallengeMutations,
} from "@/modules/student/application/hooks/useFriendChallengeHub";
import { FriendChallengeAvatar } from "./FriendChallengeAvatar";
import { FriendChallengeCountdownPill } from "./FriendChallengeCountdownPill";
import { ModalClose, ModalShell, ModalTitle } from "@/shared/presentation/components/ui/modal-shell";
import { formatScheduleDateOnly } from "@/modules/student/domain/friend-challenge/friend-challenge.utils";

type FriendChallengeInviteModalProps = {
  challengeId: string | null;
  onClose: () => void;
  onAccepted: () => void;
  onError: (error: unknown) => void;
};

export function FriendChallengeInviteModal({
  challengeId,
  onClose,
  onAccepted,
  onError,
}: FriendChallengeInviteModalProps) {
  const t = useTranslations("student.friendChallenge.invite");
  const locale = useLocale();
  const open = Boolean(challengeId);
  const detailQuery = useFriendChallengeDetail(challengeId ?? "", open);
  const { acceptMutation, declineMutation } = useFriendChallengeMutations();
  const item = detailQuery.data;

  const handleAccept = async () => {
    if (!challengeId) return;
    try {
      await acceptMutation.mutateAsync(challengeId);
      onAccepted();
    } catch (error) {
      onError(error);
    }
  };

  const handleDecline = async () => {
    if (!challengeId) return;
    try {
      await declineMutation.mutateAsync(challengeId);
      onClose();
    } catch (error) {
      onError(error);
    }
  };

  return (
    <ModalShell open={open} onOpenChange={(next) => !next && onClose()} panelClassName="w-[min(95vw,44rem)]">
      <ModalClose className="absolute end-6 top-6 rounded-full p-2 text-[#64748b] hover:bg-[#f1f5f9]">
        <X className="size-4" />
      </ModalClose>

      {detailQuery.isLoading || !item ? (
        <div className="flex min-h-[240px] items-center justify-center">
          <Loader2 className="size-8 animate-spin text-[#2b415e]" />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <span className="flex size-16 items-center justify-center rounded-full bg-[#f4ecd8] text-[#c7af6d]">
              <Swords className="size-8" />
            </span>
            <ModalTitle className="text-2xl font-bold text-[#2b415e]">{t("title")}</ModalTitle>
            <p className="text-sm text-[#64748b]">{t("subtitle")}</p>
          </div>

          {item.remainingSecondsUntilStart > 0 ? (
            <FriendChallengeCountdownPill
              seconds={item.remainingSecondsUntilStart}
              label={t("countdownLabel")}
              variant="danger"
            />
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-[#dbe3f3] p-6">
              <FriendChallengeAvatar opponent={item.opponent} size="lg" />
              <h3 className="text-xl font-bold text-[#2b415e]">{item.opponent.fullName}</h3>
              <div className="grid w-full grid-cols-2 gap-3 text-center text-sm">
                <div className="rounded-xl bg-[#f6f7f7] p-3">
                  <p className="text-[#94a3b8]">{t("fields.questions")}</p>
                  <p className="font-bold text-[#2b415e]">{item.questionCount}</p>
                </div>
                <div className="rounded-xl bg-[#f6f7f7] p-3">
                  <p className="text-[#94a3b8]">{t("fields.wager")}</p>
                  <p className="font-bold text-[#2b415e]">{item.wagerPoints}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <InfoCell label={t("fields.subject")} value={item.subjectName} />
              <InfoCell label={t("fields.difficulty")} value={item.difficulty} />
              <InfoCell label={t("fields.questions")} value={String(item.questionCount)} />
              <InfoCell label={t("fields.wager")} value={`${item.wagerPoints}`} />
              <InfoCell
                label={t("fields.date")}
                value={formatScheduleDateOnly(item.scheduledStartLocal, locale)}
              />
              <InfoCell label={t("fields.time")} value={item.startTime.slice(0, 5)} />
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              disabled={acceptMutation.isPending}
              onClick={() => void handleAccept()}
              className="flex-1 rounded-2xl bg-[#c7af6d] py-4 text-base font-bold text-white"
            >
              {t("accept")}
            </button>
            <button
              type="button"
              disabled={declineMutation.isPending}
              onClick={() => void handleDecline()}
              className="flex-1 rounded-2xl border-2 border-[#ff4b4b] py-4 text-base font-bold text-[#ff4b4b]"
            >
              {t("decline")}
            </button>
          </div>

          <p className="text-center text-xs text-[#64748b]">{t("footer")}</p>
        </div>
      )}
    </ModalShell>
  );
}

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#f1f5f9] bg-white p-3 text-start">
      <p className="text-xs text-[#94a3b8]">{label}</p>
      <p className="font-bold text-[#2b415e]">{value}</p>
    </div>
  );
}
