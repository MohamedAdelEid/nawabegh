"use client";

import Link from "next/link";
import { Award, MessageCircle, Sparkles, Trophy } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { useParentChildReports } from "@/modules/parent/application/hooks/useParentLearning";
import { clampPercent, formatPercent } from "@/modules/parent/application/lib/parentHome.utils";
import { ParentAvatar } from "@/modules/parent/presentation/components/home/ParentAvatar";
import { ParentProgressBar } from "@/modules/parent/presentation/components/home/ParentProgressBar";
import { useDirection } from "@/shared/application/hooks/useDirection";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { Button } from "@/shared/presentation/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  chartResponsiveHeightClass,
  type ChartConfig,
} from "@/shared/presentation/components/ui/chart";
import { Skeleton } from "@/shared/presentation/components/ui/skeleton";

const monthlyChartConfig = {
  score: { label: "Score", color: "#1e88e5" },
} satisfies ChartConfig;

function KpiCard({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <article className="relative overflow-hidden rounded-[16px] bg-white p-5 shadow-[0px_8px_0px_rgba(0,0,0,0.05)]">
      <div className={`absolute inset-x-0 top-0 h-1.5 ${accent}`} />
      <p className="text-xs font-bold text-[#64748b]">{label}</p>
      <p className="mt-3 text-2xl font-bold text-[#2b415e]">{value}</p>
    </article>
  );
}

