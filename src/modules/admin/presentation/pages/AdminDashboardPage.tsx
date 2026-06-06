"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  DashboardNotImplementedState,
  DashboardTabPage,
} from "@/shared/presentation/components/dashboard";
import { ChatGroupsDashboard } from "@/modules/admin/presentation/components/dashboard/ChatGroupsDashboard";
import { InteractiveBooksDashboard } from "@/modules/admin/presentation/components/dashboard/InteractiveBooksDashboard";
import { LiveBroadcastDashboard } from "@/modules/admin/presentation/components/dashboard/LiveBroadcastDashboard";
import { SchoolManagementDashboard } from "@/modules/admin/presentation/components/dashboard/SchoolManagementDashboard";
import { UserManagementDashboard } from "@/modules/admin/presentation/components/dashboard/UserManagementDashboard";
import { ArticleEditorDashboard } from "@/modules/admin/presentation/components/dashboard/ArticleEditorDashboard";
import { ContentManagementDashboard } from "@/modules/admin/presentation/components/dashboard/ContentManagementDashboard";
import { HomeOverviewDashboard } from "@/modules/admin/presentation/components/dashboard/HomeOverviewDashboard";
import { CourseManagementDashboard } from "@/modules/admin/presentation/components/dashboard/CourseManagementDashboard";
import { JourneyEditorDashboard } from "@/modules/admin/presentation/components/dashboard/JourneyEditorDashboard";

const ADMIN_TAB_IDS = [
  "home",
  "userManagement",
  "schoolManagement",
  "contentManagement",
  "courseManagement",
  "articleEditor",
  "journeyEditor",
  "liveBroadcast",
  "interactiveBooks",
  "chatGroups",
  "helper",
] as const;

type AdminTabId = (typeof ADMIN_TAB_IDS)[number];

function isAdminTab(value: string): value is AdminTabId {
  return (ADMIN_TAB_IDS as readonly string[]).includes(value);
}

export function AdminDashboardPage() {
  const t = useTranslations("admin.dashboard");
  const searchParams = useSearchParams();
  const rawTab = searchParams.get("tab") ?? "home";
  const tab: AdminTabId = isAdminTab(rawTab) ? rawTab : "home";

  if (tab === "home") {
    return <HomeOverviewDashboard />;
  }

  if (tab === "schoolManagement") {
    return <SchoolManagementDashboard />;
  }

  if (tab === "userManagement") {
    return <UserManagementDashboard />;
  }

  if (tab === "chatGroups") {
    return <ChatGroupsDashboard />;
  }

  if (tab === "interactiveBooks") {
    return <InteractiveBooksDashboard />;
  }

  if (tab === "liveBroadcast") {
    return <LiveBroadcastDashboard />;
  }

  if (tab === "articleEditor") {
    return <ArticleEditorDashboard />;
  }

  if (tab === "journeyEditor") {
    return <JourneyEditorDashboard />;
  }

  if (tab === "contentManagement") {
    return <ContentManagementDashboard />;
  }

  if (tab === "courseManagement") {
    return <CourseManagementDashboard />;
  }

  return (
    <DashboardTabPage
      homeLabel={t("tabs.home.title")}
      title={t("tabs.helper.title")}
      description={t("tabs.helper.description")}
    >
      <DashboardNotImplementedState
        badge={t("notImplemented.badge")}
        title={t("notImplemented.title")}
        description={t("notImplemented.description")}
      />
    </DashboardTabPage>
  );
}
