"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowDown,
  ArrowUp,
  Globe2,
  Medal,
  Swords,
  Trophy,
  Users,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useSchoolTeamRankings } from "@/modules/school/application/hooks/useSchoolEvents";
import type {
  SchoolTeamRankingEntry,
  SchoolTeamRankingScope,
} from "@/modules/school/domain/types/schoolEvents.types";
import { cn } from "@/shared/application/lib/cn";
import { formatCompactNumber, formatNumber } from "@/shared/application/lib/format";
import { resolveFileUrl } from "@/shared/infrastructure/files/fileUrl";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import {
  DashboardDataTable,
  type DashboardDataTableColumn,
  DashboardPageHeader,
  DashboardPagination,
  DashboardStatCard,
  DashboardTableCard,
} from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";
import { SearchableSelect } from "@/shared/presentation/components/ui/searchable-select";
import { UserAvatarImageOrInitials } from "@/shared/presentation/components/user/UserAvatarImageOrInitials";
import { SchoolTeamAvatar } from "./SchoolTeamAvatar";
import { SchoolTeamRankingsSkeleton } from "./SchoolEventsSkeletons";

const PAGE_SIZE = 10;

function buildPages(currentPage: number, totalPages: number) {
  const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
  const end = Math.min(totalPages, start + 4);
  return Array.from({ length: Math.max(1, end - start + 1) }, (_, index) => start + index);
}