export function ParentChildResultsDashboard({
  studentUserId,
  courseId,
}: {
  studentUserId: string;
  courseId: string;
}) {
  const t = useTranslations("parent.dashboard.learning");
  const tCommon = useTranslations("parent.dashboard.common");
  const locale = useLocale();
  const { isRtl } = useDirection();
  const reportsQuery = useParentChildReports(studentUserId, courseId);

  if (reportsQuery.isLoading) {
    return (
      <div className="mx-auto flex w-full flex-col gap-8 pb-8">
        <Skeleton className="h-16 w-96" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-28 rounded-[16px]" />
          ))}
        </div>
        <Skeleton className="h-80 rounded-[20px]" />
      </div>
    );
  }

  if (reportsQuery.isError || !reportsQuery.data) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-[20px] border border-red-100 bg-white p-6">
        <p className="text-sm text-red-600">{tCommon("error")}</p>
        <Button type="button" onClick={() => reportsQuery.refetch()}>
          {tCommon("retry")}
        </Button>
      </div>
    );
  }

  const report = reportsQuery.data;
  const courseSubject = report.subjects.find((subject) => subject.courseId === courseId);
  const courseTitle = courseSubject?.courseTitle || report.childFullName;
  const monthlyData = (report.monthlyPerformance ?? []).map((point, index) => ({
    label: point.monthLabelAr || point.labelAr || point.month || `${index + 1}`,
    score: point.averageScorePercent,
  }));
  const chapters = report.chapters ?? [];
  const recentQuizzes = report.recentQuizzes ?? [];

  return (
    <div className="mx-auto flex w-full flex-col gap-8 pb-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <Button
          asChild
          variant="outline"
          className="order-2 h-11 rounded-xl border-[#e2e8f0] bg-[#f8f9fa] px-5 text-sm font-bold text-[#2b415e] sm:order-1"
        >
          <Link href={ROUTES.USER.PARENT.CHILD_COURSES(studentUserId)}>
            {t("backToCourses")}
          </Link>
        </Button>
        <div className="order-1 text-end sm:order-2">
          <p className="mb-1 text-sm text-[#94a3b8]">{t("breadcrumbResults")}</p>
          <h1 className="text-2xl font-bold text-[#2b415e] md:text-3xl">
            {t("resultsTitle", { course: courseTitle })}
          </h1>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label={t("overallRate")}
          value={formatPercent(clampPercent(report.overallProgressPercent))}
          accent="bg-[#58cc02]"
        />
        <KpiCard
          label={t("attendance")}
          value={formatPercent(clampPercent(report.attendancePercent))}
          accent="bg-[#1e88e5]"
        />
        <KpiCard
          label={t("stationsCompleted")}
          value={`${report.completedStationsCount ?? 0}/${report.totalStationsCount ?? 0}`}
          accent="bg-[#c7af6d]"
        />
        <KpiCard
          label={t("pointsEarned")}
          value={String(report.pointsEarned ?? 0)}
          accent="bg-[#d33131]"
        />
      </div>

      <article className="rounded-[20px] bg-white p-6 shadow-[0px_8px_0px_rgba(0,0,0,0.05)]">
        <h2 className="mb-4 text-sm font-bold text-[#2b415e]">{t("monthlyTrend")}</h2>
        {monthlyData.length === 0 ? (
          <p className="text-sm text-[#64748b]">{t("quizNoData")}</p>
        ) : (
          <ChartContainer
            config={monthlyChartConfig}
            className={`aspect-[16/8] ${chartResponsiveHeightClass}`}
          >
            <BarChart data={monthlyData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} orientation={isRtl ? "right" : "left"} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="score" fill="#1e88e5" radius={[10, 10, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ChartContainer>
        )}
      </article>

      <div className="grid gap-6 lg:grid-cols-12">
        <article className="space-y-4 rounded-[20px] bg-white p-6 shadow-[0px_8px_0px_rgba(0,0,0,0.05)] lg:col-span-7">
          <h2 className="text-sm font-bold text-[#2b415e]">{t("chapterMastery")}</h2>
          {chapters.length === 0 ? (
            <p className="text-sm text-[#64748b]">{t("emptySubjects")}</p>
          ) : (
            <ul className="space-y-4">
              {chapters.map((chapter, index) => (
                <li key={`${chapter.title}-${index}`} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold text-[#2b415e]">{chapter.title}</span>
                    <span className="rounded-full bg-[#f4ecd8] px-2.5 py-0.5 text-xs font-bold text-[#a38f5a]">
                      {chapter.masteryLabelAr}
                    </span>
                  </div>
                  <ParentProgressBar
                    value={chapter.progressPercent}
                    barClassName={index % 2 === 0 ? "bg-[#58cc02]" : "bg-[#2b415e]"}
                  />
                </li>
              ))}
            </ul>
          )}
        </article>

        <div className="space-y-6 lg:col-span-5">
          {report.rankLabel ? (
            <article className="flex flex-col items-center justify-center gap-2 rounded-[20px] bg-[#2b415e] p-6 text-center shadow-[0px_4px_0px_#1e2e42]">
              <span className="flex size-12 items-center justify-center rounded-full bg-white/10 text-[#c7af6d]">
                <Trophy className="size-6" aria-hidden />
              </span>
              <p className="text-sm font-bold text-white">{t("studentRank")}</p>
              <p className="text-lg font-bold text-white">{report.rankLabel}</p>
            </article>
          ) : null}

          {report.teacherFeedback ? (
            <article className="rounded-[20px] bg-white p-6 shadow-[0px_8px_0px_rgba(0,0,0,0.05)]">
              <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-[#2b415e]">
                <Award className="size-4 text-[#c7af6d]" aria-hidden />
                {t("teacherNotes")}
              </h2>
              <div className="flex items-start gap-3">
                <ParentAvatar
                  url={report.teacherFeedback.teacherImageUrl}
                  name={report.teacherFeedback.teacherName}
                  className="size-10"
                  roundedClassName="rounded-full"
                />
                <div className="min-w-0 flex-1 text-start">
                  <p className="text-sm font-bold text-[#2b415e]">
                    {report.teacherFeedback.teacherName}
                  </p>
                  <p className="mt-1 text-sm text-[#64748b]">{report.teacherFeedback.note}</p>
                </div>
              </div>
              <Button
                asChild
                variant="outline"
                className="mt-4 h-10 w-full gap-2 rounded-xl border-[#e2e8f0] bg-[#f8f9fa] text-xs font-bold text-[#2b415e]"
              >
                <Link href={ROUTES.USER.PARENT.CHILD_COURSE_CHAT(studentUserId, courseId)}>
                  <MessageCircle className="size-3.5" aria-hidden />
                  {t("messageTeacher")}
                </Link>
              </Button>
            </article>
          ) : null}
        </div>
      </div>

      <article className="overflow-hidden rounded-[20px] bg-white shadow-[0px_8px_0px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-between gap-3 border-b border-[#f1f3f5] px-6 py-5">
          <h2 className="flex items-center gap-2 text-sm font-bold text-[#2b415e]">
            <Sparkles className="size-4 text-[#c7af6d]" aria-hidden />
            {t("recentQuizzes")}
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-[rgba(248,249,250,0.5)]">
              <tr className="text-[#94a3b8]">
                <th className="px-5 py-3 text-start text-xs font-bold uppercase tracking-wide">
                  {t("quizName")}
                </th>
                <th className="px-5 py-3 text-start text-xs font-bold uppercase tracking-wide">
                  {t("date")}
                </th>
                <th className="px-5 py-3 text-start text-xs font-bold uppercase tracking-wide">
                  {t("score")}
                </th>
                <th className="px-5 py-3 text-start text-xs font-bold uppercase tracking-wide">
                  {t("correctAnswers")}
                </th>
                <th className="px-5 py-3 text-start text-xs font-bold uppercase tracking-wide">
                  {t("actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {recentQuizzes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-[#64748b]">
                    {t("quizNoData")}
                  </td>
                </tr>
              ) : (
                recentQuizzes.map((quiz, index) => (
                  <tr key={quiz.attemptId ?? `${quiz.quizTitle}-${index}`} className="border-t border-[#f1f3f5]">
                    <td className="px-5 py-4 font-bold text-[#0f172a]">{quiz.quizTitle}</td>
                    <td className="px-5 py-4 text-[#475569]">
                      {quiz.takenAtUtc
                        ? new Date(quiz.takenAtUtc).toLocaleDateString(locale)
                        : "—"}
                    </td>
                    <td className="px-5 py-4 font-bold text-[#2b415e]">
                      {formatPercent(clampPercent(quiz.scorePercent))}
                    </td>
                    <td className="px-5 py-4 text-[#475569]">
                      {quiz.correctCount != null && quiz.totalQuestions != null
                        ? `${quiz.correctCount}/${quiz.totalQuestions}`
                        : "—"}
                    </td>
                    <td className="px-5 py-4">
                      {quiz.stationId ? (
                        <Link
                          href={ROUTES.USER.PARENT.CHILD_QUIZ_REVIEW(studentUserId, quiz.stationId)}
                          className="text-xs font-bold text-[#1e88e5] hover:underline"
                        >
                          {t("viewDetails")}
                        </Link>
                      ) : (
                        <span className="text-xs text-[#94a3b8]">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </article>
    </div>
  );
}
