"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { cn } from "@/shared/application/lib/cn";
import type { ShortQuizOptionDto } from "@/modules/student/domain/short-quiz/short-quiz.types";

type ShortQuizMcqOptionsProps = {
  options: ShortQuizOptionDto[];
  selectedOptionId: string | null;
  onSelect: (optionId: string) => void;
  disabled?: boolean;
};

export function ShortQuizMcqOptions({
  options,
  selectedOptionId,
  onSelect,
  disabled,
}: ShortQuizMcqOptionsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {options.map((option) => {
        const selected = option.id === selectedOptionId;
        return (
          <button
            key={option.id}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(option.id)}
            className={cn(
              "flex min-h-[72px] items-center justify-end gap-4 rounded-xl border-2 px-5 py-4 text-end transition-all",
              selected
                ? "border-[#2c4260] bg-[rgba(44,66,96,0.05)]"
                : "border-[#f1f5f9] bg-white hover:border-[#cbd5e1]",
            )}
          >
            <span className="flex-1 text-lg font-medium text-[#334155]">{option.text}</span>
            {option.imageUrl ? (
              <span className="relative size-12 overflow-hidden rounded-lg">
                <Image src={option.imageUrl} alt="" fill className="object-cover" unoptimized />
              </span>
            ) : null}
            <span
              className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded-full border-2",
                selected ? "border-[#2c4260] bg-[#2c4260]" : "border-[#cbd5e1] bg-white",
              )}
            >
              <span className="size-2 rounded-full bg-white" />
            </span>
          </button>
        );
      })}
    </div>
  );
}

type ShortQuizTrueFalseOptionsProps = {
  options: ShortQuizOptionDto[];
  selectedOptionId: string | null;
  onSelect: (optionId: string) => void;
  disabled?: boolean;
};

export function ShortQuizTrueFalseOptions({
  options,
  selectedOptionId,
  onSelect,
  disabled,
}: ShortQuizTrueFalseOptionsProps) {
  const t = useTranslations("student.dashboard.shortQuiz");

  const resolveKind = (text: string): "true" | "false" | "other" => {
    const label = text.trim().toLowerCase();
    if (["صح", "true", "نعم", "yes"].includes(label)) return "true";
    if (["خطأ", "false", "لا", "no"].includes(label)) return "false";
    return "other";
  };

  const sorted = [...options].sort((a, b) => {
    const aKind = resolveKind(a.text);
    const bKind = resolveKind(b.text);
    if (aKind === "true") return -1;
    if (bKind === "true") return 1;
    return a.order - b.order;
  });

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {sorted.map((option) => {
        const kind = resolveKind(option.text);
        const selected = option.id === selectedOptionId;
        const isTrue = kind === "true";
        return (
          <button
            key={option.id}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(option.id)}
            className={cn(
              "flex min-h-[200px] flex-col items-center justify-center gap-4 rounded-2xl border-4 bg-white px-6 py-9 transition-all",
              selected
                ? isTrue
                  ? "border-[#22c55e] shadow-[0_0_0_4px_rgba(34,197,94,0.15)]"
                  : "border-[#ef4444] shadow-[0_0_0_4px_rgba(239,68,68,0.15)]"
                : "border-transparent hover:border-[#e2e8f0]",
            )}
          >
            <span
              className={cn(
                "flex size-20 items-center justify-center rounded-full text-3xl font-bold",
                isTrue ? "bg-[#dcfce7] text-[#16a34a]" : "bg-[#fee2e2] text-[#dc2626]",
              )}
            >
              {isTrue ? "✓" : "✕"}
            </span>
            <span className="text-2xl font-bold text-[#0f172a]">
              {kind === "true"
                ? t("attempt.true")
                : kind === "false"
                  ? t("attempt.false")
                  : option.text}
            </span>
          </button>
        );
      })}
    </div>
  );
}
