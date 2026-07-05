"use client";

import { Check, X } from "lucide-react";
import { cn } from "@/shared/application/lib/cn";
import type { OnboardingQuizOption } from "@/modules/student/domain/types/onboarding-quiz.types";

type OnboardingQuizTrueFalseOptionsProps = {
  options: OnboardingQuizOption[];
  selectedOptionId?: string;
  onSelect: (optionId: string) => void;
};

function isFalseOption(text: string): boolean {
  const normalized = text.trim().toLowerCase();
  return normalized === "خطأ" || normalized === "false" || normalized === "no" || normalized === "لا";
}

export function OnboardingQuizTrueFalseOptions({
  options,
  selectedOptionId,
  onSelect,
}: OnboardingQuizTrueFalseOptionsProps) {
  return (
    <div className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
      {options.map((option) => {
        const isSelected = selectedOptionId === option.id;
        const isFalse = isFalseOption(option.text);

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onSelect(option.id)}
            className={cn(
              "flex items-center justify-between rounded-[20px] border-2 p-6 transition-all sm:p-8",
              isSelected
                ? "border-[#c7af6d] bg-white shadow-[0_0_15px_rgba(199,175,109,0.4),0_4px_0_#a38f5a]"
                : "border-[#e2e8f0] bg-white opacity-90 shadow-[0_4px_0_#cbd5e1] hover:opacity-100",
            )}
          >
            <div className="flex items-center gap-6">
              <span
                className={cn(
                  "flex size-14 items-center justify-center rounded-full",
                  isSelected ? "bg-[rgba(199,175,109,0.1)] text-[#c7af6d]" : "bg-[#f1f5f9] text-[#64748b]",
                )}
              >
                {isFalse ? <X className="size-6" /> : <Check className="size-6" />}
              </span>
              <span className="text-2xl font-bold text-[#0f172a]">{option.text}</span>
            </div>

            <span
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-full border-2",
                isSelected ? "border-[#c7af6d] border-[3px] p-1" : "border-[#e2e8f0]",
              )}
            >
              {isSelected ? <span className="size-3 rounded-full bg-[#c7af6d]" /> : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}
