"use client";

import { useTranslations } from "next-intl";
import { ModalShell, ModalTitle } from "@/shared/presentation/components/ui/modal-shell";
import { Button } from "@/shared/presentation/components/ui/button";

type FriendChallengeErrorModalProps = {
  error: { message: string; errorCode?: string | null } | null;
  onClose: () => void;
  onRefresh?: () => void;
};

export function FriendChallengeErrorModal({
  error,
  onClose,
  onRefresh,
}: FriendChallengeErrorModalProps) {
  const t = useTranslations("student.friendChallenge.error");
  const open = Boolean(error);

  const title =
    error?.errorCode &&
    [
      "INSUFFICIENT_POINTS",
      "CHALLENGE_EXPIRED",
      "INVITE_NOT_FOUND",
      "INVALID_STATE_TRANSITION",
      "NOT_ALLOWED",
      "INVALID_OPPONENT",
      "INVALID_SUBJECT",
      "QUESTION_BANK_INSUFFICIENT",
    ].includes(error.errorCode)
      ? t(`codes.${error.errorCode as "INSUFFICIENT_POINTS"}`)
      : t("title");

  return (
    <ModalShell open={open} onOpenChange={(next) => !next && onClose()}>
      <div className="space-y-4 text-start">
        <ModalTitle className="text-xl font-bold text-[#2b415e]">{title}</ModalTitle>
        <p className="text-sm text-[#64748b]">{error?.message}</p>
        <div className="flex gap-3">
          <Button type="button" onClick={onClose} className="flex-1">
            {t("close")}
          </Button>
          {onRefresh ? (
            <Button type="button" variant="outline" onClick={onRefresh} className="flex-1">
              Retry
            </Button>
          ) : null}
        </div>
      </div>
    </ModalShell>
  );
}
