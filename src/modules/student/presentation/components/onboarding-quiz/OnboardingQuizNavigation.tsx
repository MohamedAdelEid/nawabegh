"use client";

import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/shared/application/lib/cn";

type OnboardingQuizNavigationProps = {
  isLastQuestion: boolean;
  canGoNext: boolean;
  canSubmit: boolean;
  isSubmitting: boolean;
  showPrevious: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onSubmit: () => void;
};

export function OnboardingQuizNavigation({
  isLastQuestion,
  canGoNext,
  canSubmit,
  isSubmitting,
  showPrevious,
  onNext,
  onPrevious,
  onSubmit,
}: OnboardingQuizNavigationProps) {
  const t = useTranslations("student.onboardingQuiz");
  const locale = useLocale();
  const isArabic = locale === "ar";
  const ForwardIcon = isArabic ? ArrowLeft : ArrowRight;
  const BackIcon = isArabic ? ArrowRight : ArrowLeft;

  const primaryDisabled = isLastQuestion ? !canSubmit || isSubmitting : !canGoNext;

  return (
    <div className="flex items-center justify-between gap-4 pt-4">
      {showPrevious ? (
        <button
          type="button"
          onClick={onPrevious}
          className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-base font-bold text-[#64748b] transition-colors hover:bg-slate-50"
        >
          <BackIcon className="size-4" aria-hidden />
          {t("navigation.previous")}
        </button>
      ) : (
        <span aria-hidden className="size-10" />
      )}

      <button
        type="button"
        disabled={primaryDisabled}
        onClick={isLastQuestion ? onSubmit : onNext}
        className={cn(
          "inline-flex items-center gap-3 rounded-2xl bg-[#2b415e] px-8 py-4 text-lg font-bold text-white",
          "shadow-[0_4px_0_#1e2e42] transition-opacity disabled:cursor-not-allowed disabled:opacity-50",
        )}
      >
        {isLastQuestion ? t("navigation.finish") : t("navigation.next")}
        {isSubmitting ? (
          <Loader2 className="size-4 animate-spin" aria-hidden />
        ) : (
          !isLastQuestion && <ForwardIcon className="size-4" aria-hidden />
        )}
      </button>
    </div>
  );
}
