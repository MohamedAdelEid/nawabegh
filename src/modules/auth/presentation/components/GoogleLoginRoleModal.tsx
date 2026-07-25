"use client";

import { useState } from "react";
import Image from "next/image";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { useLocale, useTranslations } from "next-intl";
import { Loader2, X } from "lucide-react";
import {
  ModalDescription,
  ModalShell,
  ModalTitle,
} from "@/shared/presentation/components/ui/modal-shell";
import { cn } from "@/shared/application/lib/cn";
import type { GoogleAuthRole } from "@/modules/auth/domain/types/login.types";

type GoogleRoleOption = {
  role: GoogleAuthRole;
  iconSrc: string;
  iconBgClass: string;
};

const GOOGLE_ROLE_OPTIONS: GoogleRoleOption[] = [
  {
    role: "Student",
    iconSrc: "/images/auth/account-type/student-icon.svg",
    iconBgClass: "bg-[#dbe3f3]",
  },
  {
    role: "Parent",
    iconSrc: "/images/auth/account-type/parent-icon.svg",
    iconBgClass: "bg-[#dcf4cb]",
  },
];

type GoogleLoginRoleModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isSubmitting?: boolean;
  errorMessage?: string | null;
  onCredential: (idToken: string, role: GoogleAuthRole) => void | Promise<void>;
  onError: (message: string) => void;
};

export function GoogleLoginRoleModal({
  open,
  onOpenChange,
  isSubmitting = false,
  errorMessage,
  onCredential,
  onError,
}: GoogleLoginRoleModalProps) {
  const t = useTranslations("auth.login.google");
  const locale = useLocale();
  const isArabic = locale === "ar";
  const [selectedRole, setSelectedRole] = useState<GoogleAuthRole | null>(null);

  function handleOpenChange(nextOpen: boolean) {
    if (isSubmitting) return;
    if (!nextOpen) setSelectedRole(null);
    onOpenChange(nextOpen);
  }

  async function handleGoogleSuccess(response: CredentialResponse) {
    if (!selectedRole) {
      onError(t("roleRequired"));
      return;
    }

    const idToken = response.credential;
    if (!idToken) {
      onError(t("noToken"));
      return;
    }

    await onCredential(idToken, selectedRole);
  }

  return (
    <ModalShell
      open={open}
      onOpenChange={handleOpenChange}
      panelClassName="w-[min(95vw,28rem)] p-6 sm:p-7"
      overlayClassName="bg-[rgba(44,66,96,0.55)] backdrop-blur-[2px]"
    >
      <div className="relative" dir={isArabic ? "rtl" : "ltr"}>
        <button
          type="button"
          disabled={isSubmitting}
          onClick={() => handleOpenChange(false)}
          aria-label={t("close")}
          className="absolute end-0 top-0 inline-flex size-9 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
        >
          <X className="h-5 w-5" />
        </button>

        <ModalTitle className="pe-10 text-xl font-bold text-[var(--dashboard-primary)] sm:text-2xl">
          {t("roleTitle")}
        </ModalTitle>
        <ModalDescription className="mt-2 text-sm leading-6 text-slate-500">
          {t("roleDescription")}
        </ModalDescription>

        <div className="mt-6 grid grid-cols-2 gap-3">
          {GOOGLE_ROLE_OPTIONS.map((option) => {
            const selected = selectedRole === option.role;
            const labelKey = option.role === "Student" ? "student" : "parent";

            return (
              <button
                key={option.role}
                type="button"
                disabled={isSubmitting}
                aria-pressed={selected}
                onClick={() => setSelectedRole(option.role)}
                className={cn(
                  "flex flex-col items-center gap-3 rounded-2xl border-2 px-3 py-5 text-center transition-all",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dashboard-primary)] focus-visible:ring-offset-2",
                  selected
                    ? "border-[var(--dashboard-gold)] bg-[var(--dashboard-gold)]/10 shadow-[0_4px_0_0_var(--dashboard-gold)]"
                    : "border-[#eef2f7] bg-[#f8fafc] hover:border-slate-200",
                  isSubmitting && "opacity-60",
                )}
              >
                <span
                  className={cn(
                    "flex size-14 items-center justify-center rounded-full",
                    option.iconBgClass,
                  )}
                >
                  <Image
                    src={option.iconSrc}
                    alt=""
                    width={28}
                    height={28}
                    className="h-7 w-7 object-contain"
                    aria-hidden
                  />
                </span>
                <span className="text-sm font-bold text-[var(--dashboard-primary)]">
                  {t(labelKey)}
                </span>
              </button>
            );
          })}
        </div>

        {errorMessage ? (
          <div className="mt-4 rounded-2xl border border-[var(--dashboard-danger)]/20 bg-[var(--dashboard-danger-soft)] px-4 py-3 text-sm font-medium text-[var(--dashboard-danger)]">
            {errorMessage}
          </div>
        ) : null}

        <div className="mt-6 min-h-[44px]">
          {isSubmitting ? (
            <div className="flex h-11 items-center justify-center gap-2 rounded-2xl border border-[#e8edf3] bg-white text-sm font-medium text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("submitting")}
            </div>
          ) : selectedRole ? (
            <div className="flex justify-center [&_iframe]:!mx-auto">
              <GoogleLogin
                onSuccess={(response) => {
                  void handleGoogleSuccess(response);
                }}
                onError={() => onError(t("cancelled"))}
                useOneTap={false}
                theme="outline"
                size="large"
                text="signin_with"
                shape="rectangular"
                width="320"
              />
            </div>
          ) : (
            <p className="text-center text-xs text-slate-400">{t("selectRoleHint")}</p>
          )}
        </div>
      </div>
    </ModalShell>
  );
}
