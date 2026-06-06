"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  CheckCircle2,
  Download,
  Share2,
  Timer,
  Trophy,
  Users,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useQuizAnalysis } from "@/modules/admin/application/hooks/useQuizAnalysis";
import { QUESTION_SORT, QUIZ_TYPE, SCORE_MODE, type ScoreMode } from "@/modules/admin/domain/types/resultsAnalytics.types";
import {
  difficultyTone,
  formatPercent,
} from "@/modules/admin/domain/utils/resultsAnalyticsDisplay";
import { GradeDistributionAreaChart } from "@/modules/admin/presentation/components/results-analytics/charts/GradeDistributionAreaChart";
import { QuestionPerformanceBarChart } from "@/modules/admin/presentation/components/results-analytics/charts/QuestionPerformanceBarChart";
import {
  DisabledFeatureButton,
  QuizAnalysisDashboardSkeleton,
  ResultsAnalyticsAnimatedSection,
} from "@/modules/admin/presentation/components/results-analytics";
import { notify } from "@/shared/application/lib/toast";
import {
  DashboardBadge,
  DashboardDataTable,
  type DashboardDataTableColumn,
  DashboardPageHeader,
  DashboardPagination,
  DashboardSegmentedControl,
  DashboardStatCard,
  DashboardTableCard,
} from "@/shared/presentation/components/dashboard";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import { UserAvatarImageOrInitials } from "@/shared/presentation/components/user";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import type { QuizQuestionDetailRow } from "@/modules/admin/domain/types/resultsAnalytics.types";

export type QuizAnalysisDashboardProps = {
  quizId: string;
};

