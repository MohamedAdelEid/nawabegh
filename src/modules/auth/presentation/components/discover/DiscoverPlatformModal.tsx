"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import {
  ModalShell,
  ModalTitle,
} from "@/shared/presentation/components/ui/modal-shell";
import { Button } from "@/shared/presentation/components/ui/button";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { CompleteAccountModal } from "./CompleteAccountModal";

interface DiscoverPlatformModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateAccount: () => void;
}

/** The "require account" signal that the demo journey posts to this parent window. */
export const DISCOVER_REQUIRE_ACCOUNT_MESSAGE = "nawabegh:require-account";

/**
 * Full-screen popup that lets a visitor preview the platform (student journey)
 * before creating an account. Gated interactions inside the embedded journey
 * open the {@link CompleteAccountModal}.
 */
export function DiscoverPlatformModal({
  open,
  onOpenChange,
  onCreateAccount,
}: DiscoverPlatformModalProps) {
  const t = useTranslations("auth.discover");
  const [completeOpen, setCompleteOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    function handleMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === DISCOVER_REQUIRE_ACCOUNT_MESSAGE) {
        setCompleteOpen(true);
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [open]);

  useEffect(() => {
    if (!open) setCompleteOpen(false);
  }, [open]);

  return (
    <>
      <ModalShell
        open={open}
        onOpenChange={onOpenChange}
        overlayClassName="bg-[rgba(44,66,96,0.6)] backdrop-blur-[2px]"
        panelClassName="inset-4 m-0 flex h-auto w-auto max-w-none flex-col overflow-hidden rounded-[24px] border border-[#eef2f7] p-0 shadow-2xl sm:p-0"
      >
        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-[#eef2f7] bg-white px-5 py-4">
          <Image
            src="/images/logos/main-logo.png"
            alt=""
            width={140}
            height={44}
            className="h-auto w-[110px] shrink-0 object-contain sm:w-[130px]"
          />

          <div className="flex min-w-0 flex-col items-center text-center">
            <ModalTitle className="truncate text-sm font-bold text-[#2c4260] sm:text-base">
              {t("popup.title")}
            </ModalTitle>
            <p className="hidden text-xs text-[#64748b] sm:block">
              {t("popup.subtitle")}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Button
              type="button"
              onClick={() => setCompleteOpen(true)}
              className="hidden h-auto rounded-[12px] bg-[#c7af6d] px-5 py-2.5 text-sm font-bold text-white shadow-[0px_4px_0px_#a38f5a] hover:bg-[#bfa45f] sm:inline-flex"
            >
              {t("popup.createAccount")}
            </Button>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              aria-label={t("popup.close")}
              className="inline-flex size-10 items-center justify-center rounded-full text-[#64748b] transition-colors hover:bg-slate-100"
            >
              <X className="size-6" />
            </button>
          </div>
        </header>

        <div className="relative flex-1 bg-[#fafafa]">
          {open ? (
            <iframe
              title={t("popup.title")}
              src={`${ROUTES.USER.STUDENT.JOURNEY}?demo=1`}
              className="absolute inset-0 size-full border-0"
            />
          ) : null}
        </div>
      </ModalShell>

      <CompleteAccountModal
        open={completeOpen}
        onOpenChange={setCompleteOpen}
        onCreateAccount={onCreateAccount}
      />
    </>
  );
}
