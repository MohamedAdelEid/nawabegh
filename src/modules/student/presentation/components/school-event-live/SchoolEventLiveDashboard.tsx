"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  DashboardBreadcrumb,
  DashboardPageHeader,
} from "@/shared/presentation/components/dashboard";
import { ApiFailureAlert } from "@/shared/presentation/components/ui/ApiFailureAlert";
import { Button } from "@/shared/presentation/components/ui/button";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import {
  useSchoolEventLive,
  type SchoolEventLiveInitialData,
} from "@/modules/student/application/hooks/useSchoolEventLive";
import type { SchoolEventLiveTab } from "@/modules/student/domain/types/schoolEvent.types";
import { SchoolEventActivityFeed } from "./SchoolEventActivityFeed";
import { SchoolEventLiveHero } from "./SchoolEventLiveHero";
import {
  SchoolEventHonorBoardPanel,
  SchoolEventSchedulePanel,
} from "./SchoolEventLivePanels";
import { SchoolEventLivePoll } from "./SchoolEventLivePoll";
import { SchoolEventLiveScoreCard } from "./SchoolEventLiveScoreCard";
import { SchoolEventLivePageSkeleton } from "./SchoolEventLiveSkeleton";
import { SchoolEventLiveTabs } from "./SchoolEventLiveTabs";
import { SchoolEventNextMatchCard } from "./SchoolEventNextMatchCard";
import { SchoolEventTeamStandings } from "./SchoolEventTeamStandings";

type SchoolEventLiveDashboardProps = {
  eventId: string;
  initial?: SchoolEventLiveInitialData;
};

export function SchoolEventLiveDashboard({
  eventId,
  initial,
}: SchoolEventLiveDashboardProps) {
  const t = useTranslations("student.dashboard.schoolEventLive");

  const {
    liveQuery,
    dashboard,
    activeTab,
    setActiveTab,
    timerLabel,
    refreshFeed,
    votePoll,
    isVoting,
  } = useSchoolEventLive({ eventId, initial });

  const tabOptions: { value: SchoolEventLiveTab; label: string }[] = [
    { value: "live", label: t("tabs.live") },
    { value: "schedule", label: t("tabs.schedule") },
    { value: "honorBoard", label: t("tabs.honorBoard") },
  ];

  const error =
    liveQuery.error instanceof Error ? liveQuery.error.message : null;

  if (liveQuery.isLoading && !dashboard) {
    return <SchoolEventLivePageSkeleton />;
  }

  if (error || !dashboard) {
    return (
      <div className="space-y-4">
        <ApiFailureAlert message={error} fallbackMessage={t("errors.notFound")} />
        <div className="flex justify-center">
          <Button asChild variant="outline">
            <Link href={ROUTES.USER.STUDENT.EVENTS}>{t("errors.backToEvents")}</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <DashboardBreadcrumb
          items={[
            { label: t("page.breadcrumbHome"), href: ROUTES.USER.STUDENT.HOME },
            {
              label: t("page.breadcrumbEvents"),
              href: ROUTES.USER.STUDENT.EVENTS,
            },
            { label: dashboard.title },
          ]}
        />
        <DashboardPageHeader
          title={t("page.title")}
          description={t("page.description")}
        />
      </div>

      <SchoolEventLiveHero
        title={dashboard.title}
        description={dashboard.description}
        seriesLabel={dashboard.seriesLabel}
        liveStatusLabel={dashboard.liveStatusLabel}
        isLive={dashboard.isLive}
        bannerImageUrl={dashboard.bannerImageUrl}
      />

      <SchoolEventLiveTabs
        value={activeTab}
        options={tabOptions}
        onChange={setActiveTab}
      />

      {activeTab === "live" ? (
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-8">
            <SchoolEventLiveScoreCard
              match={dashboard.currentMatch}
              timerLabel={timerLabel}
              isLive={dashboard.isLive}
            />
            <SchoolEventActivityFeed
              items={dashboard.activityFeed}
              onRefresh={refreshFeed}
              isRefreshing={liveQuery.isFetching}
            />
          </div>

          <div className="space-y-6 lg:col-span-4">
            {dashboard.activePoll ? (
              <SchoolEventLivePoll
                poll={dashboard.activePoll}
                onVote={votePoll}
                isVoting={isVoting}
              />
            ) : null}
            <SchoolEventTeamStandings standings={dashboard.teamStandings} />
            {dashboard.nextMatch ? (
              <SchoolEventNextMatchCard nextMatch={dashboard.nextMatch} />
            ) : null}
          </div>
        </div>
      ) : null}

      {activeTab === "schedule" ? (
        <SchoolEventSchedulePanel matches={dashboard.scheduleMatches} />
      ) : null}

      {activeTab === "honorBoard" ? (
        <SchoolEventHonorBoardPanel entries={dashboard.honorBoard} />
      ) : null}
    </div>
  );
}
