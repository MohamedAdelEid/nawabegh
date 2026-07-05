"use client";

import { cn } from "@/shared/application/lib/cn";
import { getOptionLetter } from "@/modules/student/application/lib/onboardingQuiz.utils";
import type { OnboardingQuizOption } from "@/modules/student/domain/types/onboarding-quiz.types";

type OnboardingQuizMcqOptionsProps = {
  options: OnboardingQuizOption[];
  selectedOptionId?: string;
  onSelect: (optionId: string) => void;
};

export function OnboardingQuizMcqOptions({
  options,
  selectedOptionId,
  onSelect,
}: OnboardingQuizMcqOptionsProps) {
  return (
    <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
      {options.map((option, index) => {
        const isSelected = selectedOptionId === option.id;

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onSelect(option.id)}
            className={cn(
              "flex items-center gap-4 rounded-2xl border-2 px-5 py-5 text-start transition-all",
              isSelected
                ? "border-[#c7af6d] bg-white shadow-[0_0_15px_rgba(199,175,109,0.4),0_4px_0_#a38f5a]"
                : "border-[#e2e8f0] bg-white shadow-[0_4px_0_#e2e8f0] hover:border-[#cbd5e1]",
            )}
          >
            <span
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-xl text-base font-bold",
                isSelected ? "bg-[rgba(199,175,109,0.15)] text-[#a38f5a]" : "bg-[#f1f5f9] text-[#64748b]",
              )}
            >
              {getOptionLetter(index)}
            </span>
            <span className="flex-1 text-lg font-bold text-[#0f172a] sm:text-xl">{option.text}</span>
          </button>
        );
      })}
    </div>
  );
}
