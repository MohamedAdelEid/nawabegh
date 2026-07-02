"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  Eye,
  RefreshCw,
  Star,
  Swords,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useFriendChallengesDashboard } from "@/modules/admin/application/hooks/useFriendChallengesDashboard";
import type { FriendChallengeListItem } from "@/modules/admin/domain/types/friendChallenges.types";
import {
  difficultyTone,
  formatChallengeDateTime,
  formatPercent,
  resolveWinnerName,
} from "@/modules/admin/domain/utils/friendChallengesDisplay";
import { getSubjectsPage } from "@/modules/admin/infrastructure/api/subjectApi";
import { DisabledFeatureButton } from "@/modules/admin/presentation/components/results-analytics/DisabledFeatureButton";
import { DailyChallengeRateChart } from "@/modules/admin/presentation/components/friend-challenges/charts/DailyChallengeRateChart";
import { DifficultyDistributionDonut } from "@/modules/admin/presentation/components/friend-challenges/charts/DifficultyDistributionDonut";
import { FriendChallengesDashboardSkeleton } from "@/modules/admin/presentation/components/friend-challenges/FriendChallengesDashboardSkeleton";
import { FriendChallengesFilterBar } from "@/modules/admin/presentation/components/friend-challenges/FriendChallengesFilterBar";
import { notify } from "@/shared/application/lib/toast";
import {
  DashboardBadge,
  DashboardDataTable,
  type DashboardDataTableColumn,
  DashboardPageHeader,
  DashboardPagination,
  DashboardStatCard,
  DashboardTableCard,
} from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import { UserAvatarImageOrInitials } from "@/shared/presentation/components/user";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { cn } from "@/shared/application/lib/cn";

function SuccessRateRing({ percent }: { percent: number }) {
  const clamped = Math.min(100, Math.max(0, percent));
  return (
    <div
      className="relative flex h-14 w-14 items-center justify-center rounded-full"
      style={{
        background: `conic-gradient(#22c55e ${clamped * 3.6}deg, #E2E8F0 0deg)`,
      }}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-xs font-bold text-emerald-600">
        {Math.round(clamped)}%
      </div>
    </div>
  );
}

