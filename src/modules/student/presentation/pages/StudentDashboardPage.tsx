"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { DashboardTabPage } from "@/shared/presentation/components/dashboard";

const STUDENT_TAB_IDS = [
  "home",
  "journey",
  "studyMaterials",
  "interactiveBook",
  "helpFiles",
  "helper",
] as const;

type StudentTabId = (typeof STUDENT_TAB_IDS)[number];

function isStudentTab(value: string): value is StudentTabId {
  return (STUDENT_TAB_IDS as readonly string[]).includes(value);
}

export function StudentDashboardPage() {
  const t = useTranslations("student.dashboard");
  const searchParams = useSearchParams();
  const rawTab = searchParams.get("tab") ?? "home";
  const tab: StudentTabId = isStudentTab(rawTab) ? rawTab : "home";

  return (
    <DashboardTabPage
      homeLabel={t("tabs.home.title")}
      title={t(`tabs.${tab}.title`)}
      description={t(`tabs.${tab}.description`)}
    />
  );
}