export function QuizAnalysisDashboard({ quizId }: QuizAnalysisDashboardProps) {
  const t = useTranslations("admin.dashboard.resultsAnalytics");
  const locale = useLocale();
  const [questionSort, setQuestionSort] = useState<number>(QUESTION_SORT.hardestFirst);
  const [scoreMode, setScoreMode] = useState<ScoreMode>(SCORE_MODE.bestAttempt);

  const analysisQuery = useQuizAnalysis(quizId, { questionSort, scoreMode });
  const analysis = analysisQuery.analysis;

  useEffect(() => {
    if (analysisQuery.errorMessage) notify.error(analysisQuery.errorMessage);
  }, [analysisQuery.errorMessage]);

  const questionColumns = useMemo<Array<DashboardDataTableColumn<QuizQuestionDetailRow>>>(
    () => [
      {
        id: "order",
        header: t("quizAnalysis.questions.number"),
        renderCell: (row) => `#${row.order}`,
      },
      {
        id: "text",
        header: t("quizAnalysis.questions.text"),
        renderCell: (row) => (
          <p className="max-w-[24rem] truncate text-sm text-slate-700">{row.questionText}</p>
        ),
      },
      {
        id: "classification",
        header: t("quizAnalysis.questions.classification"),
        renderCell: (row) => <DashboardBadge tone="primary">{row.classification}</DashboardBadge>,
      },
      {
        id: "difficulty",
        header: t("quizAnalysis.questions.difficulty"),
        renderCell: (row) => (
          <DashboardBadge tone={difficultyTone(row.difficulty)}>
            {t(`difficulty.${row.difficulty}`)}
          </DashboardBadge>
        ),
      },
    ],
    [t],
  );

  if (analysisQuery.isLoading && !analysis) {
    return <QuizAnalysisDashboardSkeleton />;
  }

  if (!analysis) {
    return (
      <div className="rounded-[2rem] border border-dashed border-slate-200 bg-white p-10 text-center text-slate-500 shadow-[var(--dashboard-shadow-soft)]">
        {t("quizAnalysis.loadError")}
      </div>
    );
  }

  const { header, summary, questionPerformance, gradeDistribution, questionDetails, topStudents } =
    analysis;
  const isStationQuiz = header.quizType === QUIZ_TYPE.stationQuiz;
  const examDate = header.examDateUtc
    ? new Date(header.examDateUtc).toLocaleDateString(locale, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

  return (
    <div className="space-y-8">
      <ResultsAnalyticsAnimatedSection>
        <DashboardPageHeader
          title={header.quizTitle}
          description={header.courseTitle}
          breadcrumbs={[
            { label: t("breadcrumbs.home"), href: ROUTES.ADMIN.HOME },
            { label: t("breadcrumbs.results"), href: ROUTES.ADMIN.RESULTS.LIST },
            { label: header.quizTitle },
          ]}
          action={
            <div className="flex flex-wrap items-center gap-3">
              <DashboardBadge tone="success">{header.statusLabel}</DashboardBadge>
              <DisabledFeatureButton
                label={t("quizAnalysis.page.exportPdf")}
                tooltip={t("comingSoon")}
                icon={Download}
                variant="outline"
                className="rounded-2xl"
              />
              <DisabledFeatureButton
                label={t("quizAnalysis.page.shareResults")}
                tooltip={t("comingSoon")}
                icon={Share2}
                variant="default"
                className="rounded-2xl bg-[#C7AF6E] text-[#2C4260] hover:bg-[#C7AF6E]"
              />
            </div>
          }
        />
        <p className="text-right text-sm text-slate-500">
          {t("quizAnalysis.page.meta", {
            date: examDate,
            count: new Intl.NumberFormat(locale).format(header.totalStudents),
          })}
        </p>
      </ResultsAnalyticsAnimatedSection>

      {isStationQuiz ? (
        <ResultsAnalyticsAnimatedSection delay={0.03}>
          <div className="flex justify-end">
            <DashboardSegmentedControl
              options={[
                { id: String(SCORE_MODE.bestAttempt), label: t("quizAnalysis.scoreMode.best") },
                { id: String(SCORE_MODE.latestAttempt), label: t("quizAnalysis.scoreMode.latest") },
                { id: String(SCORE_MODE.firstAttempt), label: t("quizAnalysis.scoreMode.first") },
              ]}
              value={String(scoreMode)}
              onChange={(value) => setScoreMode(Number(value) as ScoreMode)}
            />
          </div>
        </ResultsAnalyticsAnimatedSection>
      ) : null}

      <ResultsAnalyticsAnimatedSection delay={0.05}>
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <DashboardStatCard
            label={t("quizAnalysis.stats.averageScore")}
            value={formatPercent(summary.averageScorePercent, locale)}
            icon={BarChart3}
            iconTone="primary"
          />
          <DashboardStatCard
            label={t("quizAnalysis.stats.passRate")}
            value={formatPercent(summary.passRatePercent, locale)}
            icon={CheckCircle2}
            iconTone="success"
          />
          <DashboardStatCard
            label={t("quizAnalysis.stats.averageTime")}
            value={t("quizAnalysis.stats.minutesUnit", {
              value: new Intl.NumberFormat(locale).format(summary.averageCompletionMinutes),
            })}
            icon={Timer}
            iconTone="warning"
          />
          <DashboardStatCard
            label={t("quizAnalysis.stats.participationRate")}
            value={formatPercent(summary.participationRatePercent, locale)}
            icon={Users}
            iconTone="info"
          />
        </section>
      </ResultsAnalyticsAnimatedSection>

      <ResultsAnalyticsAnimatedSection delay={0.08}>
        <section className="grid gap-6 xl:grid-cols-2">
          <GradeDistributionAreaChart
            title={t("quizAnalysis.charts.gradeDistribution")}
            studentsLabel={t("quizAnalysis.charts.studentsLabel")}
            rows={gradeDistribution}
          />
          <QuestionPerformanceBarChart
            title={t("quizAnalysis.charts.questionPerformance")}
            subtitle={t("quizAnalysis.charts.questionPerformanceHint")}
            rows={questionPerformance}
          />
        </section>
      </ResultsAnalyticsAnimatedSection>

      <ResultsAnalyticsAnimatedSection delay={0.12}>
        <div className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h3 className="text-right text-xl font-bold text-slate-800">
              {t("quizAnalysis.questions.title")}
            </h3>
            <DashboardSegmentedControl
              options={[
                { id: String(QUESTION_SORT.hardestFirst), label: t("quizAnalysis.questions.sortHardest") },
                {
                  id: String(QUESTION_SORT.byClassification),
                  label: t("quizAnalysis.questions.sortClassification"),
                },
              ]}
              value={String(questionSort)}
              onChange={(value) => setQuestionSort(Number(value))}
            />
          </div>

          <DashboardTableCard>
            <DashboardDataTable
              rows={questionDetails}
              columns={questionColumns}
              getRowKey={(row) => row.questionId}
              emptyMessage={t("quizAnalysis.questions.empty")}
            />

            <div className="flex flex-col gap-4 border-t border-slate-100 px-6 py-5 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-slate-500">
                {t("quizAnalysis.questions.showing", {
                  from:
                    (analysis.questionPagination.currentPage - 1) *
                      analysis.questionPagination.pageSize +
                    (questionDetails.length ? 1 : 0),
                  to:
                    (analysis.questionPagination.currentPage - 1) *
                      analysis.questionPagination.pageSize +
                    questionDetails.length,
                  total: analysis.questionPagination.totalCount,
                })}
              </p>
              <DashboardPagination
                pages={analysisQuery.questionPages}
                currentPage={analysisQuery.questionPageNumber}
                onPageChange={analysisQuery.setQuestionPageNumber}
                previousLabel={t("pagination.previous")}
                nextLabel={t("pagination.next")}
              />
            </div>
          </DashboardTableCard>
        </div>
      </ResultsAnalyticsAnimatedSection>

      <ResultsAnalyticsAnimatedSection delay={0.16} className="bg-white p-6 rounded-[2rem]">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-800">{t("quizAnalysis.topStudents.title")}</h3>
            {/* <DisabledFeatureButton
              label={t("quizAnalysis.topStudents.viewAll")}
              tooltip={t("comingSoon")}
              variant="ghost"
              className="rounded-xl text-[#C7AF6D] hover:bg-slate-50"
            /> */}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {topStudents.map((student) => (
              <Card
                key={student.userId}
                className="rounded-[1.75rem] border-[#F1F5F9] bg-[#F8FAFC] shadow-[var(--dashboard-shadow-soft)]"
              >
                <CardContent className="flex items-center justify-between gap-4 p-5">
                  <div className="flex items-center gap-3">
                    <UserAvatarImageOrInitials
                      trackKey={student.userId}
                      name={student.fullName}
                      imageUrl={student.profileImageUrl}
                      size="md"
                      circleClassName="bg-[#DCE6F5] text-[#2C4260]"
                    />
                    <div className="space-y-1 text-right">
                      <p className="font-semibold text-slate-800">{student.fullName}</p>
                      <p className="text-xs text-slate-500">
                        {t("quizAnalysis.topStudents.score", {
                          value: new Intl.NumberFormat(locale).format(student.scorePercent),
                        })}
                      </p>
                      <p className="text-xs text-slate-400">
                        {t("quizAnalysis.topStudents.time", {
                          value: new Intl.NumberFormat(locale).format(student.completionMinutes),
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <DashboardBadge tone="gold">{student.levelLabel}</DashboardBadge>
                    <Trophy className="h-5 w-5 text-emerald-500" aria-hidden />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </ResultsAnalyticsAnimatedSection>
    </div>
  );
}