export function FriendChallengesDashboard() {
  const t = useTranslations("admin.dashboard.friendChallenges");
  const locale = useLocale();
  const router = useRouter();
  const dashboard = useFriendChallengesDashboard();
  const data = dashboard.data;

  const [subjectOptions, setSubjectOptions] = useState<Array<{ value: string; label: string }>>([]);

  useEffect(() => {
    if (dashboard.errorMessage) notify.error(dashboard.errorMessage);
  }, [dashboard.errorMessage]);

  useEffect(() => {
    void (async () => {
      const result = await getSubjectsPage({ keyword: "", pageNumber: 1, pageSize: 500 });
      if (result.data?.rows?.length) {
        setSubjectOptions(
          result.data.rows.map((subject) => ({
            value: String(subject.id),
            label: locale.startsWith("ar")
              ? subject.nameAr || subject.nameEn
              : subject.nameEn || subject.nameAr,
          })),
        );
      }
    })();
  }, [locale]);

  const handleViewDetail = useCallback(
    (row: FriendChallengeListItem) => {
      router.push(ROUTES.ADMIN.FRIEND_CHALLENGES.DETAIL(row.friendChallengeId));
    },
    [router],
  );

  const columns = useMemo<Array<DashboardDataTableColumn<FriendChallengeListItem>>>(
    () => [
      {
        id: "challengers",
        header: t("overview.table.challengers"),
        renderCell: (row) => (
          <div className="flex min-w-[16rem] items-center gap-3">
            <div className="flex -space-x-2 rtl:space-x-reverse">
              <UserAvatarImageOrInitials
                trackKey={row.inviter.studentId}
                name={row.inviter.fullName}
                imageUrl={row.inviter.profileImageUrl}
                size="sm"
                circleClassName="border-2 border-white bg-[#DCE6F5] text-[#2C4260]"
              />
              <UserAvatarImageOrInitials
                trackKey={row.invitee.studentId}
                name={row.invitee.fullName}
                imageUrl={row.invitee.profileImageUrl}
                size="sm"
                circleClassName="border-2 border-white bg-[#F8EFD5] text-[#8F6C0B]"
              />
            </div>
            <div className="space-y-0.5 text-right">
              <p className="font-semibold text-slate-800">
                {row.inviter.fullName} {t("overview.table.vs")} {row.invitee.fullName}
              </p>
              <p className="text-xs text-slate-400">{row.title}</p>
            </div>
          </div>
        ),
      },
      {
        id: "subject",
        header: t("overview.table.subject"),
        cellClassName: "text-slate-600",
        renderCell: (row) => row.subjectName,
      },
      {
        id: "winner",
        header: t("overview.table.winner"),
        renderCell: (row) => {
          const winnerName = resolveWinnerName(row);
          if (!winnerName) {
            return (
              <DashboardBadge tone="neutral" withDot>
                {t("overview.table.tie")}
              </DashboardBadge>
            );
          }
          return (
            <span className="inline-flex items-center gap-1.5 font-medium text-emerald-700">
              <Star className="h-4 w-4 fill-emerald-500 text-emerald-500" aria-hidden />
              {winnerName}
            </span>
          );
        },
      },
      {
        id: "difficulty",
        header: t("overview.table.difficulty"),
        renderCell: (row) => (
          <DashboardBadge tone={difficultyTone(row.difficulty)}>
            {t(`difficulty.${row.difficulty}`)}
          </DashboardBadge>
        ),
      },
      {
        id: "date",
        header: t("overview.table.date"),
        cellClassName: "text-slate-500",
        renderCell: (row) => formatChallengeDateTime(row.challengeDate, undefined, locale),
      },
      {
        id: "points",
        header: t("overview.table.points"),
        renderCell: (row) => {
          const points = row.winnerPointsEarned;
          if (points == null || points === 0) {
            return (
              <DashboardBadge tone="neutral">
                {t("overview.table.zeroPoints")}
              </DashboardBadge>
            );
          }
          return (
            <DashboardBadge tone="success">
              {t("overview.table.pointsEarned", {
                value: new Intl.NumberFormat(locale).format(points),
              })}
            </DashboardBadge>
          );
        },
      },
      {
        id: "actions",
        header: t("overview.table.actions"),
        renderCell: (row) => (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="rounded-xl"
            onClick={() => handleViewDetail(row)}
            aria-label={t("overview.table.viewDetail")}
          >
            <Eye className="h-4 w-4" aria-hidden />
          </Button>
        ),
      },
    ],
    [handleViewDetail, locale, t],
  );

  const kpis = data?.kpis;

  if (dashboard.isLoading && !data) {
    return <FriendChallengesDashboardSkeleton />;
  }

  const challenges = data?.challenges;
  const rows = challenges?.items ?? [];

  return (
    <div className="space-y-8">
      <DashboardPageHeader
        title={t("overview.page.title")}
        description={t("overview.page.description")}
        breadcrumbs={[
          { label: t("breadcrumbs.home"), href: ROUTES.ADMIN.HOME },
          { label: t("breadcrumbs.challenges") },
        ]}
        action={
          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={() => void dashboard.refetch()}
              aria-label={t("overview.page.refresh")}
            >
              <RefreshCw className={cn("h-4 w-4", dashboard.isRefetching && "animate-spin")} />
            </Button>
            <DisabledFeatureButton
              label={t("overview.page.exportReport")}
              tooltip={t("comingSoon")}
              icon={Download}
              variant="outline"
              className="rounded-2xl"
            />
          </div>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DashboardStatCard
          label={t("overview.stats.totalChallenges.label")}
          value={kpis ? new Intl.NumberFormat(locale).format(kpis.totalChallenges) : "—"}
          icon={Swords}
          iconTone="primary"
        />

        <Card className="rounded-[1.75rem] border-white/80 bg-white !shadow-[var(--dashboard-shadow-soft)]">
          <CardContent className="flex items-start justify-between gap-4 p-6">
            <div className="space-y-1.5 text-start">
              <p className="text-sm text-slate-500">{t("overview.stats.successRate.label")}</p>
              <p className="text-4xl font-bold tracking-tight text-slate-800">
                {kpis ? formatPercent(kpis.successRatePercent, locale) : "—"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {kpis ? <SuccessRateRing percent={kpis.successRatePercent} /> : null}
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="h-6 w-6" aria-hidden />
              </div>
            </div>
          </CardContent>
        </Card>

        <DashboardStatCard
          label={t("overview.stats.totalPoints.label")}
          value={
            kpis ? new Intl.NumberFormat(locale).format(kpis.totalPointsEarned) : "—"
          }
          icon={Star}
          iconTone="warning"
        />

        <DashboardStatCard
          label={t("overview.stats.averageDifficulty.label")}
          value={kpis ? t(`difficulty.${kpis.averageDifficulty}`) : "—"}
          icon={AlertTriangle}
          iconTone="danger"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <DifficultyDistributionDonut rows={data?.difficultyDistribution ?? []} />
        <DailyChallengeRateChart rows={data?.dailyChallengeRate ?? []} />
      </section>

      <FriendChallengesFilterBar
        filters={dashboard.filters}
        subjectOptions={subjectOptions}
        onChange={(patch) => dashboard.setFilters((prev) => ({ ...prev, ...patch }))}
      />

      <DashboardTableCard
        title={t("overview.table.title")}
        className={dashboard.isRefetching ? "opacity-60 transition-opacity" : undefined}
      >
        <DashboardDataTable
          columns={columns}
          rows={rows}
          getRowKey={(row) => row.friendChallengeId}
          emptyMessage={t("overview.table.empty")}
        />
        {challenges ? (
          <div className="flex flex-col gap-4 border-t border-slate-100 px-6 py-5 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-slate-500">
              {t("overview.table.showing", {
                from: (challenges.currentPage - 1) * challenges.pageSize + (rows.length ? 1 : 0),
                to: (challenges.currentPage - 1) * challenges.pageSize + rows.length,
                total: challenges.totalCount,
              })}
            </p>
            <DashboardPagination
              pages={dashboard.pages}
              currentPage={dashboard.pageNumber}
              onPageChange={dashboard.setPageNumber}
              previousLabel={t("pagination.previous")}
              nextLabel={t("pagination.next")}
            />
          </div>
        ) : null}
      </DashboardTableCard>
    </div>
  );
}
