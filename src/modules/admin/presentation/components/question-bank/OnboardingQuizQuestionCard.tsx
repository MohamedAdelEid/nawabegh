"use client";

import { Pencil } from "lucide-react";
import { QuestionType } from "@/shared/domain/enums/question.enums";
import { cn } from "@/shared/application/lib/cn";
import { Button } from "@/shared/presentation/components/ui/button";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import type { AdminOnboardingQuizQuestion } from "@/modules/admin/domain/types/adminOnboardingQuiz.types";

interface OnboardingQuizQuestionCardProps {
  question: AdminOnboardingQuizQuestion;
  typeLabel: string;
  correctAnswerLabel: string;
  editLabel: string;
  onEdit: () => void;
  className?: string;
}

function formatOrder(order: number): string {
  return String(order).padStart(2, "0");
}

export function OnboardingQuizQuestionCard({
  question,
  typeLabel,
  correctAnswerLabel,
  editLabel,
  onEdit,
  className,
}: OnboardingQuizQuestionCardProps) {
  return (
    <Card
      className={cn(
        "overflow-hidden rounded-2xl border border-slate-100 bg-white transition-shadow duration-300",
        "!shadow-[var(--dashboard-shadow-soft)] hover:!shadow-[0_10px_30px_rgba(36,59,90,0.08)]",
        className,
      )}
    >
      <CardContent className="space-y-5 p-6 text-right">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#EAF2FD] text-sm font-bold text-[#243B5A]">
              {formatOrder(question.order)}
            </span>
            <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {typeLabel}
            </span>
          </div>

          <Button
            type="button"
            variant="ghost"
            className="h-10 gap-2 rounded-xl px-3 text-sm font-semibold text-[#243B5A] hover:bg-slate-50 cursor-pointer"
            onClick={onEdit}
          >
            <Pencil className="h-4 w-4" />
            {editLabel}
          </Button>
        </div>

        <p className="text-lg font-bold leading-8 text-slate-800">{question.text}</p>

        <div
          className={cn(
            "grid gap-3",
            question.type === QuestionType.TrueOrFalse
              ? "sm:grid-cols-2"
              : "sm:grid-cols-2",
          )}
        >
          {question.options.map((option) => (
            <div
              key={`${question.order}-${option.order}-${option.id ?? option.text}`}
              className={cn(
                "flex min-h-[3.5rem] items-center gap-3 rounded-2xl border px-4 py-3 transition-colors duration-200",
                option.isCorrect
                  ? "border-[#243B5A] bg-white"
                  : "border-slate-200 bg-white",
              )}
            >
              <span
                className={cn(
                  "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
                  option.isCorrect ? "border-[#243B5A]" : "border-slate-300",
                )}
                aria-hidden
              >
                {option.isCorrect ? (
                  <span className="h-2.5 w-2.5 rounded-full bg-[#243B5A]" />
                ) : null}
              </span>

              <span
                className={cn(
                  "flex-1 text-sm font-semibold",
                  option.isCorrect ? "text-slate-800" : "text-slate-600",
                )}
              >
                {option.text}
              </span>

              {option.isCorrect ? (
                <span className="ms-auto shrink-0 rounded-md bg-[#E9F8DF] px-2 py-1 text-[11px] font-bold text-[#3E8C0E]">
                  {correctAnswerLabel}
                </span>
              ) : null}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
