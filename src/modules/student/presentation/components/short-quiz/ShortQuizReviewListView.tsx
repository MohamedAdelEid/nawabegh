"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { useShortQuizResult } from "@/modules/student/application/hooks/useShortQuizStation";
import {
  countCorrectAnswers,
  formatElapsedTime,
} from "@/modules/student/domain/short-quiz/short-quiz.utils";
import { ApiFailureAlert } from "@/shared/presentation/components/ui/ApiFailureAlert";
import { Button } from "@/shared/presentation/components/ui/button";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { cn } from "@/shared/application/lib/cn";
import { ShortQuizSkeleton } from "./ShortQuizSkeleton";

type Filter = "all" | "correct" | "wrong";

type ShortQuizReviewListViewProps = {
  stationId: string;
};

export function ShortQuizReviewListView({ stationId }: ShortQuizReviewListViewProps) {
  const t = useTranslations("student.dashboard.shortQuiz");
  const searchParams = useSearchParams();
  const qs = searchParams.toString();
  const withQuery = (path: string) => (qs ? `${path}?${qs}` : path);
  const [filter, setFilter] = useState<Filter>("all");
  const { result, isLoading, error, refetch } = useShortQuizResult(stationId);

  const questions = useMemo(() => {
    const list = result?.attempt.questions ?? [];
    if (filter === "correct") return list.filter((q) => q.isCorrectSelected === true);
    if (filter === "wrong") return list.filter((q) => q.isCorrectSelected === false);
    return list;
  }, [filter, result]);

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

  const attempt = result.attempt;
  const correctCount = countCorrectAnswers(attempt);
  const wrongCount = attempt.questions.length - correctCount;

  return (
    <div className="min-h-full bg-[#f6f7f7]">
      <header className="border-b border-[#e2e8f0] bg-white">
        <div className="mx-auto flex max-w-[900px] items-center justify-between px-4 py-4">
          <Button asChild variant="ghost" size="icon" className="rounded-full bg-[#f1f5f9]">
            <Link href={withQuery(ROUTES.USER.STUDENT.SHORT_QUIZ_RESULTS(stationId))}>
              <ArrowLeft className="size-4 rtl:rotate-180" />
            </Link>
          </Button>
          <h1 className="text-lg font-bold text-[#2c4260]">{t("review.title")}</h1>
          <span className="w-10" />
        </div>
      </header>

      <main className="mx-auto max-w-[900px] space-y-6 px-4 py-6">
        <section className="grid grid-cols-3 gap-3">
          <SummaryChip label={t("results.finalScore")} value={`${attempt.scorePercent ?? 0}%`} />
          <SummaryChip label={t("results.timeSpent")} value={formatElapsedTime(attempt.startedAt)} />
          <SummaryChip
            label={t("results.rank")}
            value={
              result.stationRank != null && result.stationRankTotal != null
                ? `${result.stationRank}/${result.stationRankTotal}`
                : "—"
            }
          />
        </section>

        <section className="flex flex-wrap justify-end gap-2">
          {(
            [
              ["all", t("review.filters.all", { count: attempt.questions.length })],
              ["correct", t("review.filters.correct", { count: correctCount })],
              ["wrong", t("review.filters.wrong", { count: wrongCount })],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-bold transition-colors",
                filter === key
                  ? "bg-[#2c4260] text-white"
                  : "bg-white text-[#64748b] ring-1 ring-[#e2e8f0]",
              )}
            >
              {label}
            </button>
          ))}
        </section>

        <section className="space-y-3">
          {questions.map((question) => {
            const absoluteIndex = attempt.questions.findIndex((q) => q.id === question.id);
            const correct = question.isCorrectSelected === true;
            return (
              <Link
                key={question.id}
                href={withQuery(
                  ROUTES.USER.STUDENT.SHORT_QUIZ_REVIEW_DETAIL(stationId, absoluteIndex),
                )}
                className="flex items-start gap-4 rounded-2xl border border-[#e2e8f0] bg-white p-4 shadow-sm transition hover:border-[#c7af6d]"
              >
                <div className="flex-1 text-end">
                  <p className="mb-1 text-xs text-[#94a3b8]">
                    {t("review.questionNumber", { number: absoluteIndex + 1 })}
                  </p>
                  <p className="font-bold text-[#1e293b]">{question.text}</p>
                </div>
                <span
                  className={cn(
                    "mt-1 flex size-9 shrink-0 items-center justify-center rounded-full",
                    correct ? "bg-[#dcfce7] text-[#16a34a]" : "bg-[#fee2e2] text-[#dc2626]",
                  )}
                >
                  {correct ? <CheckCircle2 className="size-5" /> : <XCircle className="size-5" />}
                </span>
              </Link>
            );
          })}
          {questions.length === 0 ? (
            <p className="rounded-xl bg-white p-8 text-center text-[#64748b]">{t("review.empty")}</p>
          ) : null}
        </section>
      </main>
    </div>
  );
}

function SummaryChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#e2e8f0] bg-white p-4 text-center shadow-sm">
      <p className="text-lg font-bold text-[#2c4260]">{value}</p>
      <p className="text-xs text-[#64748b]">{label}</p>
    </div>
  );
}
