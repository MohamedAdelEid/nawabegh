"use client";

import { HelpCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/shared/application/lib/cn";

type OnboardingQuizQuestionCardProps = {
  text: string;
  variant?: "default" | "flashcard";
};

export function OnboardingQuizQuestionCard({
  text,
  variant = "default",
}: OnboardingQuizQuestionCardProps) {
  const t = useTranslations("student.onboardingQuiz");

  if (variant === "flashcard") {
    return (
      <div className="relative mb-10 overflow-hidden rounded-[20px] border-2 border-white bg-white p-8 shadow-[0_8px_0_rgba(0,0,0,0.05)] sm:p-12">
        <HelpCircle
          aria-hidden
          className="pointer-events-none absolute -start-10 -top-10 size-36 text-[#f1f5f9] opacity-80"
        />
        <div className="relative flex flex-col items-center gap-4 text-center">
          <h1 className="text-2xl font-bold leading-10 text-[#0f172a] sm:text-4xl">{text}</h1>
          <p className="text-lg font-medium text-[#64748b]">{t("question.flashcardHint")}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "mb-8 flex flex-col items-center gap-4 rounded-[20px] border-2 border-[#f1f5f9]",
        "bg-white p-8 shadow-[0_8px_0_rgba(0,0,0,0.05)] sm:p-10",
      )}
    >
      <div className="flex size-16 items-center justify-center rounded-2xl py-3.5">
        <HelpCircle className="size-7 text-[#2b415e]" aria-hidden />
      </div>
      <h1 className="max-w-3xl text-center text-2xl font-bold leading-[45px] text-[#0f172a] sm:text-4xl">
        {text}
      </h1>
      <p className="text-center text-lg text-[#0f172a]">{t("question.defaultHint")}</p>
    </div>
  );
}
