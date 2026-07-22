"use client";

import Link from "next/link";
import { Info, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { useParentStationDetail } from "@/modules/parent/application/hooks/useParentLearning";
import { clampPercent, formatPercent } from "@/modules/parent/application/lib/parentHome.utils";
import { ParentProgressRing } from "@/modules/parent/presentation/components/home/ParentProgressRing";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { Button } from "@/shared/presentation/components/ui/button";
import { Skeleton } from "@/shared/presentation/components/ui/skeleton";

export function ParentQuizReviewDashboard({
  studentUserId,
  stationId,
}: {
  studentUserId: string;
  stationId: string;
}) {
  const t = useTranslations("parent.dashboard.learning");
  const tCommon = useTranslations("parent.dashboard.common");
  const stationQuery = useParentStationDetail(studentUserId, stationId);

  if (stationQuery.isLoading) {
    return (
      <div className="mx-auto flex w-full flex-col gap-8 pb-8">
        <Skeleton className="h-16 w-96" />
        <Skeleton className="h-72 rounded-[20px]" />
      </div>
    );
  }

  if (stationQuery.isError || !stationQuery.data) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-[20px] border border-red-100 bg-white p-6">
        <p className="text-sm text-red-600">{tCommon("error")}</p>
        <Button type="button" onClick={() => stationQuery.refetch()}>
          {tCommon("retry")}
        </Button>
      </div>
    );
  }

  const station = stationQuery.data;
  const quiz = station.quiz;

  return (
    <div className="mx-auto flex w-full flex-col gap-8 pb-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <Button
          asChild
          variant="outline"
          className="order-2 h-11 w-fit rounded-xl border-[#e2e8f0] bg-[#f8f9fa] px-5 text-sm font-bold text-[#2b415e] sm:order-1"
        >
          <Link href={ROUTES.USER.PARENT.CHILD_STATION(studentUserId, stationId)}>
            {t("viewStation")}
          </Link>
        </Button>
        <div className="order-1 text-end sm:order-2">
          <p className="mb-1 text-sm text-[#94a3b8]">{t("breadcrumbStation")}</p>
          <h1 className="text-2xl font-bold text-[#2b415e] md:text-3xl">{t("quizReviewTitle")}</h1>
          <p className="mt-1 text-sm text-[#64748b]">{station.title}</p>
        </div>
      </div>

      {!quiz ? (
        <p className="rounded-2xl bg-white p-10 text-center text-[#64748b] shadow-[0px_8px_0px_rgba(0,0,0,0.04)]">
          {t("quizNoData")}
        </p>
      ) : (
        <article className="flex flex-col items-center gap-6 rounded-[20px] border border-[#eef2f6] bg-white p-8 shadow-[0px_8px_0px_rgba(0,0,0,0.04)] sm:flex-row sm:justify-between">
          <div className="text-center sm:text-start">
            <h2 className="flex items-center justify-center gap-2 text-sm font-bold text-[#2b415e] sm:justify-start">
              <Sparkles className="size-4 text-[#c7af6d]" aria-hidden />
              {t("quizScoreSummary")}
            </h2>
            {quiz.statusLabelAr ? (
              <span className="mt-3 inline-flex rounded-full bg-[#dcf4cb] px-3 py-1 text-xs font-bold text-[#46a302]">
                {quiz.statusLabelAr}
              </span>
            ) : null}
            {quiz.correctCount != null && quiz.totalQuestions != null ? (
              <p className="mt-3 text-sm font-bold text-[#2b415e]">
                {t("quizCorrectAnswers", {
                  correct: quiz.correctCount,
                  total: quiz.totalQuestions,
                })}
              </p>
            ) : null}
          </div>
          <ParentProgressRing value={quiz.scorePercent ?? 0} size={128} color="#1e88e5">
            <p className="text-2xl font-bold text-[#2b415e]">
              {formatPercent(clampPercent(quiz.scorePercent ?? 0))}
            </p>
          </ParentProgressRing>
        </article>
      )}

      <div className="flex items-start gap-2.5 rounded-xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-sky-800">
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
        <p>{t("quizNoteParent")}</p>
      </div>
    </div>
  );
}
