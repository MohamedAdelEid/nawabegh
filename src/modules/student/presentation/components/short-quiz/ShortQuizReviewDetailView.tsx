"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, ArrowRight, CheckCircle2, Lightbulb, XCircle } from "lucide-react";
import { useShortQuizResult } from "@/modules/student/application/hooks/useShortQuizStation";
import { ApiFailureAlert } from "@/shared/presentation/components/ui/ApiFailureAlert";
import { Button } from "@/shared/presentation/components/ui/button";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { cn } from "@/shared/application/lib/cn";
import { ShortQuizSkeleton } from "./ShortQuizSkeleton";

type ShortQuizReviewDetailViewProps = {
  stationId: string;
  questionIndex: number;
};

export function ShortQuizReviewDetailView({
  stationId,
  questionIndex,
}: ShortQuizReviewDetailViewProps) {
  const t = useTranslations("student.dashboard.shortQuiz");
  const router = useRouter();
  const searchParams = useSearchParams();
  const qs = searchParams.toString();
  const withQuery = (path: string) => (qs ? `${path}?${qs}` : path);
  const { result, isLoading, error, refetch } = useShortQuizResult(stationId);

  if (isLoading) return <ShortQuizSkeleton variant="review" />;

  if (error || !result) {
    return (
      <div className="mx-auto max-w-[900px] space-y-4 p-6">
        <ApiFailureAlert message={error || t("errors.loadResult")} fallbackMessage={t("errors.loadResult")} />
        <Button type="button" variant="outline" onClick={() => void refetch()}>
          {t("errors.retry")}
        </Button>
      </div>
    );
  }

  const questions = result.attempt.questions;
  const safeIndex = Math.min(Math.max(questionIndex, 0), Math.max(questions.length - 1, 0));
  const question = questions[safeIndex];

  if (!question) {
    return (
      <div className="p-6 text-center text-[#64748b]">{t("review.empty")}</div>
    );
  }

  const correct = question.isCorrectSelected === true;

  return (
    <div className="min-h-full bg-[#f6f7f7]">
      <header className="border-b border-[#e2e8f0] bg-white">
        <div className="mx-auto flex max-w-[900px] items-center justify-between px-4 py-4">
          <Button asChild variant="ghost" size="icon" className="rounded-full bg-[#f1f5f9]">
            <Link href={withQuery(ROUTES.USER.STUDENT.SHORT_QUIZ_REVIEW(stationId))}>
              <ArrowLeft className="size-4 rtl:rotate-180" />
            </Link>
          </Button>
          <h1 className="text-lg font-bold text-[#2c4260]">
            {t("review.questionNumber", { number: safeIndex + 1 })}
          </h1>
          <span className="w-10" />
        </div>
      </header>

      <main className="mx-auto max-w-[900px] space-y-6 px-4 py-6 pb-28">
        <div
          className={cn(
            "flex items-center justify-end gap-2 rounded-xl px-4 py-3 text-sm font-bold",
            correct ? "bg-[#dcfce7] text-[#166534]" : "bg-[#fee2e2] text-[#991b1b]",
          )}
        >
          {correct ? t("review.correctBadge") : t("review.wrongBadge")}
          {correct ? <CheckCircle2 className="size-4" /> : <XCircle className="size-4" />}
        </div>

        <section className="rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-end text-xl font-bold text-[#1e293b]">{question.text}</h2>
          <div className="space-y-3">
            {question.options.map((option) => {
              const isSelected = option.id === question.selectedOptionId;
              const isCorrect = option.id === question.correctOptionId;
              return (
                <div
                  key={option.id}
                  className={cn(
                    "rounded-xl border-2 px-4 py-4 text-end text-base font-medium",
                    isCorrect && "border-[#16a34a] bg-[#f0fdf4] text-[#166534]",
                    isSelected && !isCorrect && "border-[#dc2626] bg-[#fef2f2] text-[#991b1b]",
                    !isSelected && !isCorrect && "border-[#e2e8f0] bg-white text-[#334155]",
                  )}
                >
                  {option.text}
                </div>
              );
            })}
          </div>
        </section>

        {question.explanation ? (
          <section className="rounded-2xl border border-[#c7af6d]/40 bg-[#fffbeb] p-5">
            <div className="mb-2 flex items-center justify-end gap-2 text-sm font-bold text-[#92400e]">
              {t("review.explanation")}
              <Lightbulb className="size-4" />
            </div>
            <p className="text-end leading-relaxed text-[#78350f]">{question.explanation}</p>
          </section>
        ) : null}
      </main>

      <footer className="fixed inset-x-0 bottom-0 border-t border-[#e2e8f0] bg-white">
        <div className="mx-auto flex max-w-[768px] gap-3 px-4 py-4">
          <Button
            type="button"
            variant="outline"
            className="h-12 flex-1 rounded-lg"
            disabled={safeIndex <= 0}
            onClick={() =>
              router.push(
                withQuery(ROUTES.USER.STUDENT.SHORT_QUIZ_REVIEW_DETAIL(stationId, safeIndex - 1)),
              )
            }
          >
            <ArrowRight className="size-4" />
            {t("attempt.prev")}
          </Button>
          <Button
            type="button"
            className="h-12 flex-1 rounded-lg bg-[#2c4260] text-white"
            disabled={safeIndex >= questions.length - 1}
            onClick={() =>
              router.push(
                withQuery(ROUTES.USER.STUDENT.SHORT_QUIZ_REVIEW_DETAIL(stationId, safeIndex + 1)),
              )
            }
          >
            {t("attempt.next")}
            <ArrowLeft className="size-4" />
          </Button>
        </div>
      </footer>
    </div>
  );
}
