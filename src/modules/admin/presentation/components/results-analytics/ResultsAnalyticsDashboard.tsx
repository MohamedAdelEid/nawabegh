"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Download,
  Plus,
  Star,
  Timer,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useResultsOverview } from "@/modules/admin/application/hooks/useResultsOverview";
import type { ResultsOverviewStudentRow } from "@/modules/admin/domain/types/resultsAnalytics.types";
import {
  formatPercent,
  formatRelativeTime,
  formatTrendPercent,
  resultStatusTone,
  scorePercentClassName,
} from "@/modules/admin/domain/utils/resultsAnalyticsDisplay";
import { getExamsDashboard } from "@/modules/admin/infrastructure/api/finalExamsApi";
import { getSchoolFilterOptions } from "@/modules/admin/infrastructure/api/schoolApi";
import {
  DisabledFeatureButton,
  ResultsAnalyticsAnimatedSection,
  ResultsAnalyticsDashboardSkeleton,
  ResultsAnalyticsFilterBar,
} from "@/modules/admin/presentation/components/results-analytics";
import { notify } from "@/shared/application/lib/toast";
import {
  DashboardBadge,
  DashboardDataTable,
  type DashboardDataTableColumn,
  DashboardPageHeader,
  DashboardPagination,
  DashboardTableCard,
} from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import { UserAvatarImageOrInitials } from "@/shared/presentation/components/user";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { ResultsAnalyticsFilterState } from "@/modules/admin/domain/types/resultsAnalyticsFilters.types";

