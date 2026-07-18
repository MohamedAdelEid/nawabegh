"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Award, Building2, Star, TrendingUp, Users } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/shared/application/lib/cn";
import { formatCompactNumber, formatNumber } from "@/shared/application/lib/format";
import {
  DashboardDataTable,
  type DashboardDataTableColumn,
  DashboardPageHeader,
  DashboardPagination,
  DashboardSegmentedControl,
  DashboardStatCard,
  DashboardTableCard,
} from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import { SearchableSelect } from "@/shared/presentation/components/ui/searchable-select";
import { UserAvatarImageOrInitials } from "@/shared/presentation/components/user/UserAvatarImageOrInitials";
import { useSchoolLeaderboard } from "@/modules/school/application/hooks/useSchoolHonorBoard";
import type {
  SchoolLeaderboardEntry,
  SchoolLeaderboardMetric,
  SchoolLeaderboardPeriod,
} from "@/modules/school/domain/types/schoolHonorBoard.types";
import { SchoolHonorBoardSkeleton } from "./SchoolHonorBoardSkeleton";

const PAGE_SIZE = 10;

function buildPages(currentPage: number, totalPages: number) {
  const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
  const end = Math.min(totalPages, start + 4);
  return Array.from({ length: Math.max(1, end - start + 1) }, (_, index) => start + index);
}

function scoreText(entry: SchoolLeaderboardEntry, locale: string) {
  return entry.scoreLabel || formatNumber(entry.score, locale);
}

function formatNextUpdate(value: string | null, locale: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function PodiumCard({
  entry,
  locale,
  featured,
}: {
  entry: SchoolLeaderboardEntry;
  locale: string;
  featured?: boolean;
}) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 18, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, delay: entry.rank * 0.06 }}
      className={cn(
        "relative flex min-h-[320px] flex-col items-center justify-center rounded-[1.75rem] bg-white p-5 text-center",
        featured
          ? "z-10 border-2 border-[#2C4260] shadow-[0_10px_0_#2C4260] lg:-translate-y-5"
          : "border border-slate-100 shadow-sm",
      )}
    >
      <span
        className={cn(
          "absolute -top-5 flex h-10 w-10 items-center justify-center rounded-full text-base font-bold shadow-sm",
          entry.rank === 1
            ? "bg-[#2C4260] text-white"
            : entry.rank === 2
              ? "bg-slate-200 text-slate-600"
              : "bg-[#C7AF6E] text-white",
        )}
      >
        {formatNumber(entry.rank, locale)}
      </span>
      <div className={cn("rounded-full border-2 p-1", featured ? "border-[#2C4260]" : "border-slate-200")}>
        <UserAvatarImageOrInitials
          trackKey={entry.userId || entry.studentProfileId}
          name={entry.fullName}
          imageUrl={entry.profileImageUrl}
          size={featured ? "xl" : "large"}
          circleClassName="bg-[#DCE6F5] text-[#2C4260]"
        />
      </div>
      <h3 className="mt-4 text-lg font-bold text-slate-800">{entry.fullName}</h3>
      <p className="mt-1 text-xs text-slate-500">{entry.gradeLabel}</p>
      <div
        className={cn(
          "mt-4 rounded-xl px-4 py-2 text-sm font-bold",
          featured ? "bg-[#2C4260] text-white" : "bg-slate-50 text-slate-700",
        )}
      >
        {scoreText(entry, locale)}
      </div>
    </motion.article>
  );
}

