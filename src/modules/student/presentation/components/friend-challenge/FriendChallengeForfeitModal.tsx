"use client";

import { useTranslations } from "next-intl";
import { ModalShell, ModalTitle } from "@/shared/presentation/components/ui/modal-shell";
import { Button } from "@/shared/presentation/components/ui/button";

type FriendChallengeForfeitModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
  isPending?: boolean;
};

export function FriendChallengeForfeitModal({
  open,
  onOpenChange,
  onConfirm,
  isPending,
}: FriendChallengeForfeitModalProps) {
  const t = useTranslations("student.friendChallenge.forfeit");

  return (
    <ModalShell open={open} onOpenChange={onOpenChange}>
      <div className="space-y-4 text-start">
        <ModalTitle className="text-xl font-bold text-[#2b415e]">{t("title")}</ModalTitle>
        <p className="text-sm text-[#64748b]">{t("body")}</p>
        <div className="flex gap-3">
          <Button
            type="button"
            variant="destructive"
            disabled={isPending}
            onClick={() => void onConfirm()}
            className="flex-1"
          >
            {t("confirm")}
          </Button>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            {t("cancel")}
          </Button>
        </div>
      </div>
    </ModalShell>
  );
}