export function ResultsAnalyticsDashboard() {
  const t = useTranslations("admin.dashboard.resultsAnalytics");
  const locale = useLocale();
  const router = useRouter();
  const overview = useResultsOverview();
  const page = overview.page;

  const [examOptions, setExamOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [schoolOptions, setSchoolOptions] = useState<Array<{ value: string; label: string }>>([]);

  useEffect(() => {
    if (overview.errorMessage) notify.error(overview.errorMessage);
  }, [overview.errorMessage]);

  useEffect(() => {
    void (async () => {
      const [examsResult, schoolsResult] = await Promise.all([
        getExamsDashboard({ pageNumber: 1, pageSize: 200 }),
        getSchoolFilterOptions({ pageSize: 500 }),
      ]);

      if (examsResult.data?.latestExams?.length) {
        setExamOptions(
          examsResult.data.latestExams.map((row) => ({
            value: row.quizId,
            label: row.examName,
          })),
        );
      }

      if (schoolsResult.data?.length) {
        setSchoolOptions(
          schoolsResult.data.map((school) => ({
            value: school.id,
            label: school.name,
          })),
        );
      }
    })();
  }, []);

  const summary = page?.summary;
  const rows = page?.students ?? [];

  const description = page?.isSingleExamView && page.selectedQuizTitle
    ? t("overview.page.descriptionSingleExam", { exam: page.selectedQuizTitle })
    : t("overview.page.description");

  const handleAnalyze = useCallback(
    (row: ResultsOverviewStudentRow) => {
      if (page?.isSingleExamView) {
        const quizId = row.quizId || page.selectedQuizId;
        if (quizId) {
          router.push(ROUTES.ADMIN.RESULTS.QUIZ_ANALYSIS(quizId));
        }
        return;
      }
      router.push(ROUTES.ADMIN.RESULTS.STUDENT(row.userId));
    },
    [page?.isSingleExamView, page?.selectedQuizId, router],
  );

  const columns = useMemo<Array<DashboardDataTableColumn<ResultsOverviewStudentRow>>>(
    () => [
      {
        id: "student",
        header: t("overview.table.student"),
        renderCell: (row) => (
          <div className="flex min-w-[14rem] items-center gap-3">
            <UserAvatarImageOrInitials
              trackKey={row.userId}
              name={row.fullName}
              imageUrl={row.profileImageUrl}
              size="md"
              circleClassName="bg-[#DCE6F5] text-[#2C4260]"
            />
            <div className="space-y-0.5 text-right">
              <p className="font-semibold text-slate-800">{row.fullName}</p>
              <p className="text-xs text-slate-400">
                {row.schoolName} • {row.gradeName}
              </p>
            </div>
          </div>
        ),
      },
      {
        id: "score",
        header: t("overview.table.averageScore"),
        renderCell: (row) => (
          <span className={scorePercentClassName(row.representativeScorePercent)}>
            {formatPercent(row.representativeScorePercent, locale)}
          </span>
        ),
      },
      {
        id: "attempts",
        header: t("overview.table.attempts"),
        renderCell: (row) => new Intl.NumberFormat(locale).format(row.attemptCount),
      },
      {
        id: "lastActivity",
        header: t("overview.table.lastActivity"),
        cellClassName: "text-slate-500",
        renderCell: (row) => formatRelativeTime(row.lastActivityAt, locale),
      },
      {
        id: "status",
        header: t("overview.table.status"),
        renderCell: (row) => (
          <DashboardBadge tone={resultStatusTone(row.resultStatus)} withDot>
            {t(`resultStatus.${row.resultStatus}`)}
          </DashboardBadge>
        ),
      },
    ],
    [locale, t],
  );

  const statCards = useMemo(() => {
    const trends = summary?.trends;
    const studentsTrend = formatTrendPercent(trends?.studentsTestedChangePercent ?? null, locale);
    const scoreTrend = formatTrendPercent(trends?.averageScoreChangePercent ?? null, locale);
    const passTrend = formatTrendPercent(trends?.passRateChangePercent ?? null, locale);
    const timeTrend = formatTrendPercent(
      trends?.averageCompletionMinutesChangePercent ?? null,
      locale,
    );

    return [
      {
        id: "totalStudents",
        label: t("overview.stats.totalStudents.label"),
        value: summary
          ? new Intl.NumberFormat(locale).format(summary.totalStudentsTested)
          : "—",
        trend: studentsTrend,
        primary: true,
        icon: Users,
      },
      {
        id: "averageScore",
        label: t("overview.stats.averageScore.label"),
        value: formatPercent(summary?.averageScorePercent, locale),
        trend: scoreTrend,
        badge: t("overview.stats.averageScore.badgeHigh"),
        icon: Star,
        progress: summary?.averageScorePercent ?? 0,
      },
      {
        id: "passRate",
        label: t("overview.stats.passRate.label"),
        value: formatPercent(summary?.overallPassRatePercent, locale),
        trend: passTrend,
        badge: t("overview.stats.averageScore.badgeStable"),
        icon: CheckCircle2,
        progress: summary?.overallPassRatePercent ?? 0,
      },
      {
        id: "averageTime",
        label: t("overview.stats.averageTime.label"),
        value: summary
          ? t("overview.stats.averageTime.unit", {
              value: new Intl.NumberFormat(locale).format(summary.averageCompletionMinutes),
            })
          : "—",
        trend: timeTrend,
        icon: Timer,
      },
    ];
  }, [locale, summary, t]);

  if (overview.isLoading && !page) {
    return <ResultsAnalyticsDashboardSkeleton />;
  }

  return (
    <div className="space-y-8">
      <ResultsAnalyticsAnimatedSection>
        <DashboardPageHeader
          title={t("overview.page.title")}
          description={description}
          breadcrumbs={[
            { label: t("breadcrumbs.home"), href: ROUTES.ADMIN.HOME },
            { label: t("breadcrumbs.results") },
          ]}
          action={
            <div className="flex flex-wrap items-center gap-3">
              <DisabledFeatureButton
                label={t("overview.page.exportReport")}
                tooltip={t("comingSoon")}
                icon={Download}
                variant="outline"
                className="rounded-2xl"
              />
              {/* <DisabledFeatureButton
                label={t("overview.page.addResult")}
                tooltip={t("comingSoon")}
                icon={Plus}
                variant="default"
                className="rounded-2xl bg-[#2C4260] hover:bg-[#2C4260]"
              /> */}
            </div>
          }
        />
      </ResultsAnalyticsAnimatedSection>

      <ResultsAnalyticsAnimatedSection delay={0.04}>
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card) => {
            const Icon = card.icon;
            if (card.primary) {
              return (
                <Card
                  key={card.id}
                  className="rounded-[1.75rem] border-transparent bg-[#2C4260] text-white shadow-[var(--dashboard-shadow-soft)]"
                >
                  <CardContent className="space-y-4 p-6">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm text-white/80">{card.label}</p>
                      <Icon className="h-5 w-5 text-[#C7AF6E]" aria-hidden />
                    </div>
                    <p className="text-4xl font-bold">{card.value}</p>
                    {card.trend ? (
                      <p className={`inline-flex items-center gap-1 text-sm ${card.trend.className}`}>
                        {card.trend.text.includes("-") ? (
                          <TrendingDown className="h-4 w-4" aria-hidden />
                        ) : (
                          <TrendingUp className="h-4 w-4" aria-hidden />
                        )}
                        {t("overview.stats.totalStudents.trend", { value: card.trend.text })}
                      </p>
                    ) : null}
                  </CardContent>
                </Card>
              );
            }

            return (
              <Card
                key={card.id}
                className="rounded-[1.75rem] border-white/80 bg-white shadow-[var(--dashboard-shadow-soft)]"
              >
                <CardContent className="space-y-4 p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      {card.badge ? (
                        <DashboardBadge tone="success" className="mb-2">
                          {card.badge}
                        </DashboardBadge>
                      ) : null}
                      <p className="text-sm text-slate-500">{card.label}</p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F8EFD5] text-[#8F6C0B]">
                      <Icon className="h-5 w-5" aria-hidden />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-slate-800">{card.value}</p>
                  {"progress" in card && card.progress != null ? (
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-[#C7AF6E]"
                        style={{ width: `${Math.min(100, card.progress)}%` }}
                      />
                    </div>
                  ) : null}
                  {card.trend ? (
                    <p className={`text-sm ${card.trend.className}`}>{card.trend.text}</p>
                  ) : null}
                </CardContent>
              </Card>
            );
          })}
        </section>
      </ResultsAnalyticsAnimatedSection>

      <ResultsAnalyticsAnimatedSection delay={0.08}>
        <ResultsAnalyticsFilterBar
          filters={overview.filters}
          examOptions={examOptions}
          schoolOptions={schoolOptions}
          onChange={(patch: Partial<ResultsAnalyticsFilterState>) => overview.setFilters((current: ResultsAnalyticsFilterState) => ({ ...current, ...patch }))}
        />
      </ResultsAnalyticsAnimatedSection>

      <ResultsAnalyticsAnimatedSection delay={0.12}>
        <DashboardTableCard
          className={overview.isRefetching ? "opacity-60 transition-opacity" : undefined}
        >
          <DashboardDataTable
            rows={rows}
            columns={columns}
            getRowKey={(row) => row.userId}
            emptyMessage={t("overview.table.empty")}
            actionsHeader={t("overview.table.actions")}
            renderActions={(row) => (
              <Button
                type="button"
                size="sm"
                className="rounded-xl bg-[#2C4260] hover:bg-[#243751]"
                onClick={() => handleAnalyze(row)}
              >
                {t("overview.table.analyze")}
              </Button>
            )}
          />

          {page ? (
            <div className="flex flex-col gap-4 border-t border-slate-100 px-6 py-5 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-slate-500">
                {t("overview.table.showing", {
                  from: (page.currentPage - 1) * page.pageSize + (rows.length ? 1 : 0),
                  to: (page.currentPage - 1) * page.pageSize + rows.length,
                  total: page.totalCount,
                })}
              </p>
              <DashboardPagination
                pages={overview.pages}
                currentPage={overview.pageNumber}
                onPageChange={overview.setPageNumber}
                previousLabel={t("pagination.previous")}
                nextLabel={t("pagination.next")}
              />
            </div>
          ) : null}
        </DashboardTableCard>
      </ResultsAnalyticsAnimatedSection>
    </div>
  );
}
