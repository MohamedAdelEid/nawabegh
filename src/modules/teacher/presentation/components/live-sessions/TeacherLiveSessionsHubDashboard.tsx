"use client";

import { CalendarDays, Layers } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { TeacherLiveAnalyticsDashboard } from "@/modules/teacher/presentation/components/live-analytics/TeacherLiveAnalyticsDashboard";
import { TeacherLiveSessionsDashboard } from "@/modules/teacher/presentation/components/live-sessions/TeacherLiveSessionsDashboard";
import { DashboardPageHeader } from "@/shared/presentation/components/dashboard/DashboardPageHeader";
import { DashboardSegmentedControl } from "@/shared/presentation/components/dashboard/DashboardSegmentedControl";
import { Button } from "@/shared/presentation/components/ui/button";
import { ROUTES } from "@/shared/infrastructure/config/routes";

export type TeacherLiveSessionsTab = "analytics" | "manage";

function parseTab(value: string | null): TeacherLiveSessionsTab {
  return value === "manage" ? "manage" : "analytics";
}

export function TeacherLiveSessionsHubDashboard() {
  const t = useTranslations("teacher.dashboard");
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = parseTab(searchParams.get("tab"));

  const setTab = (next: TeacherLiveSessionsTab) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", next);
    router.replace(`${ROUTES.USER.TEACHER.LIVE_SESSIONS}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title={t("liveSessionsHub.title")}
        description={t("liveSessionsHub.description")}
        action={
          <div className="flex flex-wrap items-center gap-3">
            <DashboardSegmentedControl<TeacherLiveSessionsTab>
              options={[
                { id: "analytics", label: t("liveSessionsHub.tabs.analytics") },
                { id: "manage", label: t("liveSessionsHub.tabs.manage") },
              ]}
              value={tab}
              onChange={setTab}
            />
            <Button variant="outline" className="rounded-xl" asChild>
              <Link href={ROUTES.USER.TEACHER.SCHEDULE}>
                <CalendarDays className="ml-2 h-4 w-4" />
                {t("liveSessionsHub.actions.schedule")}
              </Link>
            </Button>
            <Button className="rounded-xl bg-[#2C4260] hover:bg-[#2C4260]/90" asChild>
              <Link href={ROUTES.USER.TEACHER.JOURNEY_EDITOR.LIST}>
                <Layers className="ml-2 h-4 w-4" />
                {t("liveSessionsHub.actions.journeyEditor")}
              </Link>
            </Button>
          </div>
        }
      />

      {tab === "analytics" ? (
        <TeacherLiveAnalyticsDashboard embedded onManageSessions={() => setTab("manage")} />
      ) : (
        <TeacherLiveSessionsDashboard embedded />
      )}
    </div>
  );
}
