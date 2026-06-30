"use client";

import { useTranslations } from "next-intl";

export function SchoolSettingsPage() {
  const t = useTranslations("school.dashboard");

  return (
    <div className="space-y-2 rounded-[1.75rem] border border-white/80 bg-white p-8 shadow-[var(--dashboard-shadow-soft)]">
      <h1 className="text-2xl font-bold text-slate-800">{t("settingsPage.title")}</h1>
      <p className="text-sm text-slate-500">{t("settingsPage.description")}</p>
    </div>
  );
}
