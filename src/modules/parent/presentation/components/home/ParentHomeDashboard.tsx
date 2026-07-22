"use client";

import { useTranslations } from "next-intl";
import { useParentHomeDashboard } from "@/modules/parent/application/hooks/useParentHomeDashboard";
import { ParentWelcomeCard } from "@/modules/parent/presentation/components/home/ParentWelcomeCard";
import { ParentHomeStatsSection } from "@/modules/parent/presentation/components/home/ParentHomeStatsSection";
import { ParentChildrenOverview } from "@/modules/parent/presentation/components/home/ParentChildrenOverview";
import {
  ParentIndicatorsCard,
  ParentLeaderboardCard,
  ParentRecentActivityCard,
} from "@/modules/parent/presentation/components/home/ParentHomeSidePanels";
import { ParentHomeDashboardSkeleton } from "@/modules/parent/presentation/components/home/ParentDashboardSkeletons";
import { Button } from "@/shared/presentation/components/ui/button";

export function ParentHomeDashboard() {
  const t = useTranslations("parent.dashboard.common");
  const { data, isLoading, isError, refetch, isFetching } = useParentHomeDashboard();

  if (isLoading) {
    return <ParentHomeDashboardSkeleton />;
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-[20px] border border-red-100 bg-white p-6">
        <p className="text-sm text-red-600">{t("error")}</p>
        <Button type="button" onClick={() => refetch()} disabled={isFetching}>
          {t("retry")}
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full flex-col gap-8 pb-8">
      <ParentWelcomeCard
        fullName={data.fullName}
        profileImageUrl={data.profileImageUrl}
      />

      <ParentHomeStatsSection data={data} />

      <div className="grid gap-6 xl:grid-cols-12">
        <div className="space-y-6 xl:col-span-8">
          <ParentChildrenOverview childrenList={data.children} />
          <ParentRecentActivityCard activities={data.recentActivities} />
        </div>
        <div className="space-y-6 xl:col-span-4">
          <ParentLeaderboardCard entries={data.schoolLeaderboard} />
          <ParentIndicatorsCard summary={data.summary} />
        </div>
      </div>
    </div>
  );
}
