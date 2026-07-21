"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/shared/application/lib/cn";
import type { ShortQuizQuestionDto } from "@/modules/student/domain/short-quiz/short-quiz.types";

type ShortQuizQuestionMapProps = {
  questions: ShortQuizQuestionDto[];
  currentIndex: number;
  onSelect: (index: number) => void;
};

export function ShortQuizQuestionMap({
  questions,
  currentIndex,
  onSelect,
}: ShortQuizQuestionMapProps) {
  const t = useTranslations("student.dashboard.shortQuiz.attempt.map");

  return (
    <section className="rounded-xl border border-[rgba(44,66,96,0.05)] bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-end text-sm font-bold text-[#64748b]">{t("title")}</h3>
      <div className="flex flex-wrap justify-end gap-2">
        {questions.map((question, index) => {
          const answered = Boolean(question.selectedOptionId);
          const current = index === currentIndex;
          return (
            <button
              key={question.id}
              type="button"
              onClick={() => onSelect(index)}
              className={cn(
                "flex size-10 items-center justify-center rounded-lg border-2 text-sm font-bold transition-colors",
                answered && !current && "border-[#c7af6d] bg-[#c7af6d] text-white",
                current && "border-[#c7af6d] bg-[rgba(44,66,96,0.1)] text-[#c7af6d]",
                !answered && !current && "border-[#f1f5f9] bg-[#f8fafc] text-[#94a3b8]",
              )}
            >
              {index + 1}
            </button>
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-end gap-6 border-t border-[#f1f5f9] pt-4 text-xs font-medium text-[#64748b]">
        <span className="flex items-center gap-2">
          {t("unanswered")}
          <span className="size-3 rounded-[2px] border border-[#f1f5f9] bg-[#f8fafc]" />
        </span>
        <span className="flex items-center gap-2">
          {t("current")}
          <span className="size-3 rounded-[2px] border border-[#2c4260] bg-[rgba(44,66,96,0.1)]" />
        </span>
        <span className="flex items-center gap-2">
          {t("answered")}
          <span className="size-3 rounded-[2px] bg-[#c7af6d]" />
        </span>
      </div>
    </section>
  );
}
