"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  ModalShell,
  ModalDescription,
  ModalTitle,
} from "@/shared/presentation/components/ui/modal-shell";
import { Button } from "@/shared/presentation/components/ui/button";

interface CompleteAccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateAccount: () => void;
}

/** Confirmation dialog shown when a demo user tries a feature that requires an account. */
export function CompleteAccountModal({
  open,
  onOpenChange,
  onCreateAccount,
}: CompleteAccountModalProps) {
  const t = useTranslations("auth.discover.completeAccount");

  return (
    <ModalShell
      open={open}
      onOpenChange={onOpenChange}
      overlayClassName="bg-[rgba(44,66,96,0.6)] backdrop-blur-[2px]"
      panelClassName="w-[min(92vw,32rem)] rounded-[20px] border-0 p-10 shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1),0px_0px_40px_0px_rgba(0,0,0,0.08)]"
    >
      <div className="flex flex-col items-center text-center">
        <div className="mb-8 size-[224px]">
          <Image
            src="/images/auth/discover/complete-account-character.jpg"
            alt={t("illustrationAlt")}
            width={224}
            height={224}
            className="size-full object-contain"
          />
        </div>

        <ModalTitle className="text-[30px] font-bold leading-9 text-[#2c4260]">
          {t("title")}
        </ModalTitle>

        <ModalDescription className="mb-10 mt-4 max-w-[24rem] text-[18px] leading-7 text-[#4b5563]">
          {t("message")}
        </ModalDescription>

        <div className="flex w-full flex-col gap-4">
          <Button
            type="button"
            onClick={onCreateAccount}
            className="h-auto w-full rounded-[12px] bg-[#2c4260] px-6 py-4 text-[18px] font-bold text-white shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1)] hover:bg-[#243750]"
          >
            {t("primary")}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-auto w-full rounded-[12px] border-2 border-[#2c4260] bg-white px-6 py-[18px] text-[18px] font-bold text-[#2c4260] hover:bg-[#2c4260]/5"
          >
            {t("secondary")}
          </Button>
        </div>
      </div>
    </ModalShell>
  );
}
