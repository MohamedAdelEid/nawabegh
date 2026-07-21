"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, ArrowRight, Clock3, GraduationCap, Loader2, X } from "lucide-react";
import { useShortQuizAttemptSession } from "@/modules/student/application/hooks/useShortQuizStation";
import {
  formatRemainingTime,
  getArabicQuestionLabel,
  isAttemptFinalized,
  isTrueFalseQuestion,
} from "@/modules/student/domain/short-quiz/short-quiz.utils";
import { ApiFailureAlert } from "@/shared/presentation/components/ui/ApiFailureAlert";
import { Button } from "@/shared/presentation/components/ui/button";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { ShortQuizMcqOptions, ShortQuizTrueFalseOptions } from "./ShortQuizOptions";
import { ShortQuizQuestionMap } from "./ShortQuizQuestionMap";
import { ShortQuizSkeleton } from "./ShortQuizSkeleton";
import { ShortQuizSubmitModal } from "./ShortQuizSubmitModal";

type ShortQuizAttemptViewProps = {
  stationId: string;
};

export function ShortQuizAttemptView({ stationId }: ShortQuizAttemptViewProps) {
  const t = useTranslations("student.dashboard.shortQuiz");
  const router = useRouter();
  const searchParams = useSearchParams();
  const qs = searchParams.toString();
  const withQuery = (path: string) => (qs ? `${path}?${qs}` : path);

  const session = useShortQuizAttemptSession({ stationId });

  useEffect(() => {
    if (
      session.attempt &&
      isAttemptFinalized(session.attempt) &&
      session.result &&
      isAttemptFinalized(session.result.attempt)
    ) {
      router.replace(withQuery(ROUTES.USER.STUDENT.SHORT_QUIZ_RESULTS(stationId)));
    }
  }, [router, session.attempt, session.result, stationId, qs]);

  const journeyHref = (() => {
    const params = new URLSearchParams();
    const courseId = searchParams.get("courseId");
    const pathId = searchParams.get("pathId");
    if (courseId) params.set("courseId", courseId);
    if (pathId) params.set("pathId", pathId);
    const query = params.toString();
    return query ? `${ROUTES.USER.STUDENT.JOURNEY}?${query}` : ROUTES.USER.STUDENT.JOURNEY;
  })();

  if (session.attemptQuery.isLoading) return <ShortQuizSkeleton variant="attempt" />;

  if (session.attemptQuery.error || !session.attempt || !session.currentQuestion) {
    return (
      <div className="mx-auto max-w-[900px] space-y-4 p-6">
        <ApiFailureAlert
          message={
            session.attemptQuery.error instanceof Error
              ? session.attemptQuery.error.message
              : t("errors.loadAttempt")
          }
          fallbackMessage={t("errors.loadAttempt")}
        />
        <Button type="button" variant="outline" onClick={() => void session.attemptQuery.refetch()}>
          {t("errors.retry")}
        </Button>
      </div>
    );
  }

  const attempt = session.attempt;
  const question = session.currentQuestion;
  const progressPercent =
    attempt.totalQuestions > 0
      ? Math.round((attempt.answeredQuestionsCount / attempt.totalQuestions) * 100)
      : 0;
  const isTrueFalse = isTrueFalseQuestion(question);
  const isLast = session.currentIndex >= session.questions.length - 1;

  const handleSubmitConfirm = async () => {
    await session.submit();
    router.replace(withQuery(ROUTES.USER.STUDENT.SHORT_QUIZ_RESULTS(stationId)));
  };

  return (
    <div className="flex min-h-full flex-col bg-[#f6f7f7]">
      <header className="sticky top-0 z-10 border-b border-[rgba(44,66,96,0.1)] bg-white">
        <div className="mx-auto flex max-w-[960px] items-center justify-between px-4 py-4">
          <Button asChild variant="ghost" size="icon" className="rounded-full bg-[#f1f5f9]">
            <Link href={journeyHref} aria-label={t("actions.close")}>
              <X className="size-4" />
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <div className="text-end">
              <h1 className="text-lg font-bold text-[#2c4260] sm:text-xl">
                {t("attempt.headerTitle", { title: attempt.quizTitle })}
              </h1>
              <p className="text-xs text-[#64748b]">{t("attempt.headerSubtitle")}</p>
            </div>
            <div className="flex size-10 items-center justify-center rounded-lg bg-[#2b415e] text-white">
              <GraduationCap className="size-5" />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[906px] flex-1 flex-col gap-6 px-4 py-6 pb-28">
        <section className="rounded-xl border border-[rgba(44,66,96,0.05)] bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-medium text-[#64748b]">
              {attempt.totalQuestions} / {session.currentIndex + 1}
            </p>
            <h2 className="text-lg font-bold text-[#2c4260]">
              {t("attempt.questionLabel", {
                label: getArabicQuestionLabel(question.order || session.currentIndex + 1),
              })}
            </h2>
          </div>
          <div className="mb-3 h-3 overflow-hidden rounded-full bg-[#f1f5f9]">
            <div
              className="h-full rounded-full bg-[#c7af6d] transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="flex items-center justify-end gap-2 text-sm text-[#64748b]">
            {t("attempt.remaining", { time: formatRemainingTime(session.remainingSeconds) })}
            <Clock3 className="size-3.5" />
          </p>
        </section>

        <section className="rounded-xl border border-[rgba(44,66,96,0.05)] bg-white p-6 shadow-sm sm:p-8">
          {isTrueFalse ? (
            <div className="mb-8 space-y-4 text-center">
              <span className="inline-flex rounded-full bg-[rgba(199,214,240,0.2)] px-4 py-1 text-sm font-bold uppercase tracking-wide text-[#2c4260]">
                {t("attempt.trueFalseBadge")}
              </span>
              <h3 className="text-2xl font-bold text-[#0f172a] sm:text-3xl">{question.text}</h3>
            </div>
          ) : (
            <div className="mb-8 space-y-6">
              {question.imageUrl ? (
                <div className="relative mx-auto aspect-[16/9] w-full max-w-xl overflow-hidden rounded-xl bg-[#f1f5f9]">
                  <Image
                    src={question.imageUrl}
                    alt=""
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
              ) : null}
              <h3 className="text-center text-2xl font-bold leading-snug text-[#1e293b] sm:text-3xl">
                {question.text}
              </h3>
            </div>
          )}

          {isTrueFalse ? (
            <ShortQuizTrueFalseOptions
              options={question.options}
              selectedOptionId={question.selectedOptionId}
              onSelect={(optionId) => session.selectOption(question.id, optionId)}
              disabled={session.isSubmitting}
            />
          ) : (
            <ShortQuizMcqOptions
              options={question.options}
              selectedOptionId={question.selectedOptionId}
              onSelect={(optionId) => session.selectOption(question.id, optionId)}
              disabled={session.isSubmitting}
            />
          )}
        </section>

        <ShortQuizQuestionMap
          questions={session.questions}
          currentIndex={session.currentIndex}
          onSelect={session.goToQuestion}
        />

        {(session.saveError || session.submitError) && (
          <ApiFailureAlert
            message={session.saveError || session.submitError || ""}
            fallbackMessage={t("errors.save")}
          />
        )}
      </main>

      <footer className="fixed inset-x-0 bottom-0 border-t border-[rgba(44,66,96,0.1)] bg-white">
        <div className="mx-auto flex max-w-[768px] gap-3 px-4 py-4">
          <Button
            type="button"
            className="h-12 flex-1 rounded-lg bg-[#c7af6d] text-white hover:bg-[#b39f63]"
            onClick={session.goPrev}
            disabled={session.currentIndex === 0}
          >
            <ArrowRight className="size-4" />
            {t("attempt.prev")}
          </Button>
          <Button
            type="button"
            className="h-12 flex-1 rounded-lg bg-[#2c4260] text-white hover:bg-[#1e2e42]"
            onClick={() => {
              if (isLast) session.setSubmitOpen(true);
              else session.goNext();
            }}
            disabled={session.isSubmitting}
          >
            {session.isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
            {isLast ? t("attempt.finish") : t("attempt.next")}
            <ArrowLeft className="size-4" />
          </Button>
        </div>
      </footer>

      <ShortQuizSubmitModal
        open={session.submitOpen}
        answeredCount={attempt.answeredQuestionsCount}
        totalQuestions={attempt.totalQuestions}
        isSubmitting={session.isSubmitting}
        onConfirm={() => void handleSubmitConfirm()}
        onCancel={() => session.setSubmitOpen(false)}
      />
    </div>
  );
}
