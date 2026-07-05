"use client";

import { AlertCircle } from "lucide-react";
import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Button } from "@/shared/presentation/components/ui/button";

type OnboardingQuizErrorProps = {
  message?: string;
  onRetry?: () => void;
};

export function OnboardingQuizError({ message, onRetry }: OnboardingQuizErrorProps) {
  const t = useTranslations("student.onboardingQuiz.error");

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-xl flex-col items-center justify-center gap-4 px-4 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-[#ffe4e4] text-[#ff4b4b]">
        <AlertCircle className="size-8" aria-hidden />
      </span>
      <h2 className="text-2xl font-bold text-[#2b415e]">{t("title")}</h2>
      <p className="text-base leading-7 text-[#64748b]">{message || t("generic")}</p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {onRetry ? (
          <Button type="button" onClick={onRetry} className="rounded-xl bg-[#2b415e] px-6">
            {t("retry")}
          </Button>
        ) : null}
        <Button
          type="button"
          variant="outline"
          onClick={() => void signOut({ callbackUrl: "/auth/login" })}
          className="rounded-xl"
        >
          {t("logout")}
        </Button>
      </div>
    </div>
  );
}
