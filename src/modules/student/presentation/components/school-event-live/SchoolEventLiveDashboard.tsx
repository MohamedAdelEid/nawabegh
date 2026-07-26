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
import { useStudentHomeProfile } from "@/modules/student/application/hooks/useStudentHomeDashboard";
import {
  useSchoolEventLive,
  type SchoolEventLiveInitialData,
} from "@/modules/student/application/hooks/useSchoolEventLive";
import { isValidStudentSchoolEventId } from "@/modules/student/domain/utils/schoolEventId";
import type { SchoolEventLiveTab } from "@/modules/student/domain/types/schoolEvent.types";
import {
  hasLinkedSchool,
  StudentSchoolLinkGate,
} from "@/modules/student/presentation/components/school-events/StudentSchoolLinkGate";
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
  const tEvents = useTranslations("student.dashboard.schoolEvents");
  const profileQuery = useStudentHomeProfile();
  const linked = hasLinkedSchool(profileQuery.data);
  const eventIdInvalid = !isValidStudentSchoolEventId(eventId);

  const {
    liveQuery,
    matchesQuery,
    honorQuery,
    standingsQuery,
    dashboard,
    activeTab,
    setActiveTab,
    showFullStandings,
    setShowFullStandings,
    timerLabel,
    refreshFeed,
    isRefreshingFeed,
    votePoll,
    isVoting,
  } = useSchoolEventLive({
    eventId,
    initial,
    enabled: linked && !eventIdInvalid,
  });

  const tabOptions: { value: SchoolEventLiveTab; label: string }[] = [
    { value: "live", label: t("tabs.live") },
    { value: "matches", label: t("tabs.matches") },
    { value: "honorBoard", label: t("tabs.honorBoard") },
  ];

  const error =
    liveQuery.error instanceof Error ? liveQuery.error.message : null;

  if (profileQuery.isLoading && !profileQuery.data) {
    return <SchoolEventLivePageSkeleton />;
  }

  if (!linked && profileQuery.data) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <DashboardBreadcrumb
            items={[
              { label: t("page.breadcrumbHome"), href: ROUTES.USER.STUDENT.HOME },
              {
                label: t("page.breadcrumbMySchool"),
                href: ROUTES.USER.STUDENT.SCHOOL,
              },
              {
                label: t("page.breadcrumbEvents"),
                href: ROUTES.USER.STUDENT.EVENTS,
              },
              { label: tEvents("linkSchool.title") },
            ]}
          />
          <DashboardPageHeader
            title={t("page.title")}
            description={t("page.description")}
          />
        </div>
        <StudentSchoolLinkGate profile={profileQuery.data} />
      </div>
    );
  }

  if (eventIdInvalid) {
    return (
      <div className="space-y-4">
        <ApiFailureAlert fallbackMessage={t("errors.notFound")} />
        <div className="flex justify-center">
          <Button asChild variant="outline">
            <Link href={ROUTES.USER.STUDENT.EVENTS}>{t("errors.backToEvents")}</Link>
          </Button>
        </div>
      </div>
    );
  }

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

  const standings =
    showFullStandings && standingsQuery.data
      ? standingsQuery.data
      : dashboard.standings;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <DashboardBreadcrumb
          items={[
            { label: t("page.breadcrumbHome"), href: ROUTES.USER.STUDENT.HOME },
            {
              label: t("page.breadcrumbMySchool"),
              href: ROUTES.USER.STUDENT.SCHOOL,
            },
            {
              label: t("page.breadcrumbEvents"),
              href: ROUTES.USER.STUDENT.EVENTS,
            },
            { label: dashboard.hero.title },
          ]}
        />
        <DashboardPageHeader
          title={t("page.title")}
          description={t("page.description")}
        />
      </div>

      <SchoolEventLiveHero
        title={dashboard.hero.title}
        description={dashboard.hero.description}
        seriesLabel={dashboard.hero.seriesLabel}
        liveStatusLabel={dashboard.hero.statusLabel}
        isLive={dashboard.hero.isLive}
        bannerImageUrl={dashboard.hero.bannerImageUrl}
      />

      <SchoolEventLiveTabs
        value={activeTab}
        options={tabOptions}
        onChange={setActiveTab}
      />

      {activeTab === "live" ? (
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-8">
            {dashboard.score ? (
              <SchoolEventLiveScoreCard
                score={dashboard.score}
                timerLabel={timerLabel}
                isLive={dashboard.hero.isLive}
              />
            ) : (
              <p className="rounded-[1.5rem] border border-dashed border-slate-200 bg-white px-6 py-12 text-center text-slate-500">
                {t("score.empty")}
              </p>
            )}
            <SchoolEventActivityFeed
              items={dashboard.feed}
              onRefresh={() => void refreshFeed()}
              isRefreshing={isRefreshingFeed}
            />
          </div>

          <div className="space-y-6 lg:col-span-4">
            {dashboard.poll ? (
              <SchoolEventLivePoll
                poll={dashboard.poll}
                onVote={votePoll}
                isVoting={isVoting}
              />
            ) : null}
            <SchoolEventTeamStandings
              standings={standings}
              showViewFull={!showFullStandings}
              onViewFull={() => setShowFullStandings(true)}
              isLoadingFull={standingsQuery.isFetching}
            />
            {dashboard.nextMatch ? (
              <SchoolEventNextMatchCard nextMatch={dashboard.nextMatch} />
            ) : null}
          </div>
        </div>
      ) : null}

      {activeTab === "matches" ? (
        <SchoolEventSchedulePanel
          matches={matchesQuery.data ?? []}
          isLoading={matchesQuery.isLoading}
        />
      ) : null}

      {activeTab === "honorBoard" ? (
        <SchoolEventHonorBoardPanel
          entries={honorQuery.data ?? []}
          isLoading={honorQuery.isLoading}
        />
      ) : null}
    </div>
  );
}
