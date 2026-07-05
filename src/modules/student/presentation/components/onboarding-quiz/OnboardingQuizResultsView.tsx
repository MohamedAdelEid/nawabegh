"use client";

import { Award, FileText, Lightbulb, Rocket, Star } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/shared/application/lib/cn";
import { findSelectedOption } from "@/modules/student/application/lib/onboardingQuiz.utils";
import type {
  OnboardingQuizQuestion,
  OnboardingQuizSelections,
  SubmitOnboardingQuizResponse,
} from "@/modules/student/domain/types/onboarding-quiz.types";

type OnboardingQuizResultsViewProps = {
  questions: OnboardingQuizQuestion[];
  selections: OnboardingQuizSelections;
  result: SubmitOnboardingQuizResponse;
  showReview: boolean;
  onToggleReview: () => void;
  onContinue: () => void;
};

function ScoreRing({ percent }: { percent: number }) {
  const radius = 88;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative mx-auto size-48">
      <svg className="size-full -rotate-90" viewBox="0 0 200 200" aria-hidden>
        <circle cx="100" cy="100" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="16" />
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="#58cc02"
          strokeWidth="16"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <p className="text-5xl font-bold text-[#1e1b4b]">{percent}%</p>
      </div>
    </div>
  );
}

export function OnboardingQuizResultsView({
  questions,
  selections,
  result,
  showReview,
  onToggleReview,
  onContinue,
}: OnboardingQuizResultsViewProps) {
  const t = useTranslations("student.onboardingQuiz.results");
  const locale = useLocale();
  const wrongCount = Math.max(result.totalQuestions - result.correctCount, 0);
  const formatNumber = (value: number) =>
    new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US").format(value);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-8 text-start">
        <h1 className="text-3xl font-bold text-[#2b415e] sm:text-4xl">{t("title")}</h1>
        <p className="mt-2 text-lg text-[#64748b]">{t("subtitle")}</p>
      </header>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-12">
        <aside className="order-1 flex flex-col gap-6 xl:col-span-5">
          <div className="relative overflow-hidden rounded-[20px] bg-white p-8 shadow-[0_8px_0_rgba(0,0,0,0.05)]">
            <Award className="pointer-events-none absolute -end-6 -top-8 size-24 text-[#c7af6d]/20" aria-hidden />

            <div className="flex flex-col items-center gap-6">
              <ScoreRing percent={result.scorePercent} />
              <p className="text-sm font-bold text-[#64748b]">{t("successRate")}</p>

              <div className="flex gap-4">
                <div className="rounded-2xl bg-[rgba(220,244,203,0.3)] px-6 py-3 text-center">
                  <p className="text-2xl font-bold text-[#58cc02]">{formatNumber(result.correctCount)}</p>
                  <p className="text-xs font-medium text-[#46a302]">{t("correct")}</p>
                </div>
                <div className="rounded-2xl bg-[#ffe4e4] px-6 py-3 text-center">
                  <p className="text-2xl font-bold text-[#ff4b4b]">{formatNumber(wrongCount)}</p>
                  <p className="text-xs font-medium text-[#d33131]">{t("wrong")}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3 rounded-2xl border-2 border-[rgba(199,175,109,0.2)] bg-[#f4ecd8] p-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#c7af6d] text-white shadow-[0_0_4px_rgba(199,175,109,0.4)]">
                  <Star className="size-5" aria-hidden />
                </span>
                <div className="text-start">
                  <p className="text-sm font-bold text-[#a38f5a]">{t("rewardLabel")}</p>
                  <p className="text-xl font-bold text-[#3f4754]">
                    {t("rewardPoints", { points: formatNumber(result.pointsEarned) })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-2xl border-2 border-[#f1f5f9] bg-[#f1f3f5] p-4">
                <span className="flex h-12 w-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-[0_8px_0_rgba(0,0,0,0.05)]">
                  <Award className="size-5 text-[#312e81]" aria-hidden />
                </span>
                <div className="text-start">
                  <p className="font-bold text-[#312e81]">{t("badgeTitle")}</p>
                  <p className="text-xs leading-4 text-[#64748b]">{t("badgeDescription")}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <button
              type="button"
              onClick={onContinue}
              className="inline-flex items-center justify-center gap-3 rounded-2xl bg-[#2b415e] px-8 py-5 text-lg font-bold text-white shadow-[0_0_8px_rgba(199,175,109,0.4),0_4px_0_#1e2e42]"
            >
              {t("continue")}
              <Rocket className="size-5" aria-hidden />
            </button>
            <button
              type="button"
              onClick={onToggleReview}
              className="inline-flex items-center justify-center gap-3 rounded-2xl border-2 border-[#e2e8f0] bg-white px-8 py-5 text-lg font-bold text-[#475569] shadow-[0_4px_0_#cbd5e1] xl:hidden"
            >
              {showReview ? t("hideReview") : t("reviewAnswers")}
              <FileText className="size-4" aria-hidden />
            </button>
          </div>
        </aside>

        <section
          className={cn(
            "order-2 xl:col-span-7",
            !showReview && "hidden xl:block",
          )}
        >
          <div className="rounded-[20px] bg-white p-6 shadow-[0_8px_0_rgba(0,0,0,0.05)] sm:p-8">
            <div className="mb-6 flex items-center justify-between gap-4">
              <h3 className="text-xl font-bold text-[#1e1b4b]">{t("answersDetail")}</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#64748b]">{t("correctLegend")}</span>
                <span className="size-3 rounded-full bg-[#58cc02]" />
              </div>
            </div>

            <div className="space-y-4">
              {questions.map((question) => {
                const selected = findSelectedOption(question, selections);
                const questionNumber = new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US").format(
                  question.order,
                );

                return (
                  <article
                    key={question.id}
                    className="rounded-2xl border-2 border-[#f1f5f9] p-5"
                  >
                    <div className="flex items-start gap-4">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#dcf4cb] text-base font-bold text-[#46a302]">
                        {questionNumber}
                      </span>
                      <div className="min-w-0 flex-1 text-start">
                        <p className="font-bold text-[#2b415e]">{question.text}</p>
                        <p className="mt-2 text-sm font-medium text-[#64748b]">
                          {t("yourAnswer", { answer: selected?.text ?? t("noAnswer") })}
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="mt-6 flex items-center gap-4 border-t border-[#f1f5f9] pt-6">
              <Lightbulb className="size-5 shrink-0 text-[#c7af6d]" aria-hidden />
              <p className="text-sm font-medium text-[#64748b]">{t("tip")}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
