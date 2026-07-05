"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/shared/application/lib/cn";
import { getQuizProgressPercent } from "@/modules/student/application/lib/onboardingQuiz.utils";

type OnboardingQuizProgressHeaderProps = {
  currentIndex: number;
  totalQuestions: number;
};

export function OnboardingQuizProgressHeader({
  currentIndex,
  totalQuestions,
}: OnboardingQuizProgressHeaderProps) {
  const t = useTranslations("student.onboardingQuiz");
  const progress = getQuizProgressPercent(currentIndex, totalQuestions);
  const questionNumber = currentIndex + 1;

  return (
    <div className="flex w-full flex-col gap-4 pb-12">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col items-start gap-1 text-start">
          <p className="text-xs font-bold uppercase tracking-[1.2px] text-[#94a3b8]">
            {t("progress.currentStage")}
          </p>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-[#0f172a]">
              {t(`progress.questionTitle.${questionNumber}` as "progress.questionTitle.1")}
            </h2>
            <span className="text-lg font-medium text-[#cbd5e1]">
              {questionNumber} / {totalQuestions}
            </span>
          </div>
        </div>

        <p className="text-xl font-black text-[#58cc02]">{progress}%</p>
      </div>

      <div className="h-4 overflow-hidden rounded-full bg-[#e2e8f0]">
        <div
          className={cn(
            "h-full rounded-full bg-[#58cc02] shadow-[0_0_7.5px_rgba(88,204,2,0.3)] transition-all duration-300",
            progress > 0 && "relative overflow-hidden",
          )}
          style={{ width: `${progress}%` }}
        >
          <span className="absolute inset-x-0 top-0 h-[30%] bg-white/20" />
        </div>
      </div>
    </div>
  );
}