export function SchoolLeaderboardDashboard() {
  const t = useTranslations("school.dashboard.honorBoard");
  const locale = useLocale();
  const [period, setPeriod] = useState<SchoolLeaderboardPeriod>("weekly");
  const [metric, setMetric] = useState<SchoolLeaderboardMetric>("points");
  const [pageNumber, setPageNumber] = useState(1);
  const query = useSchoolLeaderboard({ period, metric, pageNumber, pageSize: PAGE_SIZE });
  const data = query.data;
  const podium = useMemo(
    () => [data?.topThree.find((item) => item.rank === 2), data?.topThree.find((item) => item.rank === 1), data?.topThree.find((item) => item.rank === 3)].filter(
      (item): item is SchoolLeaderboardEntry => Boolean(item),
    ),
    [data?.topThree],
  );
  const pages = buildPages(pageNumber, data?.totalPages ?? 1);
  const showRankChange = data?.others.some((item) => item.rankChange !== null) ?? false;
  const columns = useMemo<Array<DashboardDataTableColumn<SchoolLeaderboardEntry>>>(
    () => [
      {
        id: "rank",
        header: t("leaderboard.table.rank"),
        renderCell: (entry) => (
          <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-lg bg-slate-100 px-2 text-sm font-bold text-slate-600">
            {formatNumber(entry.rank, locale)}
          </span>
        ),
      },
      {
        id: "student",
        header: t("leaderboard.table.student"),
        renderCell: (entry) => (
          <div className="flex min-w-[12rem] items-center gap-3">
            <UserAvatarImageOrInitials
              trackKey={entry.userId || entry.studentProfileId}
              name={entry.fullName}
              imageUrl={entry.profileImageUrl}
              circleClassName="bg-[#DCE6F5] text-[#2C4260]"
            />
            <span className="font-semibold text-slate-800">{entry.fullName}</span>
          </div>
        ),
      },
      {
        id: "grade",
        header: t("leaderboard.table.grade"),
        cellClassName: "text-slate-500",
        renderCell: (entry) => entry.gradeLabel,
      },
      {
        id: "score",
        header: t("leaderboard.table.score"),
        cellClassName: "font-bold text-slate-700",
        renderCell: (entry) => scoreText(entry, locale),
      },
      ...(showRankChange
        ? [
            {
              id: "change",
              header: t("leaderboard.table.change"),
              cellClassName: "font-semibold",
              renderCell: (entry: SchoolLeaderboardEntry) => (
                <span
                  className={cn(
                    (entry.rankChange ?? 0) > 0
                      ? "text-emerald-600"
                      : (entry.rankChange ?? 0) < 0
                        ? "text-red-500"
                        : "text-slate-400",
                  )}
                >
                  {entry.rankChange === null
                    ? "—"
                    : `${entry.rankChange > 0 ? "+" : ""}${formatNumber(entry.rankChange, locale)}`}
                </span>
              ),
            },
          ]
        : []),
    ],
    [locale, showRankChange, t],
  );

  const selectPeriod = (value: SchoolLeaderboardPeriod) => {
    setPeriod(value);
    setPageNumber(1);
  };
  const selectMetric = (value: SchoolLeaderboardMetric) => {
    setMetric(value);
    setPageNumber(1);
  };

  if (query.isLoading && !data) return <SchoolHonorBoardSkeleton />;

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title={t("leaderboard.title")}
        description={t("leaderboard.subtitle")}
      />

      {query.isError ? (
        <Card className="rounded-[1.5rem] border-red-100 bg-red-50">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
            <Button variant="outline" onClick={() => void query.refetch()}>{t("common.retry")}</Button>
            <p className="text-sm font-semibold text-red-700">{t("common.loadError")}</p>
          </CardContent>
        </Card>
      ) : null}

      {data ? (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <DashboardStatCard
              label={t("leaderboard.kpis.participants")}
              value={formatNumber(data.kpis.totalParticipants, locale)}
              icon={Users}
              iconTone="primary"
            />
            <DashboardStatCard
              label={t("leaderboard.kpis.totalScore")}
              value={data.kpis.totalPointsLabel || formatCompactNumber(data.kpis.totalPoints, locale)}
              icon={Star}
              iconTone="gold"
            />
            <DashboardStatCard
              label={t("leaderboard.kpis.participation")}
              value={data.kpis.participationRateLabel || `${formatNumber(data.kpis.participationRate, locale)}%`}
              icon={TrendingUp}
              iconTone="success"
            />
            {data.kpis.topSchoolName ? (
              <DashboardStatCard
                label={t("leaderboard.kpis.topSchool")}
                textClassName="text-md"
                value={
                  data.kpis.topSchoolRank
                    ? `${data.kpis.topSchoolName} · #${formatNumber(data.kpis.topSchoolRank, locale)}`
                    : data.kpis.topSchoolName
                }
                icon={Building2}
                iconTone="info"
              />
            ) : null}
          </section>

          <Card className="rounded-[1.75rem] border-white bg-white shadow-[var(--dashboard-shadow-soft)]">
            <CardContent className="space-y-10 p-5 sm:p-7">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <SearchableSelect
                  value={period}
                  onChange={(value) => selectPeriod(value as SchoolLeaderboardPeriod)}
                  options={data.meta.availablePeriods.map((item) => ({
                    value: item,
                    label: t(`leaderboard.period.${item}`),
                  }))}
                  className="w-44 gap-0"
                  triggerClassName="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-none"
                />
                <DashboardSegmentedControl
                  value={metric}
                  onChange={selectMetric}
                  options={data.meta.availableMetrics.map((item) => ({
                    id: item,
                    label: t(`leaderboard.metric.${item}`),
                  }))}
                />
              </div>
              {podium.length ? (
                <div className="grid items-end gap-5 pt-5 md:grid-cols-3">
                  {podium.map((entry) => <PodiumCard key={entry.userId || entry.rank} entry={entry} locale={locale} featured={entry.rank === 1} />)}
                </div>
              ) : <p className="py-16 text-center text-sm text-slate-500">{t("leaderboard.empty")}</p>}
            </CardContent>
          </Card>

          <DashboardTableCard
            title={t("leaderboard.remaining.title")}
            actions={
              <span className="text-xs text-slate-400">
                {t("leaderboard.remaining.range", {
                  from: data.others.length ? (pageNumber - 1) * PAGE_SIZE + 4 : 0,
                  to: data.others.length
                    ? (pageNumber - 1) * PAGE_SIZE + data.others.length + 3
                    : 0,
                })}
              </span>
            }
            footer={
              data.totalPages > 1 ? (
                <DashboardPagination
                  pages={pages}
                  currentPage={pageNumber}
                  onPageChange={setPageNumber}
                  previousLabel={t("common.previous")}
                  nextLabel={t("common.next")}
                />
              ) : undefined
            }
          >
            <DashboardDataTable
              rows={data.others}
              columns={columns}
              getRowKey={(entry) => entry.userId || entry.studentProfileId}
              emptyMessage={t("leaderboard.empty")}
              // tableClassName="min-w-[680px]"
            />
          </DashboardTableCard>

          <section className={cn("grid gap-4", data.meta.nextUpdateCountdown || data.meta.nextUpdateAt ? "md:grid-cols-2" : "")}>
            <Card className="rounded-[1.5rem] border-transparent bg-[#2C4260] text-white">
              <CardContent className="flex items-center justify-between p-6">
                <div className="text-start">
                  <p className="font-semibold">{t("leaderboard.meta.competitors")}</p>
                  <p className="mt-1 text-3xl font-bold">{formatNumber(data.meta.totalCompetitors, locale)}</p>
                </div>
                <Users className="h-12 w-12 text-white/15" />
              </CardContent>
            </Card>
            {data.meta.nextUpdateCountdown || data.meta.nextUpdateAt ? 
              <Card className="rounded-[1.5rem] border-[#E7D8A9] bg-[#F8EFD5]">
                <CardContent className="flex items-center justify-between p-6">
                  <div className="text-start">
                    <p className="font-semibold text-[#826A28]">{t("leaderboard.meta.nextUpdate")}</p>
                    <p className="mt-2 font-bold text-slate-800">{data.meta.nextUpdateCountdown || formatNextUpdate(data.meta.nextUpdateAt, locale)}</p>
                  </div>
                  <Award className="h-10 w-10 text-[#B29132]" />
                  </CardContent>
                </Card> 
              : null}
          </section>
        </>
      ) : null}
    </div>
  );
}
