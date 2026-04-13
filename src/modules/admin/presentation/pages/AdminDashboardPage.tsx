"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { DashboardTabPage } from "@/shared/presentation/components/dashboard";
import { SchoolManagementDashboard } from "../components/dashboard/SchoolManagementDashboard";
import { UserManagementDashboard } from "../components/dashboard/UserManagementDashboard";

const ADMIN_TAB_IDS = [
  "home",
  "userManagement",
  "schoolManagement",
  "contentManagement",
  "journeyEditor",
  "liveBroadcast",
  "interactiveBooks",
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

  if (tab === "schoolManagement") {
    return <SchoolManagementDashboard />;
  }

  if (tab === "userManagement") {
    return <UserManagementDashboard />;
  }

  return (
    <DashboardTabPage
      homeLabel={t("tabs.home.title")}
      title={t(`tabs.${tab}.title`)}
      description={t(`tabs.${tab}.description`)}
    />
  );
}
