"use client";

import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

export function OnboardingQuizLoading() {
  const t = useTranslations("student.onboardingQuiz");

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-[#64748b]">
      <Loader2 className="size-10 animate-spin text-[#2b415e]" aria-hidden />
      <p className="text-lg font-medium">{t("loading")}</p>
    </div>
  );
}
