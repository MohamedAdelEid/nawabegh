"use client";

import { Suspense } from "react";
import { useTranslations } from "next-intl";
import { TeacherLiveSessionsHubDashboard } from "@/modules/teacher/presentation/components/live-sessions/TeacherLiveSessionsHubDashboard";
import { TeacherLiveSessionsHubSkeleton } from "@/modules/teacher/presentation/components/live-sessions/TeacherLiveSessionsHubSkeleton";

function TeacherLiveSessionsPageFallback() {
  const t = useTranslations("teacher.dashboard");
  return <TeacherLiveSessionsHubSkeleton label={t("common.loading")} />;
}

export function TeacherLiveSessionsPage() {
  return (
    <Suspense fallback={<TeacherLiveSessionsPageFallback />}>
      <TeacherLiveSessionsHubDashboard />
    </Suspense>
  );
}