function MembersCell({
  members,
  memberCount,
  locale,
  membersCountLabel,
}: {
  members: SchoolTeamRankingEntry["memberPreview"];
  memberCount: number;
  locale: string;
  membersCountLabel: string;
}) {
  const visible = members.slice(0, 3);
  const remaining = Math.max(memberCount, members.length) - visible.length;

  if (visible.length === 0) {
    return (
      <span className="text-sm font-medium text-slate-600">{membersCountLabel}</span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-2 space-x-reverse">
        {visible.map((member) => (
          <div key={member.userId} title={member.fullName || member.userId}>
            <UserAvatarImageOrInitials
              trackKey={member.userId}
              name={member.fullName || member.userId}
              imageUrl={resolveFileUrl(member.avatarUrl)}
              size="sm"
              circleClassName="bg-[#E8EEF7] text-[#1e3a5f] ring-2 ring-white"
            />
          </div>
        ))}
        {remaining > 0 ? (
          <span
            title={membersCountLabel}
            className="relative z-[1] inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-[#1e3a5f] text-xs font-bold text-white ring-2 ring-white"
          >
            +{formatNumber(remaining, locale)}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <span className="inline-flex size-9 items-center justify-center rounded-full bg-amber-100 text-amber-700">
        <Trophy className="size-4" />
      </span>
    );
  }
  if (rank === 2) {
    return (
      <span className="inline-flex size-9 items-center justify-center rounded-full bg-slate-200 text-slate-600">
        <Medal className="size-4" />
      </span>
    );
  }
  if (rank === 3) {
    return (
      <span className="inline-flex size-9 items-center justify-center rounded-full bg-orange-100 text-orange-700">
        <Medal className="size-4" />
      </span>
    );
  }
  return (
    <span className="inline-flex size-9 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">
      {rank}
    </span>
  );
}

export function SchoolTeamRankingsDashboard() {
  const t = useTranslations("school.dashboard.events.rankings");
  const common = useTranslations("school.dashboard.events.common");
  const locale = useLocale();
  const [schoolScope, setSchoolScope] = useState<SchoolTeamRankingScope>("all");
  const [pageNumber, setPageNumber] = useState(1);
  const query = useSchoolTeamRankings({
    schoolScope,
    pageNumber,
    pageSize: PAGE_SIZE,
  });

  const data = query.data;
  const pages = useMemo(
    () => buildPages(pageNumber, data?.totalPages ?? 1),
    [data?.totalPages, pageNumber],
  );

  const columns = useMemo<DashboardDataTableColumn<SchoolTeamRankingEntry>[]>(
    () => [
      {
        id: "rank",
        header: t("table.rank"),
        renderCell: (row) => <RankBadge rank={row.rank} />,
      },
      {
        id: "team",
        header: t("table.team"),
        renderCell: (row) => (
          <div className="flex min-w-[12rem] items-center gap-3">
            <SchoolTeamAvatar
              name={row.teamName}
              logoUrl={row.logoUrl}
              size="sm"
              className="mx-0"
            />
            <div className="min-w-0">
              <p className="line-clamp-2 font-semibold text-slate-800">{row.teamName}</p>
              {row.schoolName ? (
                <p className="truncate text-xs text-slate-500">{row.schoolName}</p>
              ) : null}
            </div>
          </div>
        ),
      },
      {
        id: "points",
        header: t("table.points"),
        renderCell: (row) => (
          <span className="inline-flex rounded-lg bg-amber-50 px-3 py-1 font-bold text-amber-800">
            {formatNumber(row.points, locale)}
          </span>
        ),
      },
      {
        id: "wins",
        header: t("table.wins"),
        renderCell: (row) => (
          <div className="flex min-w-36 items-center gap-2">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-emerald-50">
              <div
                className="h-full rounded-full bg-emerald-500"
                style={{
                  width: `${Math.min(100, row.winsCount * 8)}%`,
                }}
              />
            </div>
            <span className="text-sm font-semibold text-slate-700">
              {formatNumber(row.winsCount, locale)}
            </span>
          </div>
        ),
      },
      {
        id: "members",
        header: t("table.members"),
        renderCell: (row) => (
          <MembersCell
            members={row.memberPreview}
            memberCount={row.memberCount}
            locale={locale}
            membersCountLabel={t("table.membersCount", {
              count: formatNumber(row.memberCount, locale),
            })}
          />
        ),
      },
      {
        id: "change",
        header: "",
        renderCell: (row) =>
          row.rankChange != null && row.rankChange !== 0 ? (
            <span
              className={cn(
                "inline-flex items-center gap-1 text-sm font-semibold",
                row.rankChange > 0 ? "text-emerald-600" : "text-rose-600",
              )}
            >
              {row.rankChange > 0 ? (
                <ArrowUp className="size-3.5" />
              ) : (
                <ArrowDown className="size-3.5" />
              )}
              {row.rankChangeLabel || Math.abs(row.rankChange)}
            </span>
          ) : null,
      },
    ],
    [locale, t],
  );

  if (query.isLoading) return <SchoolTeamRankingsSkeleton />;

  if (query.isError || !data) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
        <p>{common("loadError")}</p>
        <Button className="mt-4" variant="outline" onClick={() => void query.refetch()}>
          {common("retry")}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-sm text-slate-500">
        <Link href={ROUTES.USER.SCHOOL.HOME} className="hover:underline">
          {t("breadcrumbs.home")}
        </Link>
        {" > "}
        <Link href={ROUTES.USER.SCHOOL.EVENTS.LIST} className="hover:underline">
          {t("breadcrumbs.events")}
        </Link>
        {" > "}
        <span className="text-slate-700">{t("breadcrumbs.current")}</span>
      </div>

      <DashboardPageHeader title={t("title")} description={t("subtitle")} />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <DashboardStatCard
          label={t("kpis.totalTeams")}
          value={formatNumber(data.kpis.totalTeams, locale)}
          icon={Users}
        />
        <DashboardStatCard
          label={t("kpis.activeChallenges")}
          value={formatNumber(data.kpis.activeChallenges, locale)}
          icon={Swords}
        />
        <DashboardStatCard
          label={t("kpis.seasonPoints")}
          value={
            data.kpis.seasonPointsLabel ||
            formatCompactNumber(data.kpis.seasonPoints, locale)
          }
          icon={Trophy}
          iconTone="gold"
        />
        <DashboardStatCard
          label={t("kpis.globalRank")}
          value={data.kpis.globalRankLabel}
          icon={Globe2}
        />
      </motion.div>

      <div className="max-w-xs">
        <SearchableSelect
          label={t("filters.scope")}
          value={schoolScope}
          onChange={(value) => {
            setSchoolScope(value as SchoolTeamRankingScope);
            setPageNumber(1);
          }}
          options={[
            { value: "all", label: t("filters.all") },
            { value: "own", label: t("filters.own") },
          ]}
        />
      </div>

      <DashboardTableCard
        footer={
          <DashboardPagination
            pages={pages}
            currentPage={pageNumber}
            onPageChange={setPageNumber}
            previousLabel={t("previous")}
            nextLabel={t("next")}
          />
        }
      >
        <DashboardDataTable
          columns={columns}
          rows={data.items}
          getRowKey={(row) => String(row.teamId || row.rank)}
          emptyMessage={t("table.empty")}
        />
      </DashboardTableCard>

      <div className="flex justify-end">
        <Button asChild className="rounded-xl bg-[#c4a574] text-white hover:bg-[#b39463]">
          <Link href={ROUTES.USER.SCHOOL.EVENTS.TEAMS_CREATE}>{t("createTeam")}</Link>
        </Button>
      </div>
    </div>
  );
}
